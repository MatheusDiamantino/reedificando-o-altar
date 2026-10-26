<?php

declare(strict_types=1);

namespace App\Presenters;

final class MensagemPresenter
{
    public static function one(array $row): array
    {
        return [
            'id' => (int) $row['id'],
            'tipo' => $row['tipo'],
            'nome' => $row['nome'],
            'email' => $row['email'],
            'assunto' => $row['assunto'],
            'texto' => $row['texto'],
            'publico' => (bool) $row['publico'],
            'lida' => (bool) $row['lida'],
            'criado_em' => DateFormat::atom($row['criado_em']),
        ];
    }

    public static function many(array $rows): array
    {
        return array_map([self::class, 'one'], $rows);
    }
}
