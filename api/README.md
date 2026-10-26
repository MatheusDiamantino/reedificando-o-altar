# API do Ministério Reedificando o Altar

API em PHP que atende o site (React) e o painel admin. Responde sempre em JSON e é a única parte que conhece o banco, o e-mail e as senhas.

- PHP 8.2+ com Slim 4
- MySQL na Hostinger (produção) ou SQLite (desenvolvimento, sem instalar nada)
- Senhas e chaves só no arquivo `.env`, nunca no código

## Organização das pastas

```
api/
  bin/                  scripts de terminal
    setup-db.php          cria as tabelas e os dados iniciais
    migrate-legacy.php    copia os dados do banco do site antigo
  config/
    routes.php            todas as rotas da API em um só lugar
    settings.php          limites e regras (tempo de sessão, tamanho de imagem...)
  database/
    schema.mysql.sql      estrutura do banco em produção
    schema.sqlite.sql     a mesma estrutura para desenvolvimento
    seeds/                conteúdo inicial do site e dados de exemplo
  public/
    index.php             única porta de entrada (vai para public_html/api/)
    .htaccess             manda tudo para o index.php
  src/
    Kernel.php            monta a aplicação (middlewares + rotas)
    Controllers/          recebem a requisição, validam e respondem
    Middleware/           login, CSRF, CORS, cabeçalhos de segurança, erros
    Repositories/         todo o SQL fica aqui, uma classe por tabela
    Presenters/           formato do JSON de cada tipo de dado
    Services/             e-mail, uploads, YouTube, sessão, anti-spam...
    Support/              .env, banco, validação, respostas JSON
  storage/logs/         erros gravados por mês (nunca mostrados ao visitante)
```

Regra: controller não escreve SQL, repository não conhece HTTP, e cada arquivo tem uma única classe.

## Rodando no computador

Na pasta `api/`:

```bash
php -d extension=zip D:\composer\composer.phar install
```

Na raiz do repositório, copie `.env.example` para `.env` e ajuste:

```
APP_ENV=development
DB_DRIVER=sqlite
JWT_SECRET=<gere com: php -r "echo bin2hex(random_bytes(48));">
```

Crie o banco local com um admin e dados de exemplo:

```bash
php -d extension=gd -d extension=sodium bin/setup-db.php --seed --exemplos --admin-email=voce@exemplo.com --admin-nome="Seu Nome"
```

Sem `--admin-senha`, a senha é pedida no terminal (mínimo de 10 caracteres).

Suba o servidor:

```bash
composer serve
```

A API fica em `http://localhost:8080/api` e as capas em `http://localhost:8080/uploads/...`. No Vite, faça proxy de `/api` e `/uploads` para `http://localhost:8080`.

As extensões `gd` (imagens) e `sodium` são ativadas pelo `-d` em cada comando. Assim não é preciso mexer no `php.ini`. Na Hostinger elas já vêm ligadas.

## O arquivo .env

| Chave | Para quê |
| --- | --- |
| `APP_ENV` | `production` no servidor, `development` no computador |
| `APP_URL` | endereço do site, usado no link de redefinir senha |
| `DB_DRIVER` | `mysql` ou `sqlite` |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` | banco MySQL |
| `DB_SQLITE_PATH` | arquivo SQLite (só em desenvolvimento) |
| `JWT_SECRET` | chave que assina o login. Mínimo de 32 caracteres, ideal 96 |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | e-mail da Hostinger |
| `MAIL_TO` | quem recebe as mensagens do formulário de contato |
| `TURNSTILE_SECRET` | anti-spam do Cloudflare. Vazio desliga a verificação |
| `UPLOADS_DIR`, `UPLOADS_URL` | onde as capas são gravadas e o endereço público delas |
| `LEGACY_DB_*` | banco do site antigo, usado só na migração |

O `.env` é procurado nesta ordem: variável de ambiente `ENV_PATH`, pasta da API, pasta acima da API. Valores com `#` ou espaços precisam de aspas: `DB_PASS="minha#senha"`.

## Como o login funciona

