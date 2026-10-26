<?php

declare(strict_types=1);

use App\Kernel;
use App\Repositories\EventoRepository;
use App\Repositories\LiveRepository;
use App\Repositories\UsuarioRepository;
use App\Services\Uploads;
use App\Services\YouTube;
use App\Support\Database;
use App\Support\Env;

$appRoot = dirname(__DIR__);
require $appRoot . '/vendor/autoload.php';
Kernel::boot($appRoot);

$dryRun = in_array('--dry-run', $argv, true);

try {
    $legacy = new PDO(
        sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', Env::require('LEGACY_DB_HOST'), Env::require('LEGACY_DB_NAME')),
        Env::require('LEGACY_DB_USER'),
        Env::get('LEGACY_DB_PASS', ''),
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC],
    );
} catch (PDOException $e) {
    fwrite(STDERR, "Não foi possível conectar no banco antigo. Confira LEGACY_DB_HOST, LEGACY_DB_NAME, LEGACY_DB_USER e LEGACY_DB_PASS no .env.\n({$e->getMessage()})\n");
    exit(1);
}

$report = ['lives' => [0, 0], 'eventos' => [0, 0], 'usuarios' => [0, 0], 'capas' => [0, 0]];

foreach ($legacy->query('SELECT id, titulo, descricao, thumbnail, data_live, link FROM lives ORDER BY id') as $row) {
    if (LiveRepository::find((int) $row['id']) !== null) {
        $report['lives'][1]++;
        continue;
    }

    $thumbnail = null;
    if (!$dryRun && !empty($row['thumbnail'])) {
        try {
            $thumbnail = Uploads::storeWebp($row['thumbnail']);
            $report['capas'][0]++;
        } catch (Throwable $e) {
            $report['capas'][1]++;
            fwrite(STDERR, "Live {$row['id']}: capa ignorada ({$e->getMessage()})\n");
        }
    }

    $video = YouTube::parse((string) $row['link']);
    $quando = strtotime((string) $row['data_live']);
    $dataLive = date('H:i:s', $quando) === '00:00:00' ? date('Y-m-d', $quando) . ' 09:00:00' : date('Y-m-d H:i:s', $quando);
    $data = [
        'id' => (int) $row['id'],
        'titulo' => mb_substr(trim(strip_tags((string) $row['titulo'])), 0, 200) ?: 'Live',
        'descricao' => $row['descricao'] !== null ? trim(strip_tags($row['descricao'])) : null,
        'link' => trim((string) $row['link']),
        'plataforma' => $video['plataforma'],
        'video_id' => $video['video_id'],
        'thumbnail' => $thumbnail,
        'data_live' => $dataLive,
        'ao_vivo' => 0,
        'destaque' => 0,
    ];
    if (!$dryRun) {
        LiveRepository::create($data);
    }
    $report['lives'][0]++;
}

foreach ($legacy->query('SELECT id, titulo, descricao, data FROM eventos ORDER BY id') as $row) {
    if (EventoRepository::find((int) $row['id']) !== null) {
        $report['eventos'][1]++;
        continue;
    }
    if (!$dryRun) {
        EventoRepository::create([
            'id' => (int) $row['id'],
            'titulo' => mb_substr(trim(strip_tags((string) $row['titulo'])), 0, 200) ?: 'Evento',
            'descricao' => $row['descricao'] !== null ? trim(strip_tags($row['descricao'])) : null,
            'data' => date('Y-m-d', strtotime((string) $row['data'])),
            'hora' => null,
            'local' => null,
            'recorrencia' => null,
        ]);
    }
    $report['eventos'][0]++;
}

foreach ($legacy->query('SELECT id, email, nome, senha, status FROM user ORDER BY id') as $row) {
    $email = mb_strtolower(trim((string) $row['email']));
    if ($email === '' || UsuarioRepository::emailExists($email)) {
        $report['usuarios'][1]++;
        continue;
    }
    if (!$dryRun) {
        UsuarioRepository::create([
            'nome' => trim((string) $row['nome']) ?: $email,
            'email' => $email,
            'senha_hash' => (string) $row['senha'],
            'papel' => 'admin',
            'ativo' => ($row['status'] ?? '') === 'Ativo' ? 1 : 0,
        ]);
    }
    $report['usuarios'][0]++;
}

if (!$dryRun && Database::driver() === 'mysql') {
    foreach (['lives', 'eventos', 'usuarios'] as $table) {
        $next = (int) Database::value("SELECT COALESCE(MAX(id), 0) + 1 FROM {$table}");
        Database::pdo()->exec("ALTER TABLE {$table} AUTO_INCREMENT = {$next}");
    }
}

echo $dryRun ? "Simulação (nada foi gravado):\n" : "Migração concluída:\n";
printf("  Lives:    %d copiadas, %d já existiam\n", ...$report['lives']);
printf("  Eventos:  %d copiados, %d já existiam\n", ...$report['eventos']);
printf("  Usuários: %d copiados, %d já existiam\n", ...$report['usuarios']);
if (!$dryRun) {
    printf("  Capas:    %d convertidas para WebP, %d com erro\n", ...$report['capas']);
}
