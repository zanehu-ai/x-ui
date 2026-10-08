import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g

export function lintCss(css, tokenHexes) {
  const findings = []
  for (const rule of parseRules(stripComments(css))) {
    const classes = [...rule.selector.matchAll(/\.(-?[_a-zA-Z][_a-zA-Z0-9-]*)/g)].map((match) => match[1])
    for (const name of classes) {
      if (!name.startsWith('xui-')) {
        findings.push(`${rule.selector}: class .${name} is not prefixed .xui-`)
      }
    }
    const declarations = rule.body.split(';').map((part) => part.trim()).filter(Boolean)
    const hasLibraryClass = classes.some((name) => name.startsWith('xui-'))
    for (const declaration of declarations) {
      const splitAt = declaration.indexOf(':')
      if (splitAt < 0) continue
      const prop = declaration.slice(0, splitAt).trim()
      const value = declaration.slice(splitAt + 1).trim()
      if (prop.startsWith('--') && !prop.startsWith('--xui-')) {
        findings.push(`${rule.selector}: custom property ${prop} is not prefixed --xui-`)
      }
      if (hasLibraryClass && prop && !prop.startsWith('--')) {
        findings.push(`${rule.selector}: duplicated component style sets ${prop}`)
      }
      if (!prop.startsWith('--') && !rule.selector.includes('.') && !rule.selector.startsWith('@') && rule.selector.trim()) {
        findings.push(`${rule.selector}: duplicated element style sets ${prop}`)
      }
      for (const hex of value.match(HEX) ?? []) {
        const key = normalizeHex(hex)
        const names = tokenHexes.get(key)
        if (names) findings.push(`${rule.selector}: ${hex} matches ${names.join(', ')}; use the token`)
      }
    }
  }
  return findings
}

export function tokenHexMap(tokens) {
  const map = new Map()
  collect(tokens, map)
  return map
}

function collect(node, map, name) {
  if (typeof node === 'string') {
    if (name && node.startsWith('#')) {
      const key = normalizeHex(node)
      const names = map.get(key) ?? []
      if (!names.includes(name)) names.push(name)
      map.set(key, names)
    }
    return
  }
  if (Array.isArray(node)) {
    if (node.length === 2 && typeof node[0] === 'string' && node[0].startsWith('--')) {
      collect(node[1], map, node[0])
      return
    }
    for (const item of node) collect(item, map)
    return
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('--')) collect(value, map, key)
      else collect(value, map)
    }
  }
}

export function normalizeHex(hex) {
  let body = hex.slice(1).toLowerCase()
  if (body.length === 3 || body.length === 4) body = body.slice(0, 3).split('').map((ch) => ch + ch).join('')
  if (body.length === 8) body = body.slice(0, 6)
  return `#${body}`
}

function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '')
}

function parseRules(css) {
  const rules = []
  let index = 0
  while (index < css.length) {
    const open = css.indexOf('{', index)
    if (open < 0) break
    const selector = css.slice(index, open).trim()
    let depth = 1
    let cursor = open + 1
    while (cursor < css.length && depth > 0) {
      if (css[cursor] === '{') depth += 1
      else if (css[cursor] === '}') depth -= 1
      cursor += 1
    }
    const body = css.slice(open + 1, cursor - 1)
    if (selector.startsWith('@') && body.includes('{')) rules.push(...parseRules(body))
    else if (selector) rules.push({ selector, body })
    index = cursor
  }
  return rules
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  const tokenPath = process.argv.includes('--tokens')
    ? process.argv[process.argv.indexOf('--tokens') + 1]
    : path.resolve('web/tokens.json')
  const files = process.argv.slice(2).filter((arg, index, all) => arg !== '--tokens' && all[index - 1] !== '--tokens')
  if (files.length === 0) {
    console.error('usage: check-consumer.mjs [--tokens web/tokens.json] <file.css> [...]')
    process.exit(2)
  }
  const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'))
  const hexes = tokenHexMap(tokens)
  let failed = false
  for (const file of files) {
    const findings = lintCss(fs.readFileSync(file, 'utf8'), hexes)
    for (const finding of findings) {
      failed = true
      console.log(`${file}: ${finding}`)
    }
  }
  process.exit(failed ? 1 : 0)
}
