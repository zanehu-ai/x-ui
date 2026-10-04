import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { transform } from 'lightningcss'
import { collectFonts, licenseComment } from './fonts.mjs'
import { assertContrast } from './contrast.mjs'
import { generateTokenCss, loadTokens, renderTokenModules } from './token-model.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(repoRoot, 'web/dist')
const devDir = path.join(repoRoot, 'web/dist-dev')

export const COMPONENTS = [
  'Container',
  'SkipLink',
  'Label',
  'Heading',
  'Header',
  'Drawer',
  'ThemeToggle',
  'LanguageSwitch',
  'ThemeRadios',
  'Button',
  'Link',
  'ArrowLink',
  'Hero',
  'Avatar',
  'Section',
  'ProductList',
  'ProductCard',
  'Grid',
  'Card',
  'MetaList',
  'Split',
  'Contact',
  'List',
  'Stamp',
  'NowList',
  'Footer',
  'CopyButton',
  'Prose',
  'Reveal',
]

const ROOT_FILES = ['x-ui.css', 'theme-script.js', 'xui.js', 'manifest.json']

export function buildWeb({ dev = false } = {}) {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))
  const tokens = loadTokens(repoRoot)
  const csv = fs.readFileSync(path.join(repoRoot, 'web/contrast.csv'), 'utf8')
  const svg = fs.readFileSync(path.join(repoRoot, 'web/demo/opcorbit-orbit.svg'), 'utf8')
  assertContrast(tokens, csv, svg)

  const modules = renderTokenModules(tokens, pkg.version)
  fs.writeFileSync(path.join(repoRoot, 'web/tokens.ts'), modules.ts)
  fs.writeFileSync(path.join(repoRoot, 'web/tokens.js'), modules.js)
  fs.writeFileSync(path.join(repoRoot, 'web/tokens.d.ts'), modules.dts)

  fs.rmSync(distDir, { recursive: true, force: true })
  fs.mkdirSync(distDir, { recursive: true })

  const fonts = collectFonts(repoRoot)
  for (const file of fonts.files) {
    const dest = path.join(distDir, file.rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(file.from, dest)
  }

  const components = fs.readFileSync(path.join(repoRoot, 'web/components.css'), 'utf8')
  if (/#[0-9a-fA-F]{3,8}\b/.test(components)) {
    throw new Error('web/components.css must not contain raw hex colours')
  }
  const raw = `${fonts.css}\n${generateTokenCss(tokens)}\n${components}`
  const minified = transform({
    filename: 'x-ui.css',
    code: Buffer.from(raw),
    minify: true,
    sourceMap: false,
  }).code
  const css = Buffer.concat([minified, Buffer.from(licenseComment(fonts.licenses))])
  fs.writeFileSync(path.join(distDir, 'x-ui.css'), css)
  fs.copyFileSync(path.join(repoRoot, 'web/theme-script.js'), path.join(distDir, 'theme-script.js'))
  fs.copyFileSync(path.join(repoRoot, 'web/xui.js'), path.join(distDir, 'xui.js'))

  const fontRels = fonts.files.map((file) => file.rel).sort()
  const files = [...ROOT_FILES, ...fontRels].sort()
  const manifest = {
    name: pkg.name,
    version: pkg.version,
    files,
    sri: {
      'x-ui.css': sri(css),
      'theme-script.js': sri(fs.readFileSync(path.join(distDir, 'theme-script.js'))),
      'xui.js': sri(fs.readFileSync(path.join(distDir, 'xui.js'))),
    },
    components: COMPONENTS,
    brands: Object.keys(tokens.brands),
  }
  fs.writeFileSync(path.join(distDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

  if (dev) writeDev()
  return manifest
}

function sri(buf) {
  return `sha384-${createHash('sha384').update(buf).digest('base64')}`
}

function writeDev() {
  fs.rmSync(devDir, { recursive: true, force: true })
  const demoDir = path.join(devDir, 'demo')
  const lintDir = path.join(devDir, 'lint')
  fs.mkdirSync(demoDir, { recursive: true })
  fs.mkdirSync(lintDir, { recursive: true })
  const html = fs.readFileSync(path.join(repoRoot, 'web/demo/index.html'), 'utf8')
    .replaceAll('{{XUI_CSS}}', '../../dist/x-ui.css')
    .replaceAll('{{THEME_JS}}', '../../dist/theme-script.js')
    .replaceAll('{{XUI_JS}}', '../../dist/xui.js')
  fs.writeFileSync(path.join(demoDir, 'index.html'), html)
  fs.copyFileSync(path.join(repoRoot, 'web/demo/opcorbit-orbit.svg'), path.join(demoDir, 'opcorbit-orbit.svg'))
  for (const name of fs.readdirSync(path.join(repoRoot, 'web/lint'))) {
    const from = path.join(repoRoot, 'web/lint', name)
    if (fs.statSync(from).isFile()) fs.copyFileSync(from, path.join(lintDir, name))
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  buildWeb({ dev: process.argv.includes('--dev') })
}
