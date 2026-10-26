CREATE TABLE IF NOT EXISTS usuarios (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    nome         TEXT NOT NULL,
    email        TEXT NOT NULL UNIQUE,
    senha_hash   TEXT NOT NULL,
    papel        TEXT NOT NULL DEFAULT 'editor' CHECK (papel IN ('admin', 'editor')),
    ativo        INTEGER NOT NULL DEFAULT 1,
    criado_em    TEXT NOT NULL,
    ultimo_login TEXT NULL,
    sessao_versao INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS lives (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo        TEXT NOT NULL,
    descricao     TEXT NULL,
    link          TEXT NOT NULL,
    plataforma    TEXT NOT NULL DEFAULT 'youtube',
    video_id      TEXT NULL,
    thumbnail     TEXT NULL,
    data_live     TEXT NOT NULL,
    ao_vivo       INTEGER NOT NULL DEFAULT 0,
    destaque      INTEGER NOT NULL DEFAULT 0,
    criado_em     TEXT NOT NULL,
    atualizado_em TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS lives_data ON lives (data_live);

CREATE TABLE IF NOT EXISTS eventos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo      TEXT NOT NULL,
    descricao   TEXT NULL,
    data        TEXT NOT NULL,
    hora        TEXT NULL,
    local       TEXT NULL,
    recorrencia TEXT NULL CHECK (recorrencia IN ('semanal', 'mensal')),
    criado_em   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS eventos_data ON eventos (data);

CREATE TABLE IF NOT EXISTS mensagens (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo      TEXT NOT NULL CHECK (tipo IN ('contato', 'oracao')),
    nome      TEXT NULL,
    email     TEXT NULL,
    assunto   TEXT NULL,
    texto     TEXT NOT NULL,
    publico   INTEGER NOT NULL DEFAULT 0,
    lida      INTEGER NOT NULL DEFAULT 0,
    criado_em TEXT NOT NULL,
    ip_hash   TEXT NULL
);
CREATE INDEX IF NOT EXISTS mensagens_lida ON mensagens (lida, tipo);

CREATE TABLE IF NOT EXISTS conteudo (
    chave         TEXT NOT NULL PRIMARY KEY,
    valor         TEXT NOT NULL,
    atualizado_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS login_tentativas (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    chave      TEXT NOT NULL,
    tentado_em TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS tentativas_chave ON login_tentativas (chave, tentado_em);

CREATE TABLE IF NOT EXISTS senha_resets (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expira_em  TEXT NOT NULL,
    usado      INTEGER NOT NULL DEFAULT 0
);
