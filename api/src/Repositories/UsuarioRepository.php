<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\ApiException;
use App\Support\Database;

final class UsuarioRepository
{
    private const COLUMNS = 'id, nome, email, papel, ativo, criado_em, ultimo_login, sessao_versao';

    public static function all(): array
    {
        return Database::all('SELECT ' . self::COLUMNS . ' FROM usuarios ORDER BY nome');
    }

    public static function find(int $id): ?array
    {
        return Database::one('SELECT ' . self::COLUMNS . ' FROM usuarios WHERE id = :id', ['id' => $id]);
    }

    public static function findOrFail(int $id): array
    {
        return self::find($id) ?? throw ApiException::notFound('Usuário não encontrado.');
    }

    public static function findWithHashByEmail(string $email): ?array
    {
        return Database::one('SELECT ' . self::COLUMNS . ', senha_hash FROM usuarios WHERE email = :email', ['email' => $email]);
    }

    public static function findActiveByEmail(string $email): ?array
    {
        return Database::one('SELECT ' . self::COLUMNS . ' FROM usuarios WHERE email = :email AND ativo = 1', ['email' => $email]);
    }

    public static function emailExists(string $email): bool
    {
        return Database::value('SELECT id FROM usuarios WHERE email = :email', ['email' => $email]) !== null;
    }

    public static function create(array $data): int
    {
        return Database::insert('usuarios', $data + ['ativo' => 1, 'criado_em' => Database::now()]);
    }

    public static function update(int $id, array $data): void
    {
        Database::update('usuarios', $id, $data);
    }

    public static function encerrarSessoes(int $id): void
    {
        Database::run('UPDATE usuarios SET sessao_versao = sessao_versao + 1 WHERE id = :id', ['id' => $id]);
    }

    public static function delete(int $id): void
    {
        Database::delete('usuarios', $id);
    }
}
