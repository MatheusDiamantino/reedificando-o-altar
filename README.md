# Ministério Reedificando o Altar

Novo site da igreja, separado em duas partes:

| Pasta | O que é | Tecnologia |
| --- | --- | --- |
| `frontend/` | Site público e, na etapa 4, o painel `/admin` | React 19, Vite, TypeScript, Tailwind 4, Three.js (React Three Fiber), GSAP, Lenis, Motion |
| `api/` | API em JSON que conversa com o banco | PHP 8.2+, Slim 4, MySQL (ou SQLite em desenvolvimento) |
| `.env.example` | Modelo do arquivo de senhas | Copie para `.env` e preencha |

## Rodar localmente

Pré-requisitos: Node 20+, PHP 8.2+ e Composer.

```bash
cp .env.example .env
```

No `.env`, para testar sem MySQL, use `DB_DRIVER=sqlite` e gere um `JWT_SECRET` com:

```bash
php -r "echo bin2hex(random_bytes(48));"
```

API (terminal 1):

```bash
cd api
composer install
php -d extension=gd -d extension=sodium bin/setup-db.php --seed --exemplos --admin-email=voce@exemplo.com --admin-nome="Seu Nome"
composer serve
```

Site (terminal 2):

```bash
cd frontend
npm install
npm run dev
```

Abra http://localhost:5173. O Vite repassa `/api` e `/uploads` para a API em `localhost:8080`.

Para testar as duas versões do altar: `?altar=full` (3D) ou `?altar=lite` (2D, a que celulares fracos recebem).

## Variáveis do `.env`

| Variável | Para quê |
| --- | --- |
| `APP_ENV` | `production` na Hostinger, `development` no seu computador |
| `APP_URL` | Endereço do site (usado nos links de recuperação de senha) |
| `DB_DRIVER`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` | Banco de dados |
| `DB_SQLITE_PATH` | Arquivo do banco quando `DB_DRIVER=sqlite` |
| `JWT_SECRET` | Chave longa e aleatória que assina o login do admin |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_TO` | E-mail do formulário de contato |
| `TURNSTILE_SECRET` | Anti-spam Cloudflare Turnstile (vazio = desligado) |
| `UPLOADS_DIR`, `UPLOADS_URL` | Onde ficam as capas das lives |
| `LEGACY_DB_*` | Banco do site antigo, usado uma vez pela migração |

O `.env` real nunca vai para o Git. Em produção ele fica na Hostinger, **fora** da pasta `public_html`, e o backup fica num gerenciador de senhas.

## Comandos do frontend

| Comando | Faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Gera `frontend/dist/` para publicar, com cada página pública já em HTML (para o Google), `sitemap.xml` e `robots.txt`. Use `SITE_URL=https://...` se o domínio for outro |
| `npm run lint` | Verifica o código |
| `npm run format` | Formata o código (Prettier + ordem das classes Tailwind) |

## Estrutura do frontend

```
frontend/
  scripts/prerender.mjs   gera o HTML de cada página pública depois do build
  public/                 imagens, favicon e o .htaccess da Hostinger
  src/
    app/                  rotas e layout geral
    pages/                site público, uma pasta por página
    admin/                painel /admin (carregado só por quem entra nele)
      paginas/            painel, lives, agenda, mensagens, conteúdo, usuários e acesso
      ui/                 botões, campos, gaveta lateral, avisos e confirmação
    components/
      altar/              a cena das 12 pedras (3D, 2D e o roteiro compartilhado)
      layout/             menu, rodapé, abertura, transições, rolagem suave
      ui/                 componentes do site público
    hooks/                hooks reutilizáveis
    lib/                  cliente da API, tipos, consultas, datas e SEO
    entry-server.tsx      renderização usada pelo pré-render
    index.css             só o tema do Tailwind (cores, fontes, animações)
```

## Painel admin

Fica em `/admin`. Administradores veem tudo. Editores veem só o painel inicial, as lives e a agenda.

| Tela | O que faz |
| --- | --- |
| Painel | Resumo e atalho para publicar uma live |
| Lives | Colar o link do YouTube preenche título e capa. Ligar e desligar o selo "Ao vivo", trocar capa, editar e excluir |
| Agenda | Calendário: clicar num dia cria um evento, arrastar muda a data (no computador). Eventos semanais e mensais |
| Mensagens | Pedidos de oração e contatos, com filtro, marcar como lida, responder por e-mail e excluir |
| Conteúdo | Horários, endereço, redes, textos, líderes (com envio de foto) e linha do tempo da história |
| Usuários | Criar, editar, desativar e excluir contas |

