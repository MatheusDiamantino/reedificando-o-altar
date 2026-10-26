<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Support\Database;
use App\Support\Json;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class HealthController
{
    public function show(Request $request, Response $response): Response
    {
        try {
            Database::value('SELECT 1');
            $ok = true;
        } catch (\Throwable) {
            $ok = false;
        }

        return Json::data($response, [
            'ok' => $ok,
            'banco' => $ok ? 'conectado' : 'indisponivel',
            'hora' => date(DATE_ATOM),
        ], $ok ? 200 : 503);
    }
}
