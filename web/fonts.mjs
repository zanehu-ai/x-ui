import fs from 'node:fs'
import path from 'node:path'

/**
 * Self-hosted Latin subsets. Albert has not confirmed font hosting.
 * This module is the only place that knows about font files.
 * Switching to system fonts means setting SELF_HOST_FONTS to false
 * and dropping web/dist/fonts/. Family names in tokens.json stay;
 * the stacks already fall through to system-ui and the CJK list.
 *
 * The release allowlist currently requires at least one font file,
 * so SELF_HOST_FONTS stays true until that decision changes.
 */
export const SELF_HOST_FONTS = true

const FAMILIES = [
  { id: 'inter', pkg: '@fontsource/inter', family: 'Inter', weights: [400, 500, 600, 700] },
  { id: 'barlow-condensed', pkg: '@fontsource/barlow-condensed', family: 'Barlow Condensed', weights: [500, 600, 700] },
  { id: 'jetbrains-mono', pkg: '@fontsource/jetbrains-mono', family: 'JetBrains Mono', weights: [400] },
  { id: 'geist', pkg: '@fontsource/geist', family: 'Geist', weights: [400, 500, 600, 700] },
  { id: 'geist-mono', pkg: '@fontsource/geist-mono', family: 'Geist Mono', weights: [400] },
]

export function collectFonts(repoRoot) {
  if (!SELF_HOST_FONTS) {
    return {
      css: '/* System fonts only. The @font-face block is intentionally empty. */\n',
      files: [],
      licenses: [],
    }
  }

  const files = []
  const faces = []
  const licenses = []

  for (const family of FAMILIES) {
    const pkgRoot = path.join(repoRoot, 'node_modules', family.pkg)
    const unicode = JSON.parse(fs.readFileSync(path.join(pkgRoot, 'unicode.json'), 'utf8'))
    if (!unicode.latin) throw new Error(`${family.pkg} is missing a latin unicode range`)
    licenses.push({
      id: family.id,
      family: family.family,
      text: fs.readFileSync(path.join(pkgRoot, 'LICENSE'), 'utf8').trim(),
    })

    for (const weight of family.weights) {
      const cssPath = path.join(pkgRoot, `latin-${weight}.css`)
      const css = fs.readFileSync(cssPath, 'utf8')
      const familyName = css.match(/font-family:\s*'([^']+)'/)?.[1]
      const fileName = css.match(/url\(\.\/files\/([^)]+?\.woff2)\)/)?.[1]
      if (familyName !== family.family || !fileName) {
        throw new Error(`Could not read ${family.family} ${weight} from ${cssPath}`)
      }
      const rel = `fonts/${family.id}/${fileName}`
      files.push({ from: path.join(pkgRoot, 'files', fileName), rel })
      faces.push(
        `@font-face{font-family:${JSON.stringify(family.family)};font-style:normal;font-display:swap;font-weight:${weight};src:url(${rel}) format("woff2");unicode-range:${unicode.latin};}`,
      )
    }
  }

  const css = `/* FONT FACES. Isolated: delete this block and fonts/ to ship system fonts only. Latin subsets only; CJK stays on the system stack. */\n${faces.join('\n')}\n`
  return { css, files, licenses }
}

export function licenseComment(licenses) {
  if (licenses.length === 0) return ''
  const body = licenses
    .map((entry) => `----- ${entry.family} (${entry.id}) -----\n${entry.text}`)
    .join('\n\n')
    .replace(/\*\//g, '* /')
  return `\n/*\nSelf-hosted font licenses (SIL Open Font License). Kept in this stylesheet because the web/dist allowlist accepts font binaries only.\n\n${body}\n*/\n`
}
