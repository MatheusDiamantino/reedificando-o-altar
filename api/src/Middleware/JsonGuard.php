<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Support\ApiException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;

final class JsonGuard implements MiddlewareInterface
{
    private const ROTAS_DE_ENVIO = '~^/api/admin/(imagens|lives/\d+/thumbnail)$~';

    public function process(Request $request, Handler $handler): Response
    {
        $tipo = strtolower($request->getHeaderLine('Content-Type'));
        $isJson = str_contains($tipo, 'application/json');
        $temCorpo = trim((string) $request->getBody()) !== ''
            || $request->getUploadedFiles() !== []
            || !empty($request->getParsedBody());

        if (in_array($request->getMethod(), ['POST', 'PUT', 'PATCH'], true) && $temCorpo && !$isJson) {
            $envioDeArquivo = str_contains($tipo, 'multipart/form-data')
                && preg_match(self::ROTAS_DE_ENVIO, $request->getUri()->getPath()) === 1;
            if (!$envioDeArquivo) {
                throw new ApiException(415, 'tipo_nao_suportado', 'Envie os dados em JSON.');
            }
        }

        if ($isJson && $request->getParsedBody() === null && trim((string) $request->getBody()) !== '') {
            throw ApiException::badRequest('Corpo da requisição não é um JSON válido em UTF-8.');
        }
        return $handler->handle($request);
    }
}