1. `POST /api/auth/login` confere a senha e devolve dois cookies:
   - `mra_session`: o token de acesso. É `HttpOnly`, então o JavaScript da página não consegue ler. Dura 8 horas, ou 30 dias com `"lembrar": true`.
   - `mra_csrf`: um código aleatório que o JavaScript consegue ler.
2. Em toda escrita do admin (`POST`, `PUT`, `PATCH`, `DELETE`) e no logout, o front envia o valor de `mra_csrf` no cabeçalho `X-CSRF-Token`. Sem ele, a resposta é `403 csrf_invalido`.
3. Com o fetch, use `credentials: 'include'`.

Proteções:

- **Limites de tentativas de login:**
  - 5 senhas erradas em 15 minutos para o mesmo e-mail no mesmo IP.
  - 20 por hora para o mesmo e-mail, vindas de qualquer lugar.
  - 30 em 15 minutos para o mesmo IP. Endereços IPv6 contam por faixa /64.
- **E-mails cadastrados não vazam:** e-mail inexistente e senha errada levam o mesmo tempo para responder.
- **"Esqueci a senha":** no máximo 3 pedidos por hora para o mesmo e-mail.
- **Armazenamento:** as senhas são guardadas com Argon2id. As do site antigo (bcrypt) continuam funcionando e são regravadas em Argon2id no primeiro login.
- **Sessões antigas:** trocar ou redefinir a senha encerra todas as sessões abertas, pela coluna `sessao_versao`. Quem trocou a própria senha recebe uma sessão nova na hora.
- **Senha atual:** para trocar o próprio e-mail ou a própria senha, é preciso informar a senha atual (`senha_atual`).
- **Usuário desativado** não entra.
- **Só JSON:** escritas aceitam apenas `application/json`. A exceção são os envios de imagem (`multipart/form-data`). Isso impede formulários de outros sites de enviarem dados para a API.

Papéis: **admin** pode tudo. **editor** só cuida de lives e agenda.

## Respostas

- Sucesso: `{"data": ...}`
- Erro: `{"error": {"code": "...", "message": "...", "fields": {...}}}`. O campo `fields` só aparece em erros de validação (422) e traz a mensagem de cada campo.

| Status | Quando |
| --- | --- |
| 400 | JSON quebrado, anti-spam falhou, link de senha expirado |
| 401 | não está logado, ou e-mail/senha errados |
| 403 | sem permissão, CSRF inválido, usuário desativado |
| 404 | não encontrado |
| 415 | escrita enviada em formato que não é JSON |
| 422 | dados inválidos (veja `fields`) |
| 429 | muitas tentativas |
| 500 | erro interno (em produção, sem detalhes; o erro fica no log) |

## Rotas

