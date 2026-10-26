<?php

declare(strict_types=1);

namespace App\Support;

final class ApiException extends \RuntimeException
{
    public function __construct(
        public readonly int $status,
        public readonly string $errorCode,
        string $message,
        public readonly array $fields = [],
    ) {
        parent::__construct($message, $status);
    }

    public static function badRequest(string $message, string $code = 'requisicao_invalida'): self
    {
        return new self(400, $code, $message);
    }

    public static function unauthorized(string $message = 'Faça login para continuar.'): self
    {
        return new self(401, 'nao_autenticado', $message);
    }

    public static function forbidden(string $message = 'Você não tem permissão para isso.', string $code = 'sem_permissao'): self
    {
        return new self(403, $code, $message);
    }

    public static function notFound(string $message = 'Não encontrado.'): self
    {
        return new self(404, 'nao_encontrado', $message);
    }

    public static function validation(array $fields): self
    {
        return new self(422, 'dados_invalidos', 'Confira os campos destacados.', $fields);
    }

    public static function tooMany(string $message = 'Muitas tentativas. Aguarde alguns minutos.'): self
    {
        return new self(429, 'muitas_tentativas', $message);
    }

    public static function csrf(): self
    {
        return self::forbidden('Sessão expirada. Recarregue a página e tente de novo.', 'csrf_invalido');
    }
}
