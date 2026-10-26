<?php

declare(strict_types=1);

namespace App\Support;

use PDO;
use PDOStatement;

final class Database
{
    private static ?PDO $pdo = null;

    public static function pdo(): PDO
    {
        return self::$pdo ??= self::connect();
    }

    public static function driver(): string
    {
        return Env::get('DB_DRIVER', 'mysql');
    }

    public static function run(string $sql, array $params = []): PDOStatement
    {
        $stmt = self::pdo()->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public static function one(string $sql, array $params = []): ?array
    {
        $row = self::run($sql, $params)->fetch();
        return $row === false ? null : $row;
    }

    public static function all(string $sql, array $params = []): array
    {
        return self::run($sql, $params)->fetchAll();
    }

    public static function value(string $sql, array $params = []): mixed
    {
        $value = self::run($sql, $params)->fetchColumn();
        return $value === false ? null : $value;
    }

    public static function insert(string $table, array $data): int
    {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_map(fn ($c) => ':' . $c, array_keys($data)));
        self::run("INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})", $data);
        return (int) self::pdo()->lastInsertId();
    }

    public static function update(string $table, int $id, array $data): void
    {
        if ($data === []) {
            return;
        }
        $sets = implode(', ', array_map(fn ($c) => "{$c} = :{$c}", array_keys($data)));
        self::run("UPDATE {$table} SET {$sets} WHERE id = :id", $data + ['id' => $id]);
    }

    public static function delete(string $table, int $id): void
    {
        self::run("DELETE FROM {$table} WHERE id = :id", ['id' => $id]);
    }

    public static function transaction(callable $callback): mixed
    {
        $pdo = self::pdo();
        $pdo->beginTransaction();
        try {
            $result = $callback();
            $pdo->commit();
            return $result;
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    public static function now(): string
    {
        return date('Y-m-d H:i:s');
    }

    private static function connect(): PDO
    {
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];

        if (self::driver() === 'sqlite') {
            $file = Env::path(Env::get('DB_SQLITE_PATH', 'storage/dev.sqlite'));
            $pdo = new PDO('sqlite:' . $file, null, null, $options);
            $pdo->exec('PRAGMA foreign_keys = ON');
            return $pdo;
        }

        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
            Env::require('DB_HOST'),
            Env::get('DB_PORT', '3306'),
            Env::require('DB_NAME'),
        );
        $pdo = new PDO($dsn, Env::require('DB_USER'), Env::get('DB_PASS', ''), $options);
        $pdo->exec("SET time_zone = '-03:00'");
        return $pdo;
    }
}
