<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Presenters\MensagemPresenter;
use App\Repositories\MensagemRepository;
use App\Support\ApiException;
use App\Support\Input;
use App\Support\Json;
use App\Support\Validator;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class MensagensController
{
    public function index(Request $request, Response $response): Response
    {
        $tipo = Input::query($request, 'tipo');
        if ($tipo !== null && !in_array($tipo, ['contato', 'oracao'], true)) {
            throw ApiException::validation(['tipo' => 'Use contato ou oracao.']);
        }
        $lida = Input::query($request, 'lida');

        $rows = MensagemRepository::list($tipo, $lida === null ? null : filter_var($lida, FILTER_VALIDATE_BOOLEAN));
        return Json::data($response, MensagemPresenter::many($rows));
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $mensagem = MensagemRepository::findOrFail(Input::id($args));
        $v = new Validator(Input::body($request));
        if (!$v->has('lida')) {
            throw ApiException::validation(['lida' => 'Campo obrigatório.']);
        }

        MensagemRepository::markRead((int) $mensagem['id'], $v->bool('lida'));
        return Json::data($response, MensagemPresenter::one(MensagemRepository::findOrFail((int) $mensagem['id'])));
    }

    public function destroy(Request $request, Response $response, array $args): Response
    {
        $mensagem = MensagemRepository::findOrFail(Input::id($args));
        MensagemRepository::delete((int) $mensagem['id']);
        return Json::data($response, ['id' => (int) $mensagem['id']]);
    }
}
