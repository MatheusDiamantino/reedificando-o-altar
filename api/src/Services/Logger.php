<?php

declare(strict_types=1);

namespace App\Services;

use App\Support\Env;

final class Logger
{
    public static function error(string $message, array $context = []): void
    {
        $dir = Env::appRoot() . '/storage/logs';
        if (!is_dir($dir)) {
            @mkdir($dir, 0750, true);
        }

        $line = sprintf(
            "[%s] %s %s\n",
            date('Y-m-d H:i:s'),
            $message,
            $context ? json_encode($context, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : '',
        );
        @file_put_contents($dir . '/' . date('Y-m') . '.log', $line, FILE_APPEND | LOCK_EX);
    }
}