## Publicação

### Gerar o pacote

Na raiz do projeto:

```bash
npm run pacote
```

O comando gera o site, instala a API sem as dependências de desenvolvimento e cria o `site-novo.zip`:

```
api/            código da API (fica fora do public_html)
public_html/    site pronto, a porta da API em public_html/api/ e a pasta uploads/
```

O `.env` nunca entra no pacote. Se o Composer não estiver no PATH, informe o caminho: `COMPOSER_BIN="php composer.phar" npm run pacote`.

### Primeira publicação na Hostinger

1. **Banco novo.** No hPanel, em Bancos de dados MySQL, crie um banco novo. Não use o do site antigo: a estrutura é outra, e o `setup-db.php` se recusa a rodar nele.
2. **Turnstile (anti-spam).** Em dash.cloudflare.com, abra Turnstile e adicione o domínio.
   - A chave do site vai em `VITE_TURNSTILE_SITE_KEY` e a chave secreta em `TURNSTILE_SECRET`.
   - Gere o pacote depois disso, porque a chave do site entra no build.
3. **E-mail.** No hPanel, crie uma caixa como `contato@seudominio` e use os dados dela em `SMTP_*`. Os padrões da Hostinger são o host `smtp.hostinger.com` e a porta `587`.
4. **`.env` de produção.** No Gerenciador de Arquivos, crie o `.env` na pasta **acima** do `public_html`, a partir do `.env.example`, com:
   - `APP_ENV=production`
   - `APP_URL=https://seudominio`
   - `DB_DRIVER=mysql` e os dados do banco novo
   - um `JWT_SECRET` novo
   - `UPLOADS_DIR` com o caminho completo de `public_html/uploads`
   - os dados do banco antigo em `LEGACY_DB_*`

   Guarde uma cópia no gerenciador de senhas.
5. **Guardar o site antigo.** Renomeie a pasta `public_html` para `public_html-antigo`. Assim nada do site antigo continua acessível pela internet, e voltar atrás é só renomear de novo.
6. **Enviar.** Envie o `site-novo.zip` para a mesma pasta do `.env` e extraia lá. Vão aparecer `api/` e um `public_html/` novo.
7. **Criar as tabelas e migrar.** No terminal SSH do hPanel, dentro da pasta `api/`:

   ```bash
   php bin/setup-db.php --seed --admin-email=voce@exemplo.com --admin-nome="Seu Nome"
   php bin/migrate-legacy.php --dry-run
   php bin/migrate-legacy.php
   ```

   - O primeiro comando pede a senha do novo admin.
   - A simulação (`--dry-run`) mostra os números sem gravar nada.
   - A migração pode rodar de novo sem duplicar.
   - Quem tinha login no site antigo continua entrando com a mesma senha.
8. **Conferir.**
   - `https://seudominio/api/health` deve responder `"banco":"conectado"`.
   - Entre no `/admin`.
   - Envie um pedido de oração de teste e veja se ele chega.

### Atualizações depois do lançamento

Rode `npm run pacote` e extraia o zip por cima, na mesma pasta. O `.env`, o banco e as capas enviadas não são tocados.

### Depois que o site novo estiver no ar

- **Troque as senhas antigas.** Troque a senha do banco antigo e a do e-mail que o site antigo usava, porque elas ficaram gravadas no código antigo.
- **Apague o site antigo.** Depois de algumas semanas sem problema, apague o `public_html-antigo` e o banco antigo.
- **Google Search Console** (search.google.com/search-console):
  1. Adicione o domínio.
  2. Confirme a posse pelo registro DNS que ele mostrar. A zona DNS fica no hPanel.
  3. Em Sitemaps, envie `sitemap.xml`.
- **Perfil da Empresa no Google** (business.google.com). É isso que faz a igreja aparecer no Maps quando alguém busca "igreja perto de mim".
  1. Cadastre a igreja na categoria "Igreja evangélica", com o mesmo endereço e os mesmos horários do site.
  2. Coloque o site como link e adicione fotos.
  3. Confirme o perfil pelo código que o Google envia.

O `.htaccess` força HTTPS, serve as páginas pré-geradas e manda qualquer outra rota (como `/admin`) para o app.
