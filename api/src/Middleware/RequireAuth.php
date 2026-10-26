<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Services\Session;
use App\Support\ApiException;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as Handler;

final class RequireAuth implements MiddlewareInterface
{
    private const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

    public function __construct(private readonly array $papeis = [])
    {
    }

    public function process(Request $request, Handler $handler): Response
    {
        $usuario = Session::user($request);
        if ($usuario === null) {
            throw ApiException::unauthorized();
        }
        if ($this->papeis !== [] && !in_array($usuario['papel'], $this->papeis, true)) {
            throw ApiException::forbidden();
        }
        if (!in_array($request->getMethod(), self::SAFE_METHODS, true) && !Session::csrfValid($request)) {
            throw ApiException::csrf();
        }

        return $handler->handle($request->withAttribute('usuario', $usuario));
    }
}
