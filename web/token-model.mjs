import fs from 'node:fs'
import path from 'node:path'

export const BRAND_DECLARATION_COUNT = 83

const COLOR_LINKS = [
  ['--xui-color-bg-raised', '--xui-color-bg-base'],
  ['--xui-color-bg-inverse', '--xui-color-text-primary'],
  ['--xui-color-text-inverse', '--xui-color-bg-base'],
  ['--xui-color-accent-text', '--xui-color-text-primary'],
  ['--xui-color-accent-fill', '--xui-color-text-primary'],
  ['--xui-color-action-fill', '--xui-color-text-primary'],
  ['--xui-color-accent-on', '--xui-color-bg-base'],
  ['--xui-color-action-on', '--xui-color-bg-base'],
  ['--xui-color-avatar-ring', '--xui-color-border-subtle'],
]

export function loadTokens(repoRoot) {
  const file = path.join(repoRoot, 'web/tokens.json')
  const tokens = JSON.parse(fs.readFileSync(file, 'utf8'))
  assertTokenModel(tokens)
  return tokens
}

export function assertTokenModel(tokens) {
  const dark = Object.fromEntries(tokens.color.dark)
  const light = Object.fromEntries(tokens.color.light)
  if (tokens.color.dark.length !== tokens.color.light.length) {
    throw new Error('dark and light colour lists differ in length')
  }
  if (dark['--xui-color-border-strong'] !== '#767676' || light['--xui-color-border-strong'] !== '#767676') {
    throw new Error('border.strong must be #767676 in both themes')
  }
  for (const palette of [dark, light]) {
    for (const [name, sameAs] of COLOR_LINKS) {
      if (palette[name] !== palette[sameAs]) {
        throw new Error(`${name} must equal ${sameAs}`)
      }
    }
    if (palette['--xui-color-highlight'] !== 'transparent') throw new Error('highlight must be transparent')
    if (palette['--xui-color-avatar-halo'] !== 'transparent') throw new Error('avatar halo must be transparent')
  }
  const brands = Object.entries(tokens.brands)
  if (brands.map(([id]) => id).join(',') !== 'zane,opcorbit') {
    throw new Error('brands must be zane and opcorbit')
  }
  for (const [, brand] of brands) {
    if (brand.shape.length !== 7) throw new Error('each brand shape block must stay 7 declarations')
    if (countBrandDeclarations(brand, tokens) !== BRAND_DECLARATION_COUNT) {
      throw new Error(`brand block must emit ${BRAND_DECLARATION_COUNT} custom properties`)
    }
  }
  if (tokens.brands.zane.shape.find(([name]) => name === '--xui-radius-component')[1] !== '2px') {
    throw new Error('zane radius is 2px')
  }
  if (tokens.brands.opcorbit.shape.find(([name]) => name === '--xui-radius-component')[1] !== '4px') {
    throw new Error('opcorbit radius is 4px')
  }
}

function countBrandDeclarations(brand, tokens) {
  return brand.shape.length + tokens.color.dark.length + tokens.color.light.length * 2 + tokens.color.dark.length
}

export function generateTokenCss(tokens) {
  const parts = [rule(tokens.base.selector, tokens.base.declarations)]
  for (const scope of tokens.scopes) {
    const block = rule(scope.selector, scope.declarations)
    parts.push(scope.media ? `@media ${scope.media} {\n${indent(block)}}\n` : block)
  }
  for (const brand of Object.values(tokens.brands)) {
    parts.push(brandCss(brand, tokens))
  }
  const css = parts.join('\n')
  assertBrandCss(css, tokens)
  return css
}

function brandCss(brand, tokens) {
  const dark = [...brand.shape, ...tokens.color.dark]
  const light = tokens.color.light
  const island = tokens.color.dark
  return [
    rule(brand.selector, dark),
    rule(`${brand.selector}[data-theme="light"]`, light),
    `@media (prefers-color-scheme:light) {\n${indent(rule(`${brand.selector}:not([data-theme])`, light))}}\n`,
    rule(`${brand.selector} .xui-on-image`, island),
  ].join('\n')
}