### Públicas

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/api/health` | confere se a API e o banco estão no ar |
| GET | `/api/conteudo` | textos, horários, endereço e redes do site |
| GET | `/api/lives?limit=20&offset=0&q=` | lives da mais nova para a mais antiga. O total vem no cabeçalho `X-Total-Count` |
| GET | `/api/lives/atual` | a live marcada como ao vivo, ou `null` |
| GET | `/api/lives/{id}` | uma live |
| GET | `/api/eventos?de=AAAA-MM-DD&ate=AAAA-MM-DD` | ocorrências no período, com eventos semanais e mensais já expandidos. Padrão: de hoje até 180 dias, máximo de 400 dias |
| POST | `/api/contato` | `{nome, email, assunto, mensagem, turnstile_token?}`. Salva no painel e envia e-mail |
| POST | `/api/oracao` | `{nome?, pedido, turnstile_token?}`. Salva no painel |

Os formulários aceitam no máximo 5 envios a cada 10 minutos por visitante. Eles também devem ter um campo escondido `website`: se vier preenchido, é robô, e a API finge que deu certo sem salvar nada.

### Login

| Método | Rota | O que faz |
| --- | --- | --- |
| POST | `/api/auth/login` | `{email, senha, lembrar?}` |
| POST | `/api/auth/logout` | encerra a sessão (exige `X-CSRF-Token`) |
| GET | `/api/auth/me` | usuário logado, ou 401 |
| POST | `/api/auth/esqueci` | `{email}`. Sempre responde 200 e envia o link se o e-mail existir |
| POST | `/api/auth/redefinir` | `{token, senha}`. O link vale 60 minutos |

### Admin (admin e editor)

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/api/admin/resumo` | números do painel inicial |
| GET | `/api/admin/oembed?url=` | busca título e capa de um link do YouTube |
| POST | `/api/admin/lives` | `{link, data_live, titulo?, descricao?, ao_vivo?, destaque?, baixar_capa?}`. Sem título, busca no YouTube. A capa do YouTube é baixada e salva em WebP |
| PUT | `/api/admin/lives/{id}` | altera só os campos enviados. `baixar_capa: true` baixa a capa de novo |
| DELETE | `/api/admin/lives/{id}` | exclui a live e a capa |
| POST | `/api/admin/lives/{id}/thumbnail` | envio de capa (multipart, campo `imagem`, JPG/PNG/WebP até 5 MB). Vira WebP com no máximo 1280 px de largura |
| GET | `/api/admin/eventos` | eventos como cadastrados (sem expandir as repetições) |
| POST | `/api/admin/eventos` | `{titulo, data, hora?, local?, descricao?, recorrencia?: semanal \| mensal}` |
| PUT | `/api/admin/eventos/{id}` | mesmos campos do POST |
| DELETE | `/api/admin/eventos/{id}` | exclui |

Marcar uma live como `ao_vivo` desmarca todas as outras.

### Admin (só admin)

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/api/admin/mensagens?tipo=contato\|oracao&lida=true\|false` | caixa de entrada (últimas 200) |
| PATCH | `/api/admin/mensagens/{id}` | `{lida}` |
| DELETE | `/api/admin/mensagens/{id}` | exclui |
| POST | `/api/admin/imagens` | envio de imagem do site (multipart, campo `imagem`). Devolve `{url}` |
| PUT | `/api/admin/conteudo` | `{chave: valor}`. Chaves aceitas: `horarios`, `endereco`, `redes`, `email`, `textos`, `lideres`, `historia` |
| GET | `/api/admin/usuarios` | lista (nunca devolve a senha) |
| POST | `/api/admin/usuarios` | `{nome, email, senha, papel}` |
| PUT | `/api/admin/usuarios/{id}` | `{nome?, email?, papel?, ativo?, senha?}`. Ninguém pode desativar, rebaixar ou excluir a si mesmo |
| DELETE | `/api/admin/usuarios/{id}` | exclui |

## Publicando na Hostinger

O passo a passo completo está no [README da raiz](../README.md#publicação). O `npm run pacote` monta esta estrutura:

```
<pasta acima do public_html>/
  .env                      senhas (criado à mão, nunca vai no pacote)
  api/                      bin, config, database, src, storage, vendor, composer.json
  public_html/
    api/
      index.php             copiado de api/public/index.php
      .htaccess             copiado de api/public/.htaccess
      api-root.php          aponta para ../../api, sem precisar do nome da conta
    uploads/                capas e fotos (o PHP precisa poder gravar aqui)
```

### Migração do site antigo

`bin/migrate-legacy.php` lê o banco antigo (`LEGACY_DB_*`) e copia:

- `lives`: mantém o id, extrai o vídeo do link e converte a capa guardada no banco em arquivo WebP. Se a capa não for uma imagem válida, a live usa a capa do YouTube ou a imagem padrão do site. Quando o banco antigo só tem a data, o horário fica 09:00.
- `eventos`: mantém o id e a data, sem horário.
- Tags HTML nos títulos e descrições antigos são removidas.
- Se a conexão com o banco antigo falhar, o script avisa quais variáveis conferir e não grava nada.
- `user`: mantém a senha (bcrypt), vira admin, e só fica ativo quem tinha status `Ativo`.

Itens que já existem (mesmo id ou mesmo e-mail) são pulados, então dá para rodar de novo sem duplicar. Use `--dry-run` para ver os números sem gravar nada.
