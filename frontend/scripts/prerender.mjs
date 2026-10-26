import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(raiz, 'dist')
const ssr = join(raiz, 'dist-ssr')
const site = (process.env.SITE_URL ?? 'https://reedificandooaltar.com.br').replace(/\/$/, '')

const { render, SEO, ROTAS_PUBLICAS } = await import(pathToFileURL(join(ssr, 'entry-server.js')).href)
const modelo = await readFile(join(dist, 'index.html'), 'utf8')
await writeFile(join(dist, 'app.html'), modelo)

const escapar = (texto) => texto.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

const linkCss = modelo.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/)
const estilos = linkCss ? `<style>${await readFile(join(dist, linkCss[1]), 'utf8')}</style>` : ''
const fontes = (await readdir(join(dist, 'assets')))
  .filter((f) => /^(cinzel|montserrat)-latin-wght-normal-.+\.woff2$/.test(f))
  .map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join('\n    ')

for (const rota of ROTAS_PUBLICAS) {
  const { titulo, descricao } = SEO[rota]
  const url = `${site}${rota === '/' ? '/' : rota}`
  const corpo = await render(rota)
  const html = modelo
    .replace(linkCss?.[0] ?? '', `${fontes}\n    ${estilos}`)
    .replace(/<title>.*?<\/title>/s, `<title>${escapar(titulo)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/s, `$1${escapar(descricao)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapar(titulo)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapar(descricao)}$2`)
    .replace(
      '</head>',
      `  <link rel="canonical" href="${url}" />\n    <meta property="og:url" content="${url}" />\n  </head>`,
    )
    .replace('<div id="root"></div>', `<div id="root">${corpo}</div>`)

  const destino = rota === '/' ? join(dist, 'index.html') : join(dist, rota.slice(1), 'index.html')
  await mkdir(dirname(destino), { recursive: true })
  await writeFile(destino, html)
  console.log(`pré-renderizado ${rota} (${Math.round(html.length / 1024)} KB)`)
}

const hoje = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROTAS_PUBLICAS.map((r) => `  <url><loc>${site}${r}</loc><lastmod>${hoje}</lastmod></url>`).join('\n')}
</urlset>
`
await writeFile(join(dist, 'sitemap.xml'), sitemap)
await writeFile(
  join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${site}/sitemap.xml\n`,
)
await rm(ssr, { recursive: true, force: true })
console.log('sitemap.xml e robots.txt gerados')
