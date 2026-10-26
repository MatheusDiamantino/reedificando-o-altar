<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Presenters\LivePresenter;
use App\Repositories\LiveRepository;
use App\Repositories\MensagemRepository;
use App\Services\Agenda;
use App\Support\Database;
use App\Support\Json;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class ResumoController
{
    public function show(Request $request, Response $response): Response
    {
        $agora = Database::now();
        $eventos = Agenda::ocorrencias(date('Y-m-d'), date('Y-m-d', strtotime('+90 days')));

        return Json::data($response, [
            'mensagens_nao_lidas' => MensagemRepository::unreadByType(),
            'total_lives' => LiveRepository::count(),
            'ultima_live' => LivePresenter::nullable(LiveRepository::latestBefore($agora)),
            'proxima_live' => LivePresenter::nullable(LiveRepository::nextAfter($agora)),
            'proximo_evento' => $eventos[0] ?? null,
        ]);
    }
}
