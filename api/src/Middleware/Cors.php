<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Support\Env;
use App\Support\Settings;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;
use Slim\Psr7\Response as SlimResponse;

final class Cors implements MiddlewareInterface
{
    public function process(Request $request, Handler $handler): Response
    {
        $origin = $request->getHeaderLine('Origin');
        $allowed = !Env::isProduction() && in_array($origin, Settings::get('cors.origens_dev'), true);

        $response = ($allowed && $request->getMethod() === 'OPTIONS')
            ? (new SlimResponse())->withStatus(204)
            : $handler->handle($request);

        if (!$allowed) {
            return $response;
        }
        return $response
            ->withHeader('Access-Control-Allow-Origin', $origin)
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, ' . Settings::get('auth.csrf_header'))
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
            ->withHeader('Vary', 'Origin');
    }
}
