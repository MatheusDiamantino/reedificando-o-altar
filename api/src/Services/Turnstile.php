<?php

declare(strict_types=1);

namespace App\Services;

use App\Support\ApiException;
use App\Support\Env;

final class Turnstile
{
    private const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    public static function verify(?string $token, string $ip): void
    {
        $secret = Env::get('TURNSTILE_SECRET');
        if ($secret === null) {
            return;
        }
        if ($token === null || $token === '') {
            throw ApiException::badRequest('Confirme que você não é um robô.', 'verificacao_falhou');
        }

        $result = HttpClient::postForm(self::VERIFY_URL, ['secret' => $secret, 'response' => $token, 'remoteip' => $ip]);
        $json = $result ? json_decode($result['body'], true) : null;

        if (!is_array($json) || empty($json['success'])) {
            throw ApiException::badRequest('Não foi possível confirmar que você não é um robô. Tente de novo.', 'verificacao_falhou');
        }
    }
}
