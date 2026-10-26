<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\ApiException;
use App\Support\Database;

final class MensagemRepository
{
    private const COLUMNS = 'id, tipo, nome, email, assunto, texto, publico, lida, criado_em';

    public static function list(?string $tipo, ?bool $lida): array
    {
        $where = [];
        $params = [];
        if ($tipo !== null) {
            $where[] = 'tipo = :tipo';
            $params['tipo'] = $tipo;
        }
        if ($lida !== null) {
            $where[] = 'lida = :lida';
            $params['lida'] = (int) $lida;
        }

        $sql = 'SELECT ' . self::COLUMNS . ' FROM mensagens'
            . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
            . ' ORDER BY criado_em DESC, id DESC LIMIT 200';
        return Database::all($sql, $params);
    }

    public static function unreadByType(): array
    {
        $counts = ['contato' => 0, 'oracao' => 0];
        foreach (Database::all('SELECT tipo, COUNT(*) AS total FROM mensagens WHERE lida = 0 GROUP BY tipo') as $row) {
            $counts[$row['tipo']] = (int) $row['total'];
        }
        return $counts;
    }

    public static function find(int $id): ?array
    {
        return Database::one('SELECT ' . self::COLUMNS . ' FROM mensagens WHERE id = :id', ['id' => $id]);
    }

    public static function findOrFail(int $id): array
    {
        return self::find($id) ?? throw ApiException::notFound('Mensagem não encontrada.');
    }

    public static function create(array $data): int
    {
        return Database::insert('mensagens', $data + ['publico' => 0, 'lida' => 0, 'criado_em' => Database::now()]);
    }

    public static function markRead(int $id, bool $lida): void
    {
        Database::update('mensagens', $id, ['lida' => (int) $lida]);
    }

    public static function delete(int $id): void
    {
        Database::delete('mensagens', $id);
    }
}
