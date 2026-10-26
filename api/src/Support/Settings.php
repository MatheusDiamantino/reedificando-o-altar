<?php

declare(strict_types=1);

namespace App\Support;

final class Settings
{
    private static ?array $values = null;

    public static function get(string $key): mixed
    {
        self::$values ??= require Env::appRoot() . '/config/settings.php';

        $value = self::$values;
        foreach (explode('.', $key) as $part) {
            if (!is_array($value) || !array_key_exists($part, $value)) {
                throw new \RuntimeException("Configuração inexistente: {$key}");
            }
            $value = $value[$part];
        }
        return $value;
    }
}
