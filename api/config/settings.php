<?php

return [
    'timezone' => 'America/Sao_Paulo',

    'auth' => [
        'session_cookie' => 'mra_session',
        'csrf_cookie' => 'mra_csrf',
        'csrf_header' => 'X-CSRF-Token',
        'ttl_curto' => 8 * 3600,
        'ttl_lembrar' => 30 * 86400,
        'login_max' => 5,
        'login_minutos' => 15,
        'login_max_email' => 20,
        'login_max_ip' => 30,
        'login_email_minutos' => 60,
        'reset_max' => 5,
        'reset_minutos' => 15,
        'reset_max_email' => 3,
        'reset_email_minutos' => 60,
        'reset_validade_minutos' => 60,
        'senha_min' => 10,
    ],

    'formularios' => [
        'max' => 5,
        'minutos' => 10,
    ],

    'uploads' => [
        'max_bytes' => 5 * 1024 * 1024,
        'max_largura' => 1280,
        'qualidade' => 82,
        'tipos' => ['image/jpeg', 'image/png', 'image/webp'],
    ],

    'eventos' => [
        'janela_padrao_dias' => 180,
        'janela_max_dias' => 400,
    ],

    'conteudo' => [
        'chaves' => ['horarios', 'endereco', 'redes', 'email', 'textos', 'lideres', 'historia'],
        'max_bytes' => 64 * 1024,
    ],

    'cors' => [
        'origens_dev' => ['http://localhost:5173', 'http://127.0.0.1:5173'],
    ],
];
