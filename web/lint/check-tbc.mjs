import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const PATTERN = /xui-tbc|mockup-only\.css|to confirm|待确认/i
const SUFFIXES = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt'])

export function findMockupMarkers(dir) {
  const bad = []
  if (!fs.existsSync(dir)) return bad
  walk(dir, (file) => {
    if (!SUFFIXES.has(path.extname(file).toLowerCase())) return
    const lines = fs.readFileSync(file).toString('utf8').split(/\r?\n/)
    lines.forEach((line, index) => {
      if (PATTERN.test(line)) bad.push({ file, line: index + 1, text: line })
    })
  })
  return bad
}

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, visit)
    else if (entry.isFile()) visit(full)
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  const dir = process.argv[2]
  if (!dir) {
    console.error('usage: check-tbc.mjs <dist-dir>')
    process.exit(2)
  }
  const bad = findMockupMarkers(dir)
  for (const item of bad.slice(0, 50)) console.log(`${item.file}:${item.line}: mockup-only marker`)
  process.exit(bad.length ? 1 : 0)
}
