<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Presenters\UsuarioPresenter;
use App\Repositories\UsuarioRepository;
use App\Services\Passwords;
use App\Services\Session;
use App\Support\ApiException;
use App\Support\Input;
use App\Support\Json;
use App\Support\Settings;
use App\Support\Validator;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class UsuariosController
{
    private const PAPEIS = ['admin', 'editor'];

    public function index(Request $request, Response $response): Response
    {
        return Json::data($response, UsuarioPresenter::many(UsuarioRepository::all()));
    }

    public function store(Request $request, Response $response): Response
    {
        $v = new Validator(Input::body($request));
        $nome = $v->string('nome', 120);
        $email = $v->email('email');
        $senha = $v->password('senha', Settings::get('auth.senha_min'));
        $papel = $v->oneOf('papel', self::PAPEIS);
        $v->assert();
        self::assertEmailFree($email);

        $id = UsuarioRepository::create([
            'nome' => $nome,
            'email' => $email,
            'senha_hash' => Passwords::hash($senha),
            'papel' => $papel,
        ]);
        return Json::data($response, UsuarioPresenter::one(UsuarioRepository::findOrFail($id)), 201);
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $alvo = UsuarioRepository::findOrFail(Input::id($args));
        $v = new Validator(Input::body($request));
        $changes = [];

        if ($v->has('nome')) {
            $changes['nome'] = $v->string('nome', 120);
        }
        if ($v->has('email')) {
            $changes['email'] = $v->email('email');
        }
        if ($v->has('papel')) {
            $changes['papel'] = $v->oneOf('papel', self::PAPEIS);
        }
        if ($v->has('ativo')) {
            $changes['ativo'] = (int) $v->bool('ativo');
        }
        if ($v->raw('senha') !== '') {
            $changes['senha_hash'] = Passwords::hash($v->password('senha', Settings::get('auth.senha_min')));
        }
        $v->assert();

        $eu = Input::user($request);
        $souEu = (int) $alvo['id'] === (int) $eu['id'];
        $trocaEmail = isset($changes['email']) && $changes['email'] !== $alvo['email'];
        $trocaSenha = isset($changes['senha_hash']);
        if ($souEu && ($trocaEmail || $trocaSenha)) {
            $atual = UsuarioRepository::findWithHashByEmail($alvo['email']);
            if (!Passwords::verify($v->raw('senha_atual'), $atual['senha_hash'] ?? null)) {
                throw ApiException::validation(['senha_atual' => 'Confirme com a sua senha atual.']);
            }
        }
        if ($souEu && ($changes['ativo'] ?? 1) === 0) {
            throw ApiException::validation(['ativo' => 'Você não pode desativar a si mesmo.']);
        }
        if ($souEu && isset($changes['papel']) && $changes['papel'] !== 'admin') {
            throw ApiException::validation(['papel' => 'Você não pode tirar o seu próprio acesso de administrador.']);
        }
        if ($trocaEmail) {
            self::assertEmailFree($changes['email']);
        }

        UsuarioRepository::update((int) $alvo['id'], $changes);
        if ($trocaSenha) {
            UsuarioRepository::encerrarSessoes((int) $alvo['id']);
        }
        $atualizado = UsuarioRepository::findOrFail((int) $alvo['id']);
        if ($souEu && $trocaSenha) {
            $response = Session::start($response, $atualizado, $eu['exp'] - time() > Settings::get('auth.ttl_curto'));
        }
        return Json::data($response, UsuarioPresenter::one($atualizado));
    }

    public function destroy(Request $request, Response $response, array $args): Response
    {
        $alvo = UsuarioRepository::findOrFail(Input::id($args));
        if ((int) $alvo['id'] === (int) Input::user($request)['id']) {
            throw ApiException::validation(['id' => 'Você não pode excluir a si mesmo.']);
        }

        UsuarioRepository::delete((int) $alvo['id']);
        return Json::data($response, ['id' => (int) $alvo['id']]);
    }

    private static function assertEmailFree(string $email): void
    {
        if (UsuarioRepository::emailExists($email)) {
            throw ApiException::validation(['email' => 'Já existe um usuário com este e-mail.']);
        }
    }
}
