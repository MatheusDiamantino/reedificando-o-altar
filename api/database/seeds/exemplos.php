<?php

return [
    'lives' => [
        ['titulo' => 'Culto de Celebração', 'descricao' => 'Louvor e Palavra com o Pastor Doze.', 'link' => 'https://www.facebook.com/groups/ministerioreedificandooaltar/', 'quando' => '-7 days'],
        ['titulo' => 'Noite de Oração', 'descricao' => 'Uma noite inteira de clamor e adoração.', 'link' => 'https://www.facebook.com/groups/ministerioreedificandooaltar/', 'quando' => '-14 days'],
        ['titulo' => 'Culto da Família', 'descricao' => 'Mensagem especial para as famílias.', 'link' => 'https://www.facebook.com/PastorDoze', 'quando' => '-21 days'],
    ],
    'eventos' => [
        ['titulo' => 'Culto de Celebração', 'descricao' => 'Todo domingo, louvor e Palavra.', 'data' => date('Y-m-d', strtotime('last sunday')), 'hora' => '09:00', 'local' => 'Templo', 'recorrencia' => 'semanal'],
        ['titulo' => 'Santa Ceia', 'descricao' => 'Uma vez por mês, no dia 1º.', 'data' => date('Y-m-01'), 'hora' => '09:00', 'local' => 'Templo', 'recorrencia' => 'mensal'],
        ['titulo' => 'Conferência Reedificando', 'descricao' => 'Três noites de conferência com convidados.', 'data' => date('Y-m-d', strtotime('+20 days')), 'hora' => '19:30', 'local' => 'Templo', 'recorrencia' => null],
    ],
];
