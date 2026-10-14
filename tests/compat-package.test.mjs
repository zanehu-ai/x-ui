import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const script = fileURLToPath(new URL('../scripts/prepare-compat-package.mjs', import.meta.url))
test('compatibility repack changes identity only and produces repeatable artifacts', () => {
  const root = mkdtempSync(join(tmpdir(), 'x-ui-compat-test-'))
  try {
    const source = join(root, 'original')
    const target = join(root, 'packed')
    mkdirSync(join(source, 'dist'), { recursive: true })
    const manifest = { name: '@zanehu-ai/synapse-ui', version: '0.1.8', type: 'module', files: ['dist'], main: 'dist/index.js', scripts: { prepare: 'exit 42' } }
    const code = 'export const behavior = "unchanged";\n'
    writeFileSync(join(source, 'package.json'), JSON.stringify(manifest))
    writeFileSync(join(source, 'dist/index.js'), code)
    const args = [script, '--source', source, '--destination', target]
    const first = JSON.parse(execFileSync(process.execPath, args, { encoding: 'utf8' }))
    const second = JSON.parse(execFileSync(process.execPath, args, { encoding: 'utf8' }))
    assert.deepEqual(second, first)
    const archive = join(target, first.filename)
    assert.equal(execFileSync('tar', ['-xOf', archive, 'package/dist/index.js'], { encoding: 'utf8' }), code)
    assert.deepEqual(JSON.parse(execFileSync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' })), { ...manifest, name: '@zanehu-ai/x-ui', repository: { type: 'git', url: 'https://github.com/zanehu-ai/x-ui.git' } })
    assert.deepEqual(JSON.parse(readFileSync(join(source, 'package.json'))), manifest)
    const provenance = JSON.parse(readFileSync(archive + '.provenance.json'))
    assert.equal(provenance.original.archiveIntegrityVerified, false)
    assert.deepEqual(Object.keys(provenance.distFiles), ['index.js'])
    writeFileSync(join(source, 'package.json'), JSON.stringify({ ...manifest, version: '0.2.0-rc.0' }))
    const rejected = spawnSync(process.execPath, args, { encoding: 'utf8' })
    assert.notEqual(rejected.status, 0)
    assert.match(rejected.stderr, /original @zanehu-ai\/synapse-ui@0.1.8/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
