<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\ConteudoRepository;
use App\Support\ApiException;
use App\Support\Database;
use App\Support\Input;
use App\Support\Json;
use App\Support\Settings;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class ConteudoController
{
    public function show(Request $request, Response $response): Response
    {
        return Json::data($response, ConteudoRepository::all())
            ->withHeader('Cache-Control', 'public, max-age=60');
    }

    public function update(Request $request, Response $response): Response
    {
        $body = Input::body($request);
        if ($body === []) {
            throw ApiException::badRequest('Nada para salvar.');
        }

        $chaves = Settings::get('conteudo.chaves');
        $maxBytes = Settings::get('conteudo.max_bytes');
        $limpo = [];
        $erros = [];
        foreach ($body as $chave => $valor) {
            if (!in_array($chave, $chaves, true)) {
                $erros[$chave] = 'Chave desconhecida.';
                continue;
            }
            $limpo[$chave] = self::clean($valor);
            $json = json_encode($limpo[$chave], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            if ($json === false || strlen($json) > $maxBytes) {
                $erros[$chave] = 'Conteúdo inválido ou grande demais.';
            } elseif (($erro = self::linkInvalido($chave, $limpo[$chave])) !== null) {
                $erros[$chave] = $erro;
            }
        }
        if ($erros !== []) {
            throw ApiException::validation($erros);
        }

        Database::transaction(function () use ($limpo) {
            foreach ($limpo as $chave => $valor) {
                ConteudoRepository::save($chave, $valor);
            }
        });

        return Json::data($response, ConteudoRepository::all());
    }

    private static function linkInvalido(string $chave, mixed $valor): ?string
    {
        $links = match ($chave) {
            'redes' => array_intersect_key((array) $valor, array_flip(['facebook_grupo', 'facebook', 'instagram'])),
            'endereco' => ['maps_url' => ((array) $valor)['maps_url'] ?? ''],
            default => [],
        };
        foreach ($links as $link) {
            if (!self::urlSegura($link, false)) {
                return 'Use links que comecem com https://';
            }
        }

        if ($chave === 'redes' && !preg_match('/^[0-9 ()+\-]*$/', (string) (((array) $valor)['whatsapp'] ?? ''))) {
            return 'O WhatsApp deve ter só números.';
        }
        if ($chave === 'email' && $valor !== '' && !filter_var($valor, FILTER_VALIDATE_EMAIL)) {
            return 'E-mail inválido.';
        }
        if ($chave === 'lideres') {
            foreach ((array) $valor as $lider) {
                if (!self::urlSegura(((array) $lider)['foto'] ?? '', true)) {
                    return 'Foto com endereço inválido.';
                }
            }
        }
        return null;
    }

    private static function urlSegura(mixed $link, bool $aceitaCaminhoLocal): bool
    {
        if (!is_string($link) || $link === '') {
            return $link === '' || $link === null;
        }
        if ($aceitaCaminhoLocal && preg_match('~^/(img|uploads)/[A-Za-z0-9/_.-]+$~', $link) && !str_contains($link, '..')) {
            return true;
        }
        return preg_match('~^https?://~i', $link) === 1 && filter_var($link, FILTER_VALIDATE_URL) !== false;
    }

    private static function clean(mixed $valor): mixed
    {
        if (is_array($valor)) {
            return array_map([self::class, 'clean'], $valor);
        }
        return is_string($valor) ? trim(strip_tags($valor)) : $valor;
    }
}
