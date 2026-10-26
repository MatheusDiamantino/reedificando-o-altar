<?php

declare(strict_types=1);

namespace App\Services;

use App\Presenters\EventoPresenter;
use App\Repositories\EventoRepository;

final class Agenda
{
    public static function ocorrencias(string $de, string $ate): array
    {
        $out = [];
        foreach (EventoRepository::candidatesFor($de, $ate) as $row) {
            foreach (Recorrencia::datas($row['data'], $row['recorrencia'], $de, $ate) as $data) {
                $out[] = EventoPresenter::occurrence($row, $data);
            }
        }

        usort($out, fn ($a, $b) => [$a['data'], $a['hora'] ?? '99:99'] <=> [$b['data'], $b['hora'] ?? '99:99']);
        return $out;
    }
}
