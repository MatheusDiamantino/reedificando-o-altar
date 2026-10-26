<?php

declare(strict_types=1);

namespace App\Services;

final class Passwords
{
    private const HASH_FALSO = '$argon2id$v=19$m=65536,t=4,p=1$RC9HTEF6NXBLcDVaMnROdA$Abl2kAMRqCR95xgSmm/tb1glzQXqVomJFf6eTcD2HYY';

    public static function hash(string $password): string
    {
        return password_hash($password, self::algorithm());
    }

    public static function verify(string $password, ?string $hash): bool
    {
        $confere = password_verify($password, $hash ?? self::HASH_FALSO);
        return $hash !== null && $confere;
    }

    public static function needsRehash(string $hash): bool
    {
        return password_needs_rehash($hash, self::algorithm());
    }

    private static function algorithm(): string
    {
        return defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
    }
}
