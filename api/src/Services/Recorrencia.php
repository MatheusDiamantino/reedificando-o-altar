<?php

declare(strict_types=1);

namespace App\Services;

use DateTimeImmutable;

final class Recorrencia
{
    public static function datas(string $inicio, ?string $recorrencia, string $de, string $ate): array
    {
        $start = new DateTimeImmutable($inicio);
        $from = new DateTimeImmutable($de);
        $to = new DateTimeImmutable($ate);

        return match ($recorrencia) {
            'semanal' => self::semanal($start, $from, $to),
            'mensal' => self::mensal($start, $from, $to),
            default => ($start >= $from && $start <= $to) ? [$start->format('Y-m-d')] : [],
        };
    }

    private static function semanal(DateTimeImmutable $start, DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $current = $start;
        if ($current < $from) {
            $weeks = (int) ceil($start->diff($from)->days / 7);
            $current = $start->modify("+{$weeks} weeks");
        }

        $datas = [];
        for (; $current <= $to; $current = $current->modify('+1 week')) {
            $datas[] = $current->format('Y-m-d');
        }
        return $datas;
    }

    private static function mensal(DateTimeImmutable $start, DateTimeImmutable $from, DateTimeImmutable $to): array
    {
        $day = (int) $start->format('d');
        $month = $start->modify('first day of this month');
        $lastMonth = $to->modify('first day of this month');

        $datas = [];
        for (; $month <= $lastMonth; $month = $month->modify('+1 month')) {
            if ($day > (int) $month->format('t')) {
                continue;
            }
            $date = $month->setDate((int) $month->format('Y'), (int) $month->format('m'), $day);
            if ($date >= $start && $date >= $from && $date <= $to) {
                $datas[] = $date->format('Y-m-d');
            }
        }
        return $datas;
    }
}
