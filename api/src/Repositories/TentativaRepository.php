<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\Database;

final class TentativaRepository
{
    public static function countSince(string $chave, string $desde): int
    {
        return (int) Database::value(
            'SELECT COUNT(*) FROM login_tentativas WHERE chave = :chave AND tentado_em >= :desde',
            ['chave' => $chave, 'desde' => $desde],
        );
    }

    public static function add(string $chave): void
    {
        Database::insert('login_tentativas', ['chave' => $chave, 'tentado_em' => Database::now()]);
    }

    public static function clear(string $chave): void
    {
        Database::run('DELETE FROM login_tentativas WHERE chave = :chave', ['chave' => $chave]);
    }

    public static function purgeBefore(string $limite): void
    {
        Database::run('DELETE FROM login_tentativas WHERE tentado_em < :limite', ['limite' => $limite]);
    }
}
