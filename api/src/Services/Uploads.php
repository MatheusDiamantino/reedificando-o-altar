<?php

declare(strict_types=1);

namespace App\Services;

use App\Support\ApiException;
use App\Support\Env;
use App\Support\Settings;

final class Uploads
{
    public static function storeWebp(string $bytes, string $folder = 'lives'): string
    {
        $config = Settings::get('uploads');

        if (strlen($bytes) > $config['max_bytes']) {
            throw ApiException::validation(['imagem' => 'A imagem deve ter no máximo 5 MB.']);
        }
        $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
        if (!in_array($mime, $config['tipos'], true)) {
            throw ApiException::validation(['imagem' => 'Envie uma imagem JPG, PNG ou WebP.']);
        }
        if (!function_exists('imagewebp')) {
            throw new \RuntimeException('A extensão GD com suporte a WebP não está ativa no PHP.');
        }

        $dimensoes = @getimagesizefromstring($bytes);
        if ($dimensoes === false || $dimensoes[0] > 8000 || $dimensoes[1] > 8000 || $dimensoes[0] * $dimensoes[1] > 40_000_000) {
            throw ApiException::validation(['imagem' => 'A imagem deve ter no máximo 8000 pixels de lado.']);
        }

        $image = @imagecreatefromstring($bytes);
        if ($image === false) {
            throw ApiException::validation(['imagem' => 'Não foi possível ler essa imagem.']);
        }
        $image = self::fitWidth($image, $config['max_largura']);

        $dir = self::baseDir() . '/' . $folder;
        if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
            throw new \RuntimeException("Não foi possível criar a pasta de uploads: {$dir}");
        }

        $name = bin2hex(random_bytes(12)) . '.webp';
        $saved = imagewebp($image, $dir . '/' . $name, $config['qualidade']);
        imagedestroy($image);
        if (!$saved) {
            throw new \RuntimeException('Falha ao gravar a imagem WebP.');
        }
        return $folder . '/' . $name;
    }

    public static function delete(?string $relative): void
    {
        if ($relative === null || $relative === '' || str_contains($relative, '..')) {
            return;
        }
        $file = self::baseDir() . '/' . $relative;
        if (is_file($file)) {
            @unlink($file);
        }
    }

    public static function url(?string $relative): ?string
    {
        if ($relative === null || $relative === '') {
            return null;
        }
        return rtrim(Env::get('UPLOADS_URL', '/uploads'), '/') . '/' . $relative;
    }

    public static function baseDir(): string
    {
        return rtrim(Env::path(Env::get('UPLOADS_DIR', '../public_html/uploads')), '/\\');
    }

    private static function fitWidth(\GdImage $image, int $maxWidth): \GdImage
    {
        $width = imagesx($image);
        $height = imagesy($image);

        if ($width <= $maxWidth) {
            if (!imageistruecolor($image)) {
                imagepalettetotruecolor($image);
            }
            return $image;
        }

        $newHeight = (int) round($height * $maxWidth / $width);
        $resized = imagecreatetruecolor($maxWidth, $newHeight);
        imagealphablending($resized, false);
        imagesavealpha($resized, true);
        imagecopyresampled($resized, $image, 0, 0, 0, 0, $maxWidth, $newHeight, $width, $height);
        imagedestroy($image);
        return $resized;
    }
}
