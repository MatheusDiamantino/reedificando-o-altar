<?php

declare(strict_types=1);

namespace App\Support;

use Dotenv\Dotenv;

final class Env
{
    private static array $values = [];
    private static string $appRoot = '';

    public static function load(string $appRoot): void
    {
        self::$appRoot = rtrim($appRoot, '/\\');

        $candidates = array_filter([
            getenv('ENV_PATH') ?: null,
            self::$appRoot . '/.env',
            dirname(self::$appRoot) . '/.env',
        ]);

        foreach ($candidates as $file) {
            if (is_file($file)) {
                self::$values = Dotenv::createArrayBacked(dirname($file), basename($file))->load();
                return;
            }
        }
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        $value = self::$values[$key] ?? getenv($key);
        return ($value === false || $value === null || $value === '') ? $default : (string) $value;
    }

    public static function require(string $key): string
    {
        $value = self::get($key);
        if ($value === null) {
            throw new \RuntimeException("Configuração ausente no .env: {$key}");
        }
        return $value;
    }

    public static function isProduction(): bool
    {
        return self::get('APP_ENV', 'production') === 'production';
    }

    public static function appRoot(): string
    {
        return self::$appRoot;
    }

    public static function path(string $path): string
    {
        $isAbsolute = str_starts_with($path, '/') || preg_match('~^[A-Za-z]:[\\\\/]~', $path);
        return $isAbsolute ? $path : self::$appRoot . '/' . $path;
    }
}
