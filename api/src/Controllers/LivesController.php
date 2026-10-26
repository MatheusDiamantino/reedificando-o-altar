<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Presenters\LivePresenter;
use App\Repositories\LiveRepository;
use App\Services\Uploads;
use App\Services\YouTube;
use App\Support\ApiException;
use App\Support\Input;
use App\Support\Json;
use App\Support\Validator;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class LivesController
{
    public function index(Request $request, Response $response): Response
    {
        $limit = min(100, max(1, (int) Input::query($request, 'limit', '20')));
        $offset = max(0, (int) Input::query($request, 'offset', '0'));
        $busca = Input::query($request, 'q');

        $page = LiveRepository::paginate($limit, $offset, $busca === null ? null : mb_substr($busca, 0, 100));

        return Json::data($response, LivePresenter::many($page['rows']))
            ->withHeader('X-Total-Count', (string) $page['total']);
    }

    public function current(Request $request, Response $response): Response
    {
        return Json::data($response, LivePresenter::nullable(LiveRepository::current()));
    }

    public function show(Request $request, Response $response, array $args): Response
    {
        return Json::data($response, LivePresenter::one(LiveRepository::findOrFail(Input::id($args))));
    }

    public function lookup(Request $request, Response $response): Response
    {
        $v = new Validator($request->getQueryParams());
        $url = $v->url('url');
        $v->assert();

        return Json::data($response, YouTube::lookup($url));
    }

    public function store(Request $request, Response $response): Response
    {
        $v = new Validator(Input::body($request));
        $link = $v->url('link');
        $titulo = $v->string('titulo', 200, required: false);
        $descricao = $v->text('descricao', 5000, required: false);
        $dataLive = $v->datetime('data_live');
        $aoVivo = $v->bool('ao_vivo');
        $destaque = $v->bool('destaque');
        $baixarCapa = $v->bool('baixar_capa', true);
        $v->assert();

        $video = YouTube::parse($link);
        if ($titulo === null && $video['video_id'] !== null) {
            $titulo = YouTube::title($video['video_id']);
        }
        if ($titulo === null) {
            throw ApiException::validation(['titulo' => 'Informe o título (não foi possível buscar automaticamente).']);
        }

        $id = LiveRepository::create([
            'titulo' => mb_substr($titulo, 0, 200),
            'descricao' => $descricao,
            'link' => $link,
            'plataforma' => $video['plataforma'],
            'video_id' => $video['video_id'],
            'thumbnail' => ($baixarCapa && $video['video_id'] !== null) ? YouTube::downloadThumbnail($video['video_id']) : null,
            'data_live' => $dataLive,
            'ao_vivo' => (int) $aoVivo,
            'destaque' => (int) $destaque,
        ]);
        if ($aoVivo) {
            LiveRepository::clearLiveExcept($id);
        }

        return Json::data($response, LivePresenter::one(LiveRepository::findOrFail($id)), 201);
    }

    public function update(Request $request, Response $response, array $args): Response
    {
        $live = LiveRepository::findOrFail(Input::id($args));
        $v = new Validator(Input::body($request));
        $changes = [];

        if ($v->has('titulo')) {
            $changes['titulo'] = $v->string('titulo', 200);
        }
        if ($v->has('descricao')) {
            $changes['descricao'] = $v->text('descricao', 5000, required: false);
        }
        if ($v->has('data_live')) {
            $changes['data_live'] = $v->datetime('data_live');
        }
        if ($v->has('ao_vivo')) {
            $changes['ao_vivo'] = (int) $v->bool('ao_vivo');
        }
        if ($v->has('destaque')) {
            $changes['destaque'] = (int) $v->bool('destaque');
        }
        if ($v->has('link')) {
            $changes['link'] = $v->url('link');
        }
        $baixarCapa = $v->bool('baixar_capa');
        $v->assert();

        if (isset($changes['link']) && $changes['link'] !== $live['link']) {
            $changes += YouTube::parse($changes['link']);
            $baixarCapa = $baixarCapa || $live['thumbnail'] === null;
        }

        $videoId = $changes['video_id'] ?? $live['video_id'];
        if ($baixarCapa && $videoId !== null) {
            $novaCapa = YouTube::downloadThumbnail($videoId);
            if ($novaCapa !== null) {
                Uploads::delete($live['thumbnail']);
                $changes['thumbnail'] = $novaCapa;
            }
        }

        LiveRepository::update((int) $live['id'], $changes);
        if (!empty($changes['ao_vivo'])) {
            LiveRepository::clearLiveExcept((int) $live['id']);
        }

        return Json::data($response, LivePresenter::one(LiveRepository::findOrFail((int) $live['id'])));
    }

    public function destroy(Request $request, Response $response, array $args): Response
    {
        $live = LiveRepository::findOrFail(Input::id($args));
        LiveRepository::delete((int) $live['id']);
        Uploads::delete($live['thumbnail']);

        return Json::data($response, ['id' => (int) $live['id']]);
    }

    public function uploadThumbnail(Request $request, Response $response, array $args): Response
    {
        $live = LiveRepository::findOrFail(Input::id($args));
        $file = $request->getUploadedFiles()['imagem'] ?? null;

        if ($file === null || $file->getError() !== UPLOAD_ERR_OK) {
            $tooBig = $file !== null && in_array($file->getError(), [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true);
            throw ApiException::validation(['imagem' => $tooBig ? 'A imagem deve ter no máximo 5 MB.' : 'Envie uma imagem.']);
        }

        $path = Uploads::storeWebp((string) $file->getStream());
        Uploads::delete($live['thumbnail']);
        LiveRepository::update((int) $live['id'], ['thumbnail' => $path]);

        return Json::data($response, LivePresenter::one(LiveRepository::findOrFail((int) $live['id'])));
    }
}
