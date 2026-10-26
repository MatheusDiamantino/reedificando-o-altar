<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\ApiException;
use App\Support\Database;

final class EventoRepository
{
    private const COLUMNS = 'id, titulo, descricao, data, hora, local, recorrencia';

    public static function all(): array
    {
        return Database::all('SELECT ' . self::COLUMNS . ' FROM eventos ORDER BY data DESC, hora');
    }

    public static function candidatesFor(string $de, string $ate): array
    {
        return Database::all(
            'SELECT ' . self::COLUMNS . ' FROM eventos
             WHERE (recorrencia IS NULL AND data BETWEEN :de AND :ate)
                OR (recorrencia IS NOT NULL AND data <= :ate_recorrente)',
            ['de' => $de, 'ate' => $ate, 'ate_recorrente' => $ate],
        );
    }

    public static function find(int $id): ?array
    {
        return Database::one('SELECT ' . self::COLUMNS . ' FROM eventos WHERE id = :id', ['id' => $id]);
    }

    public static function findOrFail(int $id): array
    {
        return self::find($id) ?? throw ApiException::notFound('Evento não encontrado.');
    }

    public static function create(array $data): int
    {
        return Database::insert('eventos', $data + ['criado_em' => Database::now()]);
    }

    public static function update(int $id, array $data): void
    {
        Database::update('eventos', $id, $data);
    }

    public static function delete(int $id): void
    {
        Database::delete('eventos', $id);
    }
}
