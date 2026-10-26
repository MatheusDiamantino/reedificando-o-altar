<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Presenters\UsuarioPresenter;
use App\Repositories\SenhaResetRepository;
use App\Repositories\UsuarioRepository;
use App\Services\EmailTemplate;
use App\Services\Mailer;
use App\Services\Passwords;
use App\Services\RateLimiter;
use App\Services\Session;
use App\Support\ApiException;
use App\Support\Database;
use App\Support\Env;
use App\Support\Input;
use App\Support\Json;
use App\Support\Settings;
use App\Support\Validator;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class AuthController
{
    public function login(Request $request, Response $response): Response
    {
        $v = new Validator(Input::body($request));
        $email = $v->email('email');
        $senha = $v->password('senha', 1);
        $lembrar = $v->bool('lembrar');
        $v->assert();

        $ip = Session::ipHash($request);
        $chave = 'login:' . $ip . ':' . $email;
        $limites = [
            [$chave, Settings::get('auth.login_max'), Settings::get('auth.login_minutos')],
            ['login-email:' . $email, Settings::get('auth.login_max_email'), Settings::get('auth.login_email_minutos')],
            ['login-ip:' . $ip, Settings::get('auth.login_max_ip'), Settings::get('auth.login_minutos')],
        ];
        foreach ($limites as [$k, $max, $minutos]) {
            if (RateLimiter::tooMany($k, $max, $minutos)) {
                throw ApiException::tooMany("Muitas tentativas de login. Aguarde {$minutos} minutos.");
            }
        }

        $usuario = UsuarioRepository::findWithHashByEmail($email);
        if (!Passwords::verify($senha, $usuario['senha_hash'] ?? null)) {
            foreach ($limites as [$k]) {
                RateLimiter::hit($k);
            }
            throw new ApiException(401, 'credenciais_invalidas', 'E-mail ou senha incorretos.');
        }
        if (!(int) $usuario['ativo']) {
            throw ApiException::forbidden('Este usuário está desativado. Fale com um administrador.', 'usuario_inativo');
        }

        RateLimiter::clear($chave);
        $changes = ['ultimo_login' => Database::now()];
        if (Passwords::needsRehash($usuario['senha_hash'])) {
            $changes['senha_hash'] = Passwords::hash($senha);
        }
        UsuarioRepository::update((int) $usuario['id'], $changes);

        $response = Session::start($response, $usuario, $lembrar);
        return Json::data($response, ['user' => UsuarioPresenter::session($usuario)]);
    }

    public function logout(Request $request, Response $response): Response
    {
        if (Session::user($request) !== null && !Session::csrfValid($request)) {
            throw ApiException::csrf();
        }
        return Json::data(Session::end($response), ['saiu' => true]);
    }

    public function me(Request $request, Response $response): Response
    {
        $usuario = Session::user($request) ?? throw ApiException::unauthorized();
        $response = Session::ensureCsrf($request, $response, $usuario['exp']);
        return Json::data($response, ['user' => UsuarioPresenter::session($usuario)]);
    }

    public function forgotPassword(Request $request, Response $response): Response
    {
        $v = new Validator(Input::body($request));
        $email = $v->email('email');
        $v->assert();

        RateLimiter::guard('esqueci:' . Session::ipHash($request), Settings::get('auth.reset_max'), Settings::get('auth.reset_minutos'));
        RateLimiter::guard('esqueci-email:' . $email, Settings::get('auth.reset_max_email'), Settings::get('auth.reset_email_minutos'));

        $usuario = UsuarioRepository::findActiveByEmail($email);
        if ($usuario !== null) {
            $token = bin2hex(random_bytes(32));
            $validade = Settings::get('auth.reset_validade_minutos');
            SenhaResetRepository::replaceFor((int) $usuario['id'], hash('sha256', $token), date('Y-m-d H:i:s', time() + $validade * 60));

            $link = rtrim(Env::get('APP_URL', ''), '/') . '/admin/redefinir?token=' . $token;
            Mailer::send(
                $usuario['email'],
                'Redefinição de senha do painel',
                "Olá, {$usuario['nome']}.\n\nPara criar uma nova senha, abra o link abaixo (vale por {$validade} minutos):\n\n{$link}\n\nSe você não pediu isso, ignore este e-mail.\n",
                html: EmailTemplate::render(
                    'Crie uma nova senha',
                    EmailTemplate::paragrafo("Olá, {$usuario['nome']}.")
                        . EmailTemplate::paragrafo('Recebemos um pedido para redefinir a senha do painel do site. Clique no botão abaixo para criar uma senha nova.')
                        . EmailTemplate::botao('Criar nova senha', $link)
                        . EmailTemplate::paragrafo("O link vale por {$validade} minutos e só pode ser usado uma vez.")
                        . EmailTemplate::nota('Se você não pediu isso, ignore este e-mail. Sua senha atual continua valendo.'),
                    'Link para criar uma nova senha do painel.',
                ),
            );
        }

        return Json::data($response, ['mensagem' => 'Se o e-mail estiver cadastrado, você receberá um link em instantes.']);
    }

    public function resetPassword(Request $request, Response $response): Response
    {
        $v = new Validator(Input::body($request));
        $token = $v->string('token', 128);
        $senha = $v->password('senha', Settings::get('auth.senha_min'));
        $v->assert();

        $reset = SenhaResetRepository::findValid(hash('sha256', $token));
        if ($reset === null) {
            throw ApiException::badRequest('Este link expirou ou já foi usado. Peça um novo.', 'token_invalido');
        }

        UsuarioRepository::update((int) $reset['usuario_id'], ['senha_hash' => Passwords::hash($senha)]);
        UsuarioRepository::encerrarSessoes((int) $reset['usuario_id']);
        SenhaResetRepository::deleteFor((int) $reset['usuario_id']);

        return Json::data($response, ['mensagem' => 'Senha alterada. Faça login com a nova senha.']);
    }
}
