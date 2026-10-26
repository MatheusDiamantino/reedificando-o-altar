<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\TentativaRepository;
use App\Support\ApiException;

final class RateLimiter
{
    public static function tooMany(string $key, int $max, int $minutes): bool
    {
        return TentativaRepository::countSince($key, date('Y-m-d H:i:s', time() - $minutes * 60)) >= $max;
    }

    public static function hit(string $key): void
    {
        TentativaRepository::add($key);
        if (random_int(1, 50) === 1) {
            TentativaRepository::purgeBefore(date('Y-m-d H:i:s', time() - 86400));
        }
    }

    public static function clear(string $key): void
    {
        TentativaRepository::clear($key);
    }

    public static function guard(string $key, int $max, int $minutes, ?string $message = null): void
    {
        if (self::tooMany($key, $max, $minutes)) {
            throw $message === null ? ApiException::tooMany() : ApiException::tooMany($message);
        }
        self::hit($key);
    }
}
