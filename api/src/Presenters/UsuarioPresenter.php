<?php

declare(strict_types=1);

namespace App\Presenters;

final class UsuarioPresenter
{
    public static function session(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'nome' => $row['nome'],
            'email' => $row['email'],
            'papel' => $row['papel'],
        ];
    }

    public static function one(array $row): array
    {
        return self::session($row) + [
            'ativo' => (bool) $row['ativo'],
            'criado_em' => DateFormat::atom($row['criado_em']),
            'ultimo_login' => DateFormat::atom($row['ultimo_login']),
        ];
    }

    public static function many(array $rows): array
    {
        return array_map([self::class, 'one'], $rows);
    }
}
