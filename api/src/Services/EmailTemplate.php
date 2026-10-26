<?php

declare(strict_types=1);

namespace App\Services;

use App\Support\Env;

final class EmailTemplate
{
    private const SERIF = "Georgia,'Times New Roman',serif";
    private const SANS = "'Segoe UI',Helvetica,Arial,sans-serif";

    public static function render(string $titulo, string $conteudo, string $previa = ''): string
    {
        $site = self::siteUrl();
        $logo = self::e($site . '/img/logo.png');
        $tituloHtml = self::e($titulo);
        $previaHtml = self::e($previa);
        $siteHtml = self::e($site);
        $dominio = self::e(preg_replace('~^https?://~', '', $site));
        $serif = self::SERIF;
        $sans = self::SANS;

        return <<<HTML
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>{$tituloHtml}</title>
</head>
<body style="margin:0;padding:0;background:#f4f1ea;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">{$previaHtml}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f1ea;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
<tr><td align="center" style="background:#0a0a0a;border-radius:16px 16px 0 0;padding:32px 24px 26px;">
<img src="{$logo}" width="56" height="56" alt="" style="display:block;border:0;margin:0 auto 14px;">
<div style="font-family:{$serif};font-size:13px;letter-spacing:4px;color:#ffd000;text-transform:uppercase;">Ministério</div>
<div style="font-family:{$serif};font-size:22px;letter-spacing:2px;color:#ffffff;font-weight:bold;margin-top:4px;">Reedificando o Altar</div>
</td></tr>
<tr><td style="background:#ffd000;height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>
<tr><td style="background:#ffffff;padding:36px 32px;font-family:{$sans};font-size:15px;line-height:1.6;color:#2a2a2a;">
<h1 style="margin:0 0 20px;font-family:{$serif};font-size:24px;line-height:1.3;color:#0a0a0a;">{$tituloHtml}</h1>
{$conteudo}
</td></tr>
<tr><td align="center" style="background:#141414;border-radius:0 0 16px 16px;padding:22px 24px;font-family:{$sans};font-size:12px;line-height:1.6;color:#8c8c8c;">
Ministério Reedificando o Altar · Barueri/SP<br>
<a href="{$siteHtml}" style="color:#ffd000;text-decoration:none;">{$dominio}</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
HTML;
    }

    public static function paragrafo(string $texto): string
    {
        return '<p style="margin:0 0 16px;">' . nl2br(self::e($texto)) . '</p>';
    }

    public static function botao(string $rotulo, string $url): string
    {
        $sans = self::SANS;
        return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px auto;"><tr>'
            . '<td align="center" style="background:#ffd000;border-radius:999px;">'
            . '<a href="' . self::e($url) . '" style="display:inline-block;padding:14px 32px;font-family:' . $sans . ';font-size:13px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#0a0a0a;text-decoration:none;">'
            . self::e($rotulo) . '</a></td></tr></table>';
    }

    public static function campos(array $campos): string
    {
        $linhas = '';
        foreach ($campos as $rotulo => $valor) {
            $linhas .= '<tr>'
                . '<td style="padding:10px 0;border-bottom:1px solid #eee7d6;width:90px;vertical-align:top;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8c8c8c;">' . self::e($rotulo) . '</td>'
                . '<td style="padding:10px 0;border-bottom:1px solid #eee7d6;vertical-align:top;color:#0a0a0a;font-weight:600;">' . self::e($valor) . '</td>'
                . '</tr>';
        }
        return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">' . $linhas . '</table>';
    }

    public static function citacao(string $texto): string
    {
        return '<div style="margin:0 0 8px;padding:18px 20px;background:#fff6c2;border-left:4px solid #c99a00;border-radius:4px;color:#2a2a2a;">'
            . nl2br(self::e($texto)) . '</div>';
    }

    public static function nota(string $texto): string
    {
        return '<p style="margin:24px 0 0;font-size:13px;color:#8c8c8c;">' . nl2br(self::e($texto)) . '</p>';
    }

    private static function siteUrl(): string
    {
        return rtrim(Env::get('APP_URL', 'https://reedificandooaltar.com.br'), '/');
    }

    private static function e(string $texto): string
    {
        return htmlspecialchars($texto, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
}
