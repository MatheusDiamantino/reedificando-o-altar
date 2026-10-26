<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\Database;

final class ConteudoRepository
{
    public static function all(): array
    {
        $out = [];
        foreach (Database::all('SELECT chave, valor FROM conteudo ORDER BY chave') as $row) {
            $out[$row['chave']] = json_decode($row['valor'], true);
        }
        return $out;
    }

    public static function has(string $chave): bool
    {
        return Database::value('SELECT chave FROM conteudo WHERE chave = :chave', ['chave' => $chave]) !== null;
    }

    public static function save(string $chave, mixed $valor): void
    {
        $params = [
            'chave' => $chave,
            'valor' => json_encode($valor, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
            'agora' => Database::now(),
        ];

        if (self::has($chave)) {
            Database::run('UPDATE conteudo SET valor = :valor, atualizado_em = :agora WHERE chave = :chave', $params);
        } else {
            Database::run('INSERT INTO conteudo (chave, valor, atualizado_em) VALUES (:chave, :valor, :agora)', $params);
        }
    }
}
