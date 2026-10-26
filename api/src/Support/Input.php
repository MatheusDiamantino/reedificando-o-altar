<?php

declare(strict_types=1);

namespace App\Support;

use Psr\Http\Message\ServerRequestInterface as Request;

final class Input
{
    public static function body(Request $request): array
    {
        $body = $request->getParsedBody();
        return is_array($body) ? $body : [];
    }

    public static function query(Request $request, string $key, ?string $default = null): ?string
    {
        $value = $request->getQueryParams()[$key] ?? null;
        return is_string($value) && $value !== '' ? $value : $default;
    }

    public static function id(array $args): int
    {
        $id = filter_var($args['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if ($id === false) {
            throw ApiException::notFound();
        }
        return $id;
    }

    public static function user(Request $request): array
    {
        return $request->getAttribute('usuario');
    }
}
