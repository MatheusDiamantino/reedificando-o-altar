<?php

declare(strict_types=1);

namespace App\Presenters;

final class EventoPresenter
{
    public static function one(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'titulo' => $row['titulo'],
            'descricao' => $row['descricao'],
            'data' => $row['data'],
            'hora' => $row['hora'] ? substr($row['hora'], 0, 5) : null,
            'local' => $row['local'],
            'recorrencia' => $row['recorrencia'],
        ];
    }

    public static function many(array $rows): array
    {
        return array_map([self::class, 'one'], $rows);
    }

    public static function occurrence(array $row, string $data): array
    {
        return ['data' => $data] + self::one($row);
    }
}
