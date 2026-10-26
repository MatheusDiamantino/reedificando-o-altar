import { execSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = fileURLToPath(new URL('..', import.meta.url))
const pacote = join(raiz, 'pacote')
const zip = join(raiz, 'site-novo.zip')
const api = join(raiz, 'api')
const site = join(pacote, 'public_html')

const rodar = (comando, cwd) => execSync(comando, { cwd, stdio: 'inherit', env: process.env })
const etapa = (texto) => console.log(`\n> ${texto}`)

rmSync(pacote, { recursive: true, force: true })
rmSync(zip, { force: true })

etapa('Gerando o site')
rodar('npm run build', join(raiz, 'frontend'))
cpSync(join(raiz, 'frontend', 'dist'), site, { recursive: true })

etapa('Copiando a API')
for (const item of ['bin', 'config', 'database', 'src', 'composer.json', 'composer.lock']) {
  cpSync(join(api, item), join(pacote, 'api', item), { recursive: true })
}
mkdirSync(join(pacote, 'api', 'storage', 'logs'), { recursive: true })
rodar(
  `${process.env.COMPOSER_BIN ?? 'composer'} install --no-dev --optimize-autoloader --no-interaction`,
  join(pacote, 'api'),
)

etapa('Montando public_html/api')
mkdirSync(join(site, 'api'), { recursive: true })
cpSync(join(api, 'public', 'index.php'), join(site, 'api', 'index.php'))
cpSync(join(api, 'public', '.htaccess'), join(site, 'api', '.htaccess'))
writeFileSync(join(site, 'api', 'api-root.php'), "<?php\n\nreturn dirname(__DIR__, 2) . '/api';\n")
for (const pasta of ['lives', 'site']) mkdirSync(join(site, 'uploads', pasta), { recursive: true })

etapa('Compactando')
const tar = process.platform === 'win32' ? join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe') : null
if (tar && existsSync(tar)) rodar(`"${tar}" -a -c -f "${zip}" api public_html`, pacote)
else rodar(`zip -rq "${zip}" api public_html`, pacote)

console.log(`\nPronto: ${zip}`)
console.log('Envie para a pasta acima do public_html na Hostinger e extraia lá. O .env não vai no pacote.')
