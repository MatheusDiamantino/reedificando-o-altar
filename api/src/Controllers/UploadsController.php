<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\Uploads;
use App\Support\ApiException;
use App\Support\Json;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

final class UploadsController
{
    public function store(Request $request, Response $response): Response
    {
        $file = $request->getUploadedFiles()['imagem'] ?? null;

        if ($file === null || $file->getError() !== UPLOAD_ERR_OK) {
            $tooBig = $file !== null && in_array($file->getError(), [UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE], true);
            throw ApiException::validation(['imagem' => $tooBig ? 'A imagem deve ter no máximo 5 MB.' : 'Envie uma imagem.']);
        }

        $path = Uploads::storeWebp((string) $file->getStream(), 'site');

        return Json::data($response, ['url' => Uploads::url($path)], 201);
    }

    public function show(Request $request, Response $response, array $args): Response
    {
        $base = realpath(Uploads::baseDir());
        $file = realpath(Uploads::baseDir() . '/' . $args['path']);
        if ($base === false || $file === false || !str_starts_with($file, $base . DIRECTORY_SEPARATOR) || !is_file($file) || !str_ends_with($file, '.webp')) {
            return $response->withStatus(404);
        }

        $response->getBody()->write((string) file_get_contents($file));
        return $response->withHeader('Content-Type', 'image/webp');
    }
}
