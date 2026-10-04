import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { buildWeb } from './build.mjs'
import { lintCss, tokenHexMap } from './lint/check-consumer.mjs'
import { findMockupMarkers } from './lint/check-tbc.mjs'
import { loadTokens, renderTokenModules } from './token-model.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(repoRoot, 'web/dist')
const errors = []

function fail(message) {
  errors.push(message)
}

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else out.push(path.relative(distDir, full).split(path.sep).join('/'))
  }
  return out.sort()
}

function allowed(rel) {
  if (['x-ui.css', 'theme-script.js', 'xui.js', 'manifest.json'].includes(rel)) return true
  if (rel.startsWith('fonts/')) {
    const ext = rel.slice(rel.lastIndexOf('.') + 1).toLowerCase()
    return ['woff2', 'woff', 'ttf', 'otf'].includes(ext)
  }
  return false
}

function sri(file) {
  return `sha384-${createHash('sha384').update(fs.readFileSync(file)).digest('base64')}`
}

const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))
const tokens = loadTokens(repoRoot)
const expected = renderTokenModules(tokens, pkg.version)
for (const [rel, text] of Object.entries({
  'web/tokens.ts': expected.ts,
  'web/tokens.js': expected.js,
  'web/tokens.d.ts': expected.dts,
})) {
  const disk = fs.existsSync(path.join(repoRoot, rel)) ? fs.readFileSync(path.join(repoRoot, rel), 'utf8') : ''
  if (disk !== text) fail(`${rel} does not match web/tokens.json. Run npm run build:web and commit the generated token modules.`)
}
if (errors.length) {
  for (const error of errors) console.error(error)
  process.exit(1)
}

buildWeb({ dev: false })

const found = walk(distDir)
const extras = found.filter((rel) => !allowed(rel))
if (extras.length) fail(`web/dist has files outside the allowlist:\n${extras.join('\n')}`)
for (const name of ['x-ui.css', 'theme-script.js', 'xui.js', 'manifest.json']) {
  if (!found.includes(name)) fail(`missing web/dist/${name}`)
}
if (!found.some((rel) => rel.startsWith('fonts/') && rel.endsWith('.woff2'))) fail('missing a woff2 file under web/dist/fonts/')
if (found.some((rel) => rel.endsWith('.svg') || rel.endsWith('.html') || rel.endsWith('.map') || rel.endsWith('.txt'))) {
  fail('web/dist contains svg, html, a source map, or a text file')
}

const manifest = JSON.parse(fs.readFileSync(path.join(distDir, 'manifest.json'), 'utf8'))
if (manifest.version !== pkg.version) fail(`manifest version ${manifest.version} != package.json ${pkg.version}`)
if (JSON.stringify(manifest.files) !== JSON.stringify(found)) fail('manifest.json files list does not match web/dist')
if (JSON.stringify(manifest.brands) !== JSON.stringify(['zane', 'opcorbit'])) fail('manifest brands must be zane, opcorbit')
if (!Array.isArray(manifest.components) || !manifest.components.includes('ThemeToggle') || !manifest.components.includes('CopyButton')) {
  fail('manifest component list is incomplete')
}
for (const name of ['x-ui.css', 'theme-script.js', 'xui.js']) {
  const actual = sri(path.join(distDir, name))
  if (manifest.sri?.[name] !== actual) fail(`SRI mismatch for ${name}: manifest ${manifest.sri?.[name]} computed ${actual}`)
}

const css = fs.readFileSync(path.join(distDir, 'x-ui.css'), 'utf8')
const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((match) => match[1].replace(/["']/g, ''))
if (urls.length === 0) fail('x-ui.css has no font urls')
for (const url of urls) {
  if (url.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(url)) fail(`font url must be relative: ${url}`)
  const file = path.resolve(distDir, url)
  const rel = path.relative(distDir, file)
  if (rel.startsWith('..') || path.isAbsolute(rel)) fail(`font url escapes web/dist: ${url}`)
  if (!fs.existsSync(file)) fail(`font url does not resolve: ${url}`)
}

const markers = findMockupMarkers(distDir)
if (markers.length) {
  fail(markers.slice(0, 20).map((item) => `${item.file}:${item.line}: mockup-only marker`).join('\n'))
}

for (const needle of [
  '.xui-theme-radios',
  '.xui-language-switch--seg',
  '.xui-list',
  '.xui-now-list',
  '.xui-stamp',
  '.xui-split--even',
  '.xui-hero--island',
  'prefers-reduced-motion',
  ':focus-visible',
  'SIL Open Font License, Version 1.1',
]) {
  if (!css.includes(needle)) fail(`x-ui.css is missing ${needle}`)
}
if (css.includes('.xui-band') || css.includes('linear-gradient(transparent 58%')) {
  fail('x-ui.css contains a dropped highlight or xui-band rule')
}
if ((css.match(/SIL Open Font License, Version 1.1/g) ?? []).length < 5) fail('x-ui.css is missing an OFL license')

const hexes = tokenHexMap(tokens)
const badCss = '.btn { color: #000000; }\n.xui-btn { padding: 1px; }\n:root { --brand-color: red; }\n'
const goodCss = '[data-brand="zane"] {\n  --xui-radius-component: 0;\n}\n'
const badFindings = lintCss(badCss, hexes)
const goodFindings = lintCss(goodCss, hexes)
if (badFindings.length < 3) fail(`consumer lint missed a sample finding: ${badFindings.join(' | ')}`)
if (goodFindings.length) fail(`consumer lint flagged a brand override: ${goodFindings.join(' | ')}`)

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'xui-tbc-'))
fs.writeFileSync(path.join(tmp, 'ok.css'), '.xui-btn{color:inherit}\n')
if (findMockupMarkers(tmp).length) fail('mockup-marker check false positive')
fs.writeFileSync(path.join(tmp, 'bad.html'), '<i>to confirm</i>\n')
if (!findMockupMarkers(tmp).length) fail('mockup-marker check missed a marker')
fs.rmSync(tmp, { recursive: true, force: true })

const published = await import(pathToFileURL(path.join(repoRoot, 'web/tokens.js')).href)
if (published.version !== pkg.version) fail('tokens.js version drifted')
if (published.tokens?.brands?.zane?.dark?.['--xui-color-text-primary'] !== '#FFFFFF') fail('tokens.js did not export the dark foreground')
if (published.tokens?.brands?.opcorbit?.shape?.['--xui-radius-component'] !== '4px') fail('tokens.js did not export the opcorbit radius')

if (errors.length) {
  for (const error of errors) console.error(error)
  process.exit(1)
}

console.log(`check:web ok (${found.length} files in web/dist)`)