function rule(selector, declarations) {
  const body = declarations.map(([name, value]) => `  ${name}:${value};`).join('\n')
  return `${selector} {\n${body}\n}\n`
}

function indent(block) {
  return block.split('\n').map((line) => (line ? `  ${line}` : line)).join('\n')
}

function assertBrandCss(css, tokens) {
  if (css.includes('.xui-band') || css.includes('.xui-btn') || css.includes('.xui-header')) {
    throw new Error('brand token CSS must stay token-only')
  }
  for (const name of css.match(/\.(-?[_a-zA-Z][\w-]*)/g) ?? []) {
    if (name !== '.xui-on-image') throw new Error(`unexpected class in token CSS: ${name}`)
  }
  for (const brand of Object.values(tokens.brands)) {
    if (!css.includes(brand.selector)) throw new Error(`missing ${brand.selector}`)
  }
  const decls = css.match(/--[a-z0-9-]+\s*:/g) ?? []
  for (const decl of decls) {
    if (!decl.startsWith('--xui-')) throw new Error(`non-prefixed token ${decl}`)
  }
  const baseCount = tokens.base.declarations.length + tokens.scopes.reduce((sum, scope) => sum + scope.declarations.length, 0)
  const expected = baseCount + Object.keys(tokens.brands).length * BRAND_DECLARATION_COUNT
  if (decls.length !== expected) {
    throw new Error(`token CSS has ${decls.length} declarations; expected ${expected}`)
  }
}

export function tokenExportData(tokens) {
  const color = {
    dark: Object.fromEntries(tokens.color.dark),
    light: Object.fromEntries(tokens.color.light),
  }
  const brands = {}
  for (const [id, brand] of Object.entries(tokens.brands)) {
    brands[id] = {
      shape: Object.fromEntries(brand.shape),
      dark: { ...Object.fromEntries(brand.shape), ...color.dark },
      light: { ...color.light },
      onImage: { ...color.dark },
    }
  }
  return {
    base: Object.fromEntries(tokens.base.declarations),
    scopes: tokens.scopes.map((scope) => ({
      selector: scope.selector,
      media: scope.media ?? null,
      declarations: Object.fromEntries(scope.declarations),
    })),
    color,
    brands,
  }
}

export function renderTokenModules(tokens, version) {
  const data = tokenExportData(tokens)
  const json = `${JSON.stringify(data, null, 2)}\n`
  const brands = Object.keys(tokens.brands)
  const ts = `// Generated from web/tokens.json by npm run build:web. Do not edit.
export const version = ${JSON.stringify(version)} as const
export const brands = ${JSON.stringify(brands)} as const
export type WebBrand = (typeof brands)[number]
export const themes = ["dark", "light"] as const
export type WebTheme = (typeof themes)[number]
export const tokens = ${json.trimEnd()} as const
export type WebTokens = typeof tokens
`
  const js = `// Generated from web/tokens.json by npm run build:web. Do not edit.
export const version = ${JSON.stringify(version)}
export const brands = ${JSON.stringify(brands)}
export const themes = ["dark", "light"]
export const tokens = ${json}`
  const dts = `// Generated from web/tokens.json by npm run build:web. Do not edit.
export declare const version: ${JSON.stringify(version)}
export declare const brands: readonly ${JSON.stringify(brands)}
export type WebBrand = (typeof brands)[number]
export declare const themes: readonly ["dark", "light"]
export type WebTheme = (typeof themes)[number]
export declare const tokens: ${toReadonlyType(data, '')}
export type WebTokens = typeof tokens
`
  return { ts, js, dts }
}

function toReadonlyType(value, indent) {
  if (value == null) return 'null'
  if (typeof value === 'string') return JSON.stringify(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return 'readonly []'
    return `readonly [${value.map((item) => toReadonlyType(item, indent)).join(', ')}]`
  }
  const entries = Object.entries(value).map(([key, item]) => {
    return `${indent}  readonly ${JSON.stringify(key)}: ${toReadonlyType(item, `${indent}  `)}`
  })
  return `{\n${entries.join('\n')}\n${indent}}`
}
