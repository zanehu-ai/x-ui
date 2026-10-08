import fs from 'node:fs'

function channel(c) {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

export function contrastRatio(fg, bg) {
  const lum = (hex) => {
    const n = hex.slice(1)
    const r = Number.parseInt(n.slice(0, 2), 16)
    const g = Number.parseInt(n.slice(2, 4), 16)
    const b = Number.parseInt(n.slice(4, 6), 16)
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  }
  const a = lum(fg)
  const b = lum(bg)
  const hi = Math.max(a, b)
  const lo = Math.min(a, b)
  return (hi + 0.05) / (lo + 0.05)
}

export function parseContrastCsv(text) {
  const rows = []
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
  const header = splitCsvLine(lines[0])
  if (header.join(',') !== 'pair,fg,bg,ratio,target,result') {
    throw new Error('contrast.csv header is not pair,fg,bg,ratio,target,result')
  }
  for (const line of lines.slice(1)) {
    const cells = splitCsvLine(line)
    if (cells.length !== 6) throw new Error(`contrast.csv row has ${cells.length} cells: ${line}`)
    const [pair, fg, bg, ratio, target, result] = cells
    rows.push({
      pair,
      fg: fg.toUpperCase(),
      bg: bg.toUpperCase(),
      ratio: Number(ratio),
      target: Number(target),
      result,
    })
  }
  return rows
}

function splitCsvLine(line) {
  const cells = []
  let cur = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"') quoted = false
      else cur += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      cells.push(cur)
      cur = ''
    } else cur += ch
  }
  cells.push(cur)
  return cells
}

function pairsToMap(pairs) {
  return Object.fromEntries(pairs)
}

function resolve(palette, name) {
  let value = palette[name]
  const seen = new Set()
  while (typeof value === 'string' && value.startsWith('var(')) {
    const ref = value.slice(4, -1).trim()
    if (seen.has(ref)) throw new Error(`token cycle at ${name}`)
    seen.add(ref)
    value = palette[ref]
    if (value == null) throw new Error(`token ${name} references missing ${ref}`)
  }
  return String(value).toUpperCase()
}

