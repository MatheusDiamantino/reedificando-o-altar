CREATE TABLE IF NOT EXISTS usuarios (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome         VARCHAR(120) NOT NULL,
    email        VARCHAR(190) NOT NULL,
    senha_hash   VARCHAR(255) NOT NULL,
    papel        ENUM('admin', 'editor') NOT NULL DEFAULT 'editor',
    ativo        TINYINT(1) NOT NULL DEFAULT 1,
    criado_em    DATETIME NOT NULL,
    ultimo_login DATETIME NULL,
    sessao_versao INT UNSIGNED NOT NULL DEFAULT 0,
    UNIQUE KEY usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lives (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo        VARCHAR(200) NOT NULL,
    descricao     TEXT NULL,
    link          VARCHAR(500) NOT NULL,
    plataforma    VARCHAR(20) NOT NULL DEFAULT 'youtube',
    video_id      VARCHAR(64) NULL,
    thumbnail     VARCHAR(255) NULL,
    data_live     DATETIME NOT NULL,
    ao_vivo       TINYINT(1) NOT NULL DEFAULT 0,
    destaque      TINYINT(1) NOT NULL DEFAULT 0,
    criado_em     DATETIME NOT NULL,
    atualizado_em DATETIME NOT NULL,
    KEY lives_data (data_live),
    KEY lives_ao_vivo (ao_vivo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eventos (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo      VARCHAR(200) NOT NULL,
    descricao   TEXT NULL,
    data        DATE NOT NULL,
    hora        TIME NULL,
    local       VARCHAR(200) NULL,
    recorrencia ENUM('semanal', 'mensal') NULL,
    criado_em   DATETIME NOT NULL,
    KEY eventos_data (data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS mensagens (
    id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo      ENUM('contato', 'oracao') NOT NULL,
    nome      VARCHAR(120) NULL,
    email     VARCHAR(190) NULL,
    assunto   VARCHAR(200) NULL,
    texto     TEXT NOT NULL,
    publico   TINYINT(1) NOT NULL DEFAULT 0,
    lida      TINYINT(1) NOT NULL DEFAULT 0,
    criado_em DATETIME NOT NULL,
    ip_hash   CHAR(64) NULL,
    KEY mensagens_lida (lida, tipo),
    KEY mensagens_criado (criado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS conteudo (
    chave         VARCHAR(60) NOT NULL PRIMARY KEY,
    valor         MEDIUMTEXT NOT NULL,
    atualizado_em DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS login_tentativas (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    chave      VARCHAR(255) NOT NULL,
    tentado_em DATETIME NOT NULL,
    KEY tentativas_chave (chave(191), tentado_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS senha_resets (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL,
    expira_em  DATETIME NOT NULL,
    usado      TINYINT(1) NOT NULL DEFAULT 0,
    UNIQUE KEY resets_token (token_hash),
    CONSTRAINT resets_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
