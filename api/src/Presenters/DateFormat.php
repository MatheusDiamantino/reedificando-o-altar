<?php

declare(strict_types=1);

namespace App\Presenters;

final class DateFormat
{
    public static function atom(?string $value): ?string
    {
        return $value === null || $value === '' ? null : (new \DateTimeImmutable($value))->format(DATE_ATOM);
    }
}
