<?php

declare(strict_types=1);

namespace App\Support;

final class Validator
{
    private array $errors = [];

    public function __construct(private readonly array $data)
    {
    }

    public function has(string $field): bool
    {
        return array_key_exists($field, $this->data);
    }

    public function raw(string $field): string
    {
        $value = $this->data[$field] ?? '';
        return is_scalar($value) ? (string) $value : '';
    }

    public function string(string $field, int $max = 255, bool $required = true, int $min = 0, bool $multiline = false): ?string
    {
        $raw = $this->data[$field] ?? null;
        if ($raw === null || (is_string($raw) && trim($raw) === '')) {
            if ($required) {
                $this->errors[$field] = 'Campo obrigatório.';
            }
            return null;
        }
        if (!is_scalar($raw)) {
            $this->errors[$field] = 'Valor inválido.';
            return null;
        }

        $value = trim(strip_tags((string) $raw));
        if (!$multiline) {
            $value = preg_replace('/\s+/u', ' ', $value);
        }

        $length = mb_strlen($value);
        if ($length > $max) {
            $this->errors[$field] = "Use no máximo {$max} caracteres.";
        } elseif ($length < $min) {
            $this->errors[$field] = "Use pelo menos {$min} caracteres.";
        }
        return $value;
    }

    public function text(string $field, int $max = 5000, bool $required = true): ?string
    {
        return $this->string($field, $max, $required, multiline: true);
    }

    public function password(string $field, int $min): string
    {
        $value = $this->raw($field);
        if ($value === '') {
            $this->errors[$field] = 'Campo obrigatório.';
        } elseif (mb_strlen($value) < $min) {
            $this->errors[$field] = "Use pelo menos {$min} caracteres.";
        } elseif (mb_strlen($value) > 200) {
            $this->errors[$field] = 'Use no máximo 200 caracteres.';
        }
        return $value;
    }

    public function email(string $field, bool $required = true): ?string
    {
        $value = $this->string($field, 190, $required);
        if ($value !== null && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = 'E-mail inválido.';
        }
        return $value === null ? null : mb_strtolower($value);
    }

    public function url(string $field, bool $required = true): ?string
    {
        $value = $this->string($field, 500, $required);
        if ($value !== null && (!filter_var($value, FILTER_VALIDATE_URL) || !preg_match('~^https?://~i', $value))) {
            $this->errors[$field] = 'Link inválido.';
        }
        return $value;
    }

    public function date(string $field, bool $required = true): ?string
    {
        $value = $this->string($field, 10, $required);
        if ($value !== null && !self::isDate($value)) {
            $this->errors[$field] = 'Data inválida (use AAAA-MM-DD).';
        }
        return $value;
    }

    public function datetime(string $field, bool $required = true): ?string
    {
        $value = $this->string($field, 25, $required);
        if ($value === null) {
            return null;
        }

        $value = str_replace('T', ' ', $value);
        foreach (['Y-m-d H:i:s', 'Y-m-d H:i', 'Y-m-d'] as $format) {
            $parsed = \DateTimeImmutable::createFromFormat('!' . $format, $value);
            if ($parsed && $parsed->format($format) === $value) {
                return $parsed->format('Y-m-d H:i:s');
            }
        }
        $this->errors[$field] = 'Data e hora inválidas.';
        return null;
    }

    public function time(string $field, bool $required = false): ?string
    {
        $value = $this->string($field, 8, $required);
        if ($value !== null && !preg_match('/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/', $value)) {
            $this->errors[$field] = 'Hora inválida (use HH:MM).';
            return null;
        }
        return $value === null ? null : substr($value, 0, 5);
    }

    public function bool(string $field, bool $default = false): bool
    {
        $raw = $this->data[$field] ?? $default;
        return filter_var($raw, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? $default;
    }

    public function oneOf(string $field, array $allowed, bool $required = true): ?string
    {
        $value = $this->string($field, 50, $required);
        if ($value !== null && !in_array($value, $allowed, true)) {
            $this->errors[$field] = 'Opção inválida.';
        }
        return $value;
    }

    public function assert(): void
    {
        if ($this->errors !== []) {
            throw ApiException::validation($this->errors);
        }
    }

    public static function isDate(string $value): bool
    {
        $parsed = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);
        return $parsed !== false && $parsed->format('Y-m-d') === $value;
    }
}
