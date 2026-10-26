<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Repositories\MensagemRepository;
use App\Services\EmailTemplate;
use App\Services\Logger;
use App\Services\Mailer;
use App\Services\RateLimiter;
use App\Services\Session;
use App\Services\Turnstile;
use App\Support\Env;
use App\Support\Input;
use App\Support\Json;
use App\Support\Settings;
use App\Support\Validator;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class ContatoController
{
    public function contato(Request $request, Response $response): Response
    {
        $body = Input::body($request);
        if (self::isBot($body)) {
            return self::sent($response);
        }

        $v = new Validator($body);
        $nome = $v->string('nome', 120);
        $email = $v->email('email');
        $assunto = $v->string('assunto', 200);
        $mensagem = $v->text('mensagem', 5000);
        $v->assert();

        self::protect($request, 'contato', $body);

        MensagemRepository::create([
            'tipo' => 'contato',
            'nome' => $nome,
            'email' => $email,
            'assunto' => $assunto,
            'texto' => $mensagem,
            'ip_hash' => Session::ipHash($request),
        ]);

        $destino = Env::get('MAIL_TO');
        if ($destino === null) {
            Logger::error('Mensagem de contato salva, mas MAIL_TO está vazio no .env: nenhum e-mail enviado.');
        } else {
            Mailer::send(
                $destino,
                "[Site] {$assunto}",
                "Nova mensagem pelo site.\n\nNome: {$nome}\nE-mail: {$email}\nAssunto: {$assunto}\n\n{$mensagem}\n",
                $email,
                $nome,
                EmailTemplate::render(
                    'Nova mensagem pelo site',
                    EmailTemplate::campos(['Nome' => $nome, 'E-mail' => $email, 'Assunto' => $assunto])
                        . EmailTemplate::citacao($mensagem)
                        . EmailTemplate::botao('Responder', 'mailto:' . $email . '?subject=' . rawurlencode('Re: ' . $assunto))
                        . EmailTemplate::nota('Você também pode responder direto a este e-mail. A resposta vai para quem escreveu.'),
                    "{$nome}: {$assunto}",
                ),
            );
        }

        return self::sent($response);
    }

    public function oracao(Request $request, Response $response): Response
    {
        $body = Input::body($request);
        if (self::isBot($body)) {
            return self::sent($response);
        }

        $v = new Validator($body);
        $nome = $v->string('nome', 120, required: false);
        $pedido = $v->text('pedido', 3000);
        $v->assert();

        self::protect($request, 'oracao', $body);

        MensagemRepository::create([
            'tipo' => 'oracao',
            'nome' => $nome,
            'texto' => $pedido,
            'ip_hash' => Session::ipHash($request),
        ]);

        return self::sent($response);
    }

    private static function protect(Request $request, string $formulario, array $body): void
    {
        RateLimiter::guard(
            $formulario . ':' . Session::ipHash($request),
            Settings::get('formularios.max'),
            Settings::get('formularios.minutos'),
        );
        Turnstile::verify($body['turnstile_token'] ?? null, Session::clientIp($request));
    }

    private static function isBot(array $body): bool
    {
        return !empty($body['website']);
    }

    private static function sent(Response $response): Response
    {
        return Json::data($response, ['enviado' => true], 201);
    }
}