const PAIR_RULES = [
  { test: /^\[Dark\] text_primary on bg_base$/, theme: 'dark', fg: '--xui-color-text-primary', bg: '--xui-color-bg-base' },
  { test: /^\[Dark\] text_secondary on bg_base$/, theme: 'dark', fg: '--xui-color-text-secondary', bg: '--xui-color-bg-base' },
  { test: /^\[Dark\] text_tertiary on bg_base$/, theme: 'dark', fg: '--xui-color-text-tertiary', bg: '--xui-color-bg-base' },
  { test: /^\[Dark\] accent_text/, theme: 'dark', fg: '--xui-color-accent-text', bg: '--xui-color-bg-base' },
  { test: /^\[Dark\] primary button/, theme: 'dark', fg: '--xui-color-accent-on', bg: '--xui-color-accent-fill' },
  { test: /^\[Dark\] Live pill/, theme: 'dark', fg: '--xui-color-accent-on', bg: '--xui-color-accent-fill' },
  { test: /^\[Dark\] Building/, theme: 'dark', fg: '--xui-color-border-strong', bg: '--xui-color-bg-base' },
  { test: /^\[Dark\] Stopped/, theme: 'dark', fg: '--xui-color-text-secondary', bg: '--xui-color-bg-base' },
  { test: /^\[Dark\] focus ring/, theme: 'dark', fg: '--xui-color-focus-ring', bg: '--xui-color-bg-base', focus: true },
  { test: /^\[Dark\] border_strong/, theme: 'dark', fg: '--xui-color-border-strong', bg: '--xui-color-bg-base' },
  { test: /^\[Dark\] border_subtle/, theme: 'dark', fg: '--xui-color-border-subtle', bg: '--xui-color-bg-base' },
  { test: /^\[Light\] text_primary on bg_base$/, theme: 'light', fg: '--xui-color-text-primary', bg: '--xui-color-bg-base' },
  { test: /^\[Light\] text_secondary on bg_base$/, theme: 'light', fg: '--xui-color-text-secondary', bg: '--xui-color-bg-base' },
  { test: /^\[Light\] text_tertiary on bg_base$/, theme: 'light', fg: '--xui-color-text-tertiary', bg: '--xui-color-bg-base' },
  { test: /^\[Light\] accent_text/, theme: 'light', fg: '--xui-color-accent-text', bg: '--xui-color-bg-base' },
  { test: /^\[Light\] primary button/, theme: 'light', fg: '--xui-color-accent-on', bg: '--xui-color-accent-fill' },
  { test: /^\[Light\] Live pill/, theme: 'light', fg: '--xui-color-accent-on', bg: '--xui-color-accent-fill' },
  { test: /^\[Light\] Building/, theme: 'light', fg: '--xui-color-border-strong', bg: '--xui-color-bg-base' },
  { test: /^\[Light\] Stopped/, theme: 'light', fg: '--xui-color-text-secondary', bg: '--xui-color-bg-base' },
  { test: /^\[Light\] focus ring/, theme: 'light', fg: '--xui-color-focus-ring', bg: '--xui-color-bg-base', focus: true },
  { test: /^\[Light\] border_strong/, theme: 'light', fg: '--xui-color-border-strong', bg: '--xui-color-bg-base' },
  { test: /^\[Light\] border_subtle/, theme: 'light', fg: '--xui-color-border-subtle', bg: '--xui-color-bg-base' },
  { test: /^\[Dark island/, theme: 'dark', fg: '--xui-color-focus-ring', bg: '--xui-color-bg-base', focus: true },
  { test: /^\[Orbit SVG\]/, orbit: true },
]

export function assertContrast(tokens, csvText, svgText) {
  const rows = parseContrastCsv(csvText)
  if (rows.length !== 24) throw new Error(`contrast.csv has ${rows.length} pairs; expected 24`)
  const base = pairsToMap(tokens.base.declarations)
  if (base['--xui-focus-width'] !== '2px' || base['--xui-focus-offset'] !== '3px') {
    throw new Error('focus ring must stay 2px wide with a 3px offset')
  }
  const palettes = {
    dark: pairsToMap(tokens.color.dark),
    light: pairsToMap(tokens.color.light),
  }
  const used = new Set()
  for (const row of rows) {
    if (row.result !== 'PASS') throw new Error(`${row.pair} is not PASS in contrast.csv`)
    const ratio = contrastRatio(row.fg, row.bg)
    if (ratio < row.target) throw new Error(`${row.pair} contrast ${ratio.toFixed(2)} is below ${row.target}`)
    if (Math.abs(ratio - row.ratio) > 0.015) {
      throw new Error(`${row.pair} contrast ${ratio.toFixed(2)} does not match csv ${row.ratio}`)
    }
    const rule = PAIR_RULES.find((item) => item.test.test(row.pair))
    if (!rule || used.has(rule)) throw new Error(`contrast pair is not mapped uniquely: ${row.pair}`)
    used.add(rule)
    if (rule.orbit) {
      const svg = svgText.toUpperCase()
      if (!svg.includes(row.fg) || !svg.includes(row.bg)) {
        throw new Error('opcorbit-orbit.svg does not use the orbit contrast pair')
      }
      continue
    }
    const palette = palettes[rule.theme]
    const fg = resolve(palette, rule.fg)
    const bg = resolve(palette, rule.bg)
    if (fg !== row.fg || bg !== row.bg) {
      throw new Error(`${row.pair} tokens resolve to ${fg} on ${bg}, csv says ${row.fg} on ${row.bg}`)
    }
  }
  if (used.size !== PAIR_RULES.length) throw new Error('a contrast rule never matched contrast.csv')
}
