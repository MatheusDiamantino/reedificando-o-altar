<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Services\Logger;
use App\Support\ApiException;
use App\Support\Env;
use App\Support\Json;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Exception\HttpException;
use Slim\Exception\HttpMethodNotAllowedException;
use Slim\Exception\HttpNotFoundException;
use Slim\Psr7\Response as SlimResponse;

final class ErrorHandler
{
    public function __invoke(Request $request, \Throwable $e, bool $displayErrorDetails): Response
    {
        $response = new SlimResponse();

        if ($e instanceof ApiException) {
            return Json::error($response, $e->status, $e->errorCode, $e->getMessage(), $e->fields);
        }
        if ($e instanceof HttpNotFoundException) {
            return Json::error($response, 404, 'rota_inexistente', 'Endereço não encontrado.');
        }
        if ($e instanceof HttpMethodNotAllowedException) {
            return Json::error($response, 405, 'metodo_nao_permitido', 'Método não permitido.');
        }
        if ($e instanceof HttpException) {
            return Json::error($response, $e->getCode() ?: 400, 'erro_http', $e->getMessage());
        }

        Logger::error(get_class($e) . ': ' . $e->getMessage(), [
            'arquivo' => $e->getFile() . ':' . $e->getLine(),
            'rota' => $request->getMethod() . ' ' . $request->getUri()->getPath(),
        ]);

        $message = Env::isProduction()
            ? 'Algo deu errado do nosso lado. Tente de novo em instantes.'
            : $e->getMessage() . ' (' . basename($e->getFile()) . ':' . $e->getLine() . ')';
        return Json::error($response, 500, 'erro_interno', $message);
    }
}
