<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\UsuarioRepository;
use App\Support\Env;
use App\Support\Settings;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class Session
{
    public static function start(Response $response, array $usuario, bool $lembrar): Response
    {
        $ttl = Settings::get($lembrar ? 'auth.ttl_lembrar' : 'auth.ttl_curto');
        $expires = time() + $ttl;
        $token = JWT::encode([
            'sub' => (int) $usuario['id'],
            'papel' => $usuario['papel'],
            'ver' => (int) ($usuario['sessao_versao'] ?? 0),
            'iat' => time(),
            'exp' => $expires,
        ], self::secret(), 'HS256');

        $response = self::cookie($response, Settings::get('auth.session_cookie'), $token, $expires, '/api', true);
        return self::cookie($response, Settings::get('auth.csrf_cookie'), self::randomToken(), $expires, '/', false);
    }

    public static function end(Response $response): Response
    {
        $response = self::cookie($response, Settings::get('auth.session_cookie'), '', 1, '/api', true);
        return self::cookie($response, Settings::get('auth.csrf_cookie'), '', 1, '/', false);
    }

    public static function ensureCsrf(Request $request, Response $response, int $expires): Response
    {
        $name = Settings::get('auth.csrf_cookie');
        if (!empty($request->getCookieParams()[$name])) {
            return $response;
        }
        return self::cookie($response, $name, self::randomToken(), $expires, '/', false);
    }

    public static function user(Request $request): ?array
    {
        $token = $request->getCookieParams()[Settings::get('auth.session_cookie')] ?? null;
        if (!is_string($token) || $token === '') {
            return null;
        }

        try {
            $claims = JWT::decode($token, new Key(self::secret(), 'HS256'));
        } catch (\Throwable) {
            return null;
        }

        $usuario = UsuarioRepository::find((int) $claims->sub);
        if ($usuario === null || !(int) $usuario['ativo']) {
            return null;
        }
        if ((int) ($claims->ver ?? -1) !== (int) $usuario['sessao_versao']) {
            return null;
        }
        return $usuario + ['exp' => (int) $claims->exp];
    }

    public static function csrfValid(Request $request): bool
    {
        $cookie = $request->getCookieParams()[Settings::get('auth.csrf_cookie')] ?? '';
        $header = $request->getHeaderLine(Settings::get('auth.csrf_header'));
        return is_string($cookie) && $cookie !== '' && hash_equals($cookie, $header);
    }

    public static function ipHash(Request $request): string
    {
        return hash_hmac('sha256', self::faixaDoIp(self::clientIp($request)), self::secret());
    }

    private static function faixaDoIp(string $ip): string
    {
        $binario = @inet_pton($ip);
        if ($binario === false || strlen($binario) !== 16) {
            return $ip;
        }
        return inet_ntop(substr($binario, 0, 8) . str_repeat("\0", 8)) . '/64';
    }

    public static function clientIp(Request $request): string
    {
        return (string) ($request->getServerParams()['REMOTE_ADDR'] ?? '0.0.0.0');
    }

    private static function secret(): string
    {
        $secret = Env::require('JWT_SECRET');
        if (strlen($secret) < 32) {
            throw new \RuntimeException('JWT_SECRET precisa ter pelo menos 32 caracteres.');
        }
        return $secret;
    }

    private static function randomToken(): string
    {
        return bin2hex(random_bytes(32));
    }

    private static function cookie(Response $response, string $name, string $value, int $expires, string $path, bool $httpOnly): Response
    {
        $parts = [
            rawurlencode($name) . '=' . rawurlencode($value),
            'Expires=' . gmdate('D, d M Y H:i:s \G\M\T', $expires),
            'Max-Age=' . max(0, $expires - time()),
            'Path=' . $path,
            'SameSite=Strict',
        ];
        if (Env::isProduction()) {
            $parts[] = 'Secure';
        }
        if ($httpOnly) {
            $parts[] = 'HttpOnly';
        }
        return $response->withAddedHeader('Set-Cookie', implode('; ', $parts));
    }
}
