<?php

declare(strict_types=1);

namespace App\Services;

final class HttpClient
{
    public static function get(string $url, int $timeout = 8): ?array
    {
        return self::send($url, null, $timeout);
    }

    public static function postForm(string $url, array $fields, int $timeout = 8): ?array
    {
        return self::send($url, $fields, $timeout);
    }

    private static function send(string $url, ?array $fields, int $timeout): ?array
    {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => $timeout,
            CURLOPT_USERAGENT => 'ReedificandoOAltar/1.0',
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS | CURLPROTO_HTTP,
        ]);
        if ($fields !== null) {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($fields));
        }

        $body = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($body === false) {
            Logger::error('Falha na requisição externa', ['url' => $url, 'erro' => $error]);
            return null;
        }
        return ['status' => $status, 'body' => (string) $body];
    }
}
