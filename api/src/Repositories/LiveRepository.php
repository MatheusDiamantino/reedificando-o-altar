<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Support\ApiException;
use App\Support\Database;

final class LiveRepository
{
    private const COLUMNS = 'id, titulo, descricao, link, plataforma, video_id, thumbnail, data_live, ao_vivo, destaque';

    public static function paginate(int $limit, int $offset, ?string $busca): array
    {
        $where = '';
        $params = [];
        if ($busca !== null) {
            $where = 'WHERE titulo LIKE :busca OR descricao LIKE :busca';
            $params['busca'] = '%' . $busca . '%';
        }

        $total = (int) Database::value("SELECT COUNT(*) FROM lives {$where}", $params);
        $rows = Database::all(
            'SELECT ' . self::COLUMNS . " FROM lives {$where} ORDER BY data_live DESC, id DESC LIMIT {$limit} OFFSET {$offset}",
            $params,
        );
        return ['rows' => $rows, 'total' => $total];
    }

    public static function current(): ?array
    {
        return Database::one('SELECT ' . self::COLUMNS . ' FROM lives WHERE ao_vivo = 1 ORDER BY data_live DESC LIMIT 1');
    }

    public static function latestBefore(string $moment): ?array
    {
        return Database::one('SELECT ' . self::COLUMNS . ' FROM lives WHERE data_live <= :momento ORDER BY data_live DESC LIMIT 1', ['momento' => $moment]);
    }

    public static function nextAfter(string $moment): ?array
    {
        return Database::one('SELECT ' . self::COLUMNS . ' FROM lives WHERE data_live > :momento ORDER BY data_live ASC LIMIT 1', ['momento' => $moment]);
    }

    public static function count(): int
    {
        return (int) Database::value('SELECT COUNT(*) FROM lives');
    }

    public static function find(int $id): ?array
    {
        return Database::one('SELECT ' . self::COLUMNS . ' FROM lives WHERE id = :id', ['id' => $id]);
    }

    public static function findOrFail(int $id): array
    {
        return self::find($id) ?? throw ApiException::notFound('Live não encontrada.');
    }

    public static function create(array $data): int
    {
        $now = Database::now();
        return Database::insert('lives', $data + ['criado_em' => $now, 'atualizado_em' => $now]);
    }

    public static function update(int $id, array $data): void
    {
        Database::update('lives', $id, $data + ['atualizado_em' => Database::now()]);
    }

    public static function delete(int $id): void
    {
        Database::delete('lives', $id);
    }

    public static function clearLiveExcept(int $id): void
    {
        Database::run('UPDATE lives SET ao_vivo = 0 WHERE id <> :id AND ao_vivo = 1', ['id' => $id]);
    }
}
