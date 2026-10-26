<?php

declare(strict_types=1);

namespace App\Services;

use App\Support\Env;
use PHPMailer\PHPMailer\PHPMailer;

final class Mailer
{
    public static function send(string $to, string $subject, string $text, ?string $replyTo = null, ?string $replyName = null, ?string $html = null): bool
    {
        $host = Env::get('SMTP_HOST');
        $user = Env::get('SMTP_USER');
        if ($host === null || $user === null) {
            Logger::error('E-mail não enviado: SMTP não configurado no .env', ['assunto' => $subject]);
            return false;
        }

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = $host;
            $mail->Port = (int) Env::get('SMTP_PORT', '587');
            $mail->SMTPAuth = true;
            $mail->Username = $user;
            $mail->Password = Env::get('SMTP_PASS', '');
            $mail->SMTPSecure = $mail->Port === 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
            $mail->CharSet = PHPMailer::CHARSET_UTF8;
            $mail->Timeout = 10;

            $mail->setFrom($user, 'Site Reedificando o Altar');
            $mail->addAddress($to);
            if ($replyTo !== null) {
                $mail->addReplyTo($replyTo, $replyName ?? '');
            }
            $mail->Subject = $subject;
            if ($html !== null) {
                $mail->isHTML(true);
                $mail->Body = $html;
                $mail->AltBody = $text;
            } else {
                $mail->isHTML(false);
                $mail->Body = $text;
            }
            $mail->send();
            return true;
        } catch (\Throwable $e) {
            Logger::error('Falha ao enviar e-mail', ['assunto' => $subject, 'erro' => $mail->ErrorInfo ?: $e->getMessage()]);
            return false;
        }
    }
}
