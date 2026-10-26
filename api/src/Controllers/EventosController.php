<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Presenters\EventoPresenter;
use App\Repositories\EventoRepository;
use App\Services\Agenda;
use App\Support\ApiException;
use App\Support\Input;
use App\Support\Json;
use App\Support\Settings;
use App\Support\Validator;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class EventosController
{
    public function index(Request $request, Response $response): Response
    {
        $padrao = Settings::get('eventos.janela_padrao_dias');
        $maximo = Settings::get('eventos.janela_max_dias');

        $de = Input::query($request, 'de', date('Y-m-d'));
        if (!Validator::isDate($de)) {
            throw ApiException::validation(['de' => 'Use datas no formato AAAA-MM-DD.']);
        }
        $ate = Input::query($request, 'ate', date('Y-m-d', strtotime("{$de} +{$padrao} days")));
        if (!Validator::isDate($ate)) {
            throw ApiException::validation(['ate' => 'Use datas no formato AAAA-MM-DD.']);
        }
        if ($ate < $de || (strtotime($ate) - strtotime($de)) / 86400 > $maximo) {
            throw ApiException::validation(['ate' => "Período inválido (máximo de {$maximo} dias)."]);
        }

        return Json::data($response, Agenda::ocorrencias($de, $ate));
    }

    public function adminIndex(Request $request, Response $response): Response
    {
        return Json::data($response, EventoPresenter::many(EventoRepository::all()));
    }

    public function store(Request $request, Response $response): Response
    {
        $id = EventoRepository::create(self::validated($request));
        return Json::data($response, EventoPresenter::one(EventoRepository::findOrFail($id)), 201);
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $evento = EventoRepository::findOrFail(Input::id($args));
        EventoRepository::update((int) $evento['id'], self::validated($request));
        return Json::data($response, EventoPresenter::one(EventoRepository::findOrFail((int) $evento['id'])));
    }

    public function destroy(Request $request, Response $response, array $args): Response
    {
        $evento = EventoRepository::findOrFail(Input::id($args));
        EventoRepository::delete((int) $evento['id']);
        return Json::data($response, ['id' => (int) $evento['id']]);
    }

    private static function validated(Request $request): array
    {
        $v = new Validator(Input::body($request));
        $data = [
            'titulo' => $v->string('titulo', 200),
            'descricao' => $v->text('descricao', 5000, required: false),
            'data' => $v->date('data'),
            'hora' => $v->time('hora'),
            'local' => $v->string('local', 200, required: false),
            'recorrencia' => $v->oneOf('recorrencia', ['semanal', 'mensal'], required: false),
        ];
        $v->assert();
        return $data;
    }
}
