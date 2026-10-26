# Publicação na Hostinger

## Variáveis do `.env`

| Variável | Para quê |
| --- | --- |
| `APP_ENV` | `production` no servidor, `development` no computador |
| `APP_URL` | Endereço do site, usado nos links de recuperação de senha e nos e-mails |
| `DB_DRIVER`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` | Banco de dados |
| `DB_SQLITE_PATH` | Arquivo do banco quando `DB_DRIVER=sqlite` |
| `JWT_SECRET` | Chave longa e aleatória que assina o login do painel |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Caixa que envia os e-mails do site |
| `MAIL_TO` | Para onde vão as mensagens do formulário de contato |
| `TURNSTILE_SECRET`, `VITE_TURNSTILE_SITE_KEY` | Anti-spam Cloudflare Turnstile. Vazio = desligado |
| `UPLOADS_DIR`, `UPLOADS_URL` | Onde ficam as imagens enviadas pelo painel |
| `LEGACY_DB_*` | Banco do site antigo, usado só pela migração |

O `.env` nunca vai para o Git nem para o pacote. No servidor ele fica **fora** do `public_html`, na mesma pasta que `api/`.

## Gerar o pacote

```bash
npm run pacote
```

O comando gera o site, instala a API sem as dependências de desenvolvimento e cria o `site-novo.zip`:

```
api/            código da API, fora do public_html
public_html/    site pronto, a porta da API em public_html/api/ e a pasta uploads/
```

Se o Composer não estiver no PATH: `COMPOSER_BIN="php composer.phar" npm run pacote`.

## Primeira publicação

1. **PHP.** No hPanel, em Configuração do PHP, escolha a versão 8.2 ou mais nova. Confira também no SSH com `php -v`.
2. **Banco novo.** Em Bancos de dados MySQL, crie um banco só para o site. O `setup-db.php` se recusa a rodar num banco que tenha as tabelas do site antigo.
3. **E-mail.** Crie uma caixa como `contato@seudominio` para os `SMTP_*`. Os padrões da Hostinger são o host `smtp.hostinger.com` e a porta `587`.
4. **Enviar.** Envie o `site-novo.zip` para a pasta acima do `public_html` e extraia lá:

   ```bash
   unzip -o site-novo.zip && rm site-novo.zip
   find api public_html -type d -exec chmod 755 {} +
   find api public_html -type f -exec chmod 644 {} +
   ```

5. **`.env`.** Crie o `.env` na mesma pasta, a partir do `.env.example`, com `chmod 600`. Senhas com caracteres especiais vão entre aspas simples.
6. **Tabelas e admin.** Dentro de `api/`:

   ```bash
   php bin/setup-db.php --seed --admin-email=voce@exemplo.com --admin-nome="Seu Nome"
   ```

7. **Migração do site antigo (opcional).**

   ```bash
   php bin/migrate-legacy.php --dry-run
   php bin/migrate-legacy.php
   ```

   A simulação mostra os números sem gravar nada, e a migração pode rodar de novo sem duplicar. Quem tinha login no site antigo continua entrando com a mesma senha.

8. **Conferir.**
   - `https://seudominio/api/health` deve responder `"banco":"conectado"`.
   - O login no `/admin` funciona.
   - Um pedido de oração de teste aparece no painel.
   - O formulário de contato envia o e-mail.
9. **CDN.** Os limites de tentativas usam o `REMOTE_ADDR`. Confira se ele mostra o IP real do visitante, e não o da CDN.

## Atualizações

Rode `npm run pacote`, envie o zip e extraia por cima, na mesma pasta. O `.env`, o banco e as imagens enviadas não são tocados.

## Depois do lançamento

- **Turnstile:** crie as chaves em dash.cloudflare.com, coloque no `.env` e gere o pacote de novo, porque a chave do site entra no build.
- **Google Search Console:** adicione o domínio, confirme pelo DNS e envie o `sitemap.xml`.
- **Perfil da Empresa no Google:** cadastre a igreja com o mesmo endereço e os mesmos horários do site.
