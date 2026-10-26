<?php

declare(strict_types=1);

namespace App\Services;

final class YouTube
{
    private const YOUTUBE_HOSTS = ['youtube.com', 'youtu.be', 'music.youtube.com', 'youtube-nocookie.com'];
    private const FACEBOOK_HOSTS = ['facebook.com', 'fb.watch', 'fb.com'];

    public static function parse(string $url): array
    {
        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        $host = preg_replace('/^(www\.|m\.)/', '', $host);

        if (in_array($host, self::YOUTUBE_HOSTS, true)) {
            return ['plataforma' => 'youtube', 'video_id' => self::videoId($url)];
        }
        if (in_array($host, self::FACEBOOK_HOSTS, true)) {
            return ['plataforma' => 'facebook', 'video_id' => null];
        }
        return ['plataforma' => 'outro', 'video_id' => null];
    }

    public static function videoId(string $url): ?string
    {
        $patterns = [
            '~youtu\.be/([A-Za-z0-9_-]{11})~',
            '~[?&]v=([A-Za-z0-9_-]{11})~',
            '~/(?:embed|live|shorts|v)/([A-Za-z0-9_-]{11})~',
        ];
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $url, $match)) {
                return $match[1];
            }
        }
        return null;
    }

    public static function thumbnailUrl(string $videoId, string $size = 'hqdefault'): string
    {
        return "https://i.ytimg.com/vi/{$videoId}/{$size}.jpg";
    }

    public static function lookup(string $url): array
    {
        $info = self::parse($url);
        $result = ['titulo' => null, 'plataforma' => $info['plataforma'], 'video_id' => $info['video_id'], 'thumbnail_url' => null];

        if ($info['plataforma'] !== 'youtube' || $info['video_id'] === null) {
            return $result;
        }

        $result['titulo'] = self::title($info['video_id']);
        $result['thumbnail_url'] = self::bestThumbnailUrl($info['video_id']);
        return $result;
    }

    public static function title(string $videoId): ?string
    {
        $watchUrl = 'https://www.youtube.com/watch?v=' . $videoId;
        $response = HttpClient::get('https://www.youtube.com/oembed?format=json&url=' . rawurlencode($watchUrl));
        if ($response === null || $response['status'] !== 200) {
            return null;
        }
        $json = json_decode($response['body'], true);
        return is_array($json) && is_string($json['title'] ?? null) ? $json['title'] : null;
    }

    public static function bestThumbnailUrl(string $videoId): string
    {
        $max = self::thumbnailUrl($videoId, 'maxresdefault');
        $response = HttpClient::get($max, 5);
        return ($response && $response['status'] === 200) ? $max : self::thumbnailUrl($videoId);
    }

    public static function downloadThumbnail(string $videoId): ?string
    {
        foreach (['maxresdefault', 'hqdefault'] as $size) {
            $response = HttpClient::get(self::thumbnailUrl($videoId, $size));
            if ($response === null || $response['status'] !== 200 || $response['body'] === '') {
                continue;
            }
            try {
                return Uploads::storeWebp($response['body']);
            } catch (\Throwable $e) {
                Logger::error('Falha ao salvar capa do YouTube', ['video' => $videoId, 'erro' => $e->getMessage()]);
            }
        }
        return null;
    }
}
