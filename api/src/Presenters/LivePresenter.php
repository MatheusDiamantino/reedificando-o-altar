<?php

declare(strict_types=1);

namespace App\Presenters;

use App\Services\Uploads;
use App\Services\YouTube;

final class LivePresenter
{
    public static function one(array $row): array
    {
        $thumbnail = Uploads::url($row['thumbnail']);
        if ($thumbnail === null && $row['plataforma'] === 'youtube' && $row['video_id']) {
            $thumbnail = YouTube::thumbnailUrl($row['video_id']);
        }

        return [
            'id' => (int) $row['id'],
            'titulo' => $row['titulo'],
            'descricao' => $row['descricao'],
            'link' => $row['link'],
            'plataforma' => $row['plataforma'],
            'video_id' => $row['video_id'],
            'thumbnail_url' => $thumbnail,
            'data_live' => DateFormat::atom($row['data_live']),
            'ao_vivo' => (bool) $row['ao_vivo'],
            'destaque' => (bool) $row['destaque'],
        ];
    }

    public static function many(array $rows): array
    {
        return array_map([self::class, 'one'], $rows);
    }

    public static function nullable(?array $row): ?array
    {
        return $row === null ? null : self::one($row);
    }
}
