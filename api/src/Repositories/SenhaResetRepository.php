<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\Database;

final class SenhaResetRepository
{
    public static function replaceFor(int $usuarioId, string $tokenHash, string $expiraEm): void
    {
        self::deleteFor($usuarioId);
        Database::insert('senha_resets', [
            'usuario_id' => $usuarioId,
            'token_hash' => $tokenHash,
            'expira_em' => $expiraEm,
            'usado' => 0,
        ]);
    }

    public static function findValid(string $tokenHash): ?array
    {
        return Database::one(
            'SELECT id, usuario_id FROM senha_resets WHERE token_hash = :hash AND usado = 0 AND expira_em > :agora',
            ['hash' => $tokenHash, 'agora' => Database::now()],
        );
    }

    public static function deleteFor(int $usuarioId): void
    {
        Database::run('DELETE FROM senha_resets WHERE usuario_id = :id', ['id' => $usuarioId]);
    }
}
