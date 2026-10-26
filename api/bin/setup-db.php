<?php

declare(strict_types=1);

use App\Kernel;
use App\Repositories\ConteudoRepository;
use App\Repositories\EventoRepository;
use App\Repositories\LiveRepository;
use App\Repositories\UsuarioRepository;
use App\Services\Passwords;
use App\Services\YouTube;
use App\Support\Database;
use App\Support\Env;
use App\Support\Settings;

$appRoot = dirname(__DIR__);
require $appRoot . '/vendor/autoload.php';
Kernel::boot($appRoot);

$options = getopt('', ['seed', 'exemplos', 'admin-email:', 'admin-nome:', 'admin-senha:']);
$driver = Database::driver();

if ($driver === 'sqlite') {
    $file = Env::path(Env::get('DB_SQLITE_PATH', 'storage/dev.sqlite'));
    if (!is_dir(dirname($file))) {
        mkdir(dirname($file), 0750, true);
    }
}

$pdo = Database::pdo();

if ($driver === 'mysql' && $pdo->query("SHOW TABLES LIKE 'lives'")->fetchColumn()) {
    $columns = $pdo->query('SHOW COLUMNS FROM lives')->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('plataforma', $columns, true)) {
        fwrite(STDERR, "Este banco tem a tabela \"lives\" do site antigo.\n"
            . "Crie um banco novo na Hostinger para o site novo e use bin/migrate-legacy.php para copiar os dados.\n");
        exit(1);
    }
}

$sql = file_get_contents("{$appRoot}/database/schema.{$driver}.sql");
foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
    $pdo->exec($statement);
}
echo "Tabelas prontas ({$driver}).\n";

if (!isset($options['seed'])) {
    exit(0);
}

foreach (require "{$appRoot}/database/seeds/conteudo.php" as $chave => $valor) {
    if (!ConteudoRepository::has($chave)) {
        ConteudoRepository::save($chave, $valor);
    }
}
echo "Conteúdo padrão gravado.\n";

if (isset($options['admin-email'])) {
    $email = mb_strtolower(trim($options['admin-email']));
    if (UsuarioRepository::emailExists($email)) {
        echo "Usuário {$email} já existe, mantido como está.\n";
    } else {
        $senha = $options['admin-senha'] ?? null;
        if ($senha === null) {
            echo "Senha para {$email}: ";
            $senha = trim((string) fgets(STDIN));
        }
        $minimo = Settings::get('auth.senha_min');
        if (mb_strlen($senha) < $minimo) {
            fwrite(STDERR, "A senha precisa ter pelo menos {$minimo} caracteres. Usuário não criado.\n");
            exit(1);
        }
        UsuarioRepository::create([
            'nome' => $options['admin-nome'] ?? 'Administrador',
            'email' => $email,
            'senha_hash' => Passwords::hash($senha),
            'papel' => 'admin',
        ]);
        echo "Administrador {$email} criado.\n";
    }
}

if (isset($options['exemplos'])) {
    if (LiveRepository::count() > 0) {
        echo "Já existem lives no banco, exemplos não criados.\n";
        exit(0);
    }

    $exemplos = require "{$appRoot}/database/seeds/exemplos.php";
    foreach ($exemplos['lives'] as $live) {
        $video = YouTube::parse($live['link']);
        LiveRepository::create([
            'titulo' => $live['titulo'],
            'descricao' => $live['descricao'],
            'link' => $live['link'],
            'plataforma' => $video['plataforma'],
            'video_id' => $video['video_id'],
            'thumbnail' => null,
            'data_live' => date('Y-m-d 09:00:00', strtotime($live['quando'])),
            'ao_vivo' => 0,
            'destaque' => 0,
        ]);
    }
    foreach ($exemplos['eventos'] as $evento) {
        EventoRepository::create($evento);
    }
    echo "Lives e eventos de exemplo criados.\n";
}
