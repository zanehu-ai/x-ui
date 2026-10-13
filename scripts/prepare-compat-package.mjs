import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

// Preserve the released implementation while its npm identity is migrated.
// No publication occurs. Registry access uses the caller's existing npm config.
const originalName = '@zanehu-ai/synapse-ui'
const originalVersion = '0.1.8'
const originalIntegrity = 'sha512-DBzHea9z8c/YeycMqc4PH20nCt77Y6eixBsosGGK9abC+z1xtBTUn0iK76fmHlcBrOhZkoVrRxdlD+bB/It6Bw=='
const options = new Map()
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index]
  if (!['--source', '--destination'].includes(key) || !process.argv[index + 1]) {
    throw new Error('Usage: prepare-compat-package.mjs --destination DIR [--source ORIGINAL_PACKAGE_DIR]')
  }
  options.set(key, resolve(process.argv[index + 1]))
}
if (!options.has('--destination')) throw new Error('--destination is required')
const destination = options.get('--destination')
const scratch = mkdtempSync(join(tmpdir(), 'x-ui-compat-'))
function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `${command} failed`)
  return result.stdout
}
function hashes(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const relative = prefix + entry.name
    const absolute = join(directory, entry.name)
    if (entry.isDirectory()) return hashes(absolute, relative + '/')
    if (!entry.isFile()) throw new Error(`Unexpected non-file in dist: ${relative}`)
    return [[relative, createHash('sha256').update(readFileSync(absolute)).digest('hex')]]
  })
}
try {
  let source = options.get('--source')
  const sourceKind = source ? 'explicit-directory' : 'registry-tarball'
  if (!source) {
    const [packed] = JSON.parse(run('npm', ['pack', `${originalName}@${originalVersion}`, '--registry=https://npm.pkg.github.com', '--ignore-scripts', '--json', '--pack-destination', scratch], process.cwd()))
    const archive = join(scratch, packed.filename)
    const integrity = 'sha512-' + createHash('sha512').update(readFileSync(archive)).digest('base64')
    if (integrity !== originalIntegrity) throw new Error('Original registry tarball differs from the reviewed 0.1.8 lock integrity')
    run('tar', ['-xzf', archive, '-C', scratch], scratch)
    source = join(scratch, 'package')
  }
  const originalManifest = readFileSync(join(source, 'package.json'))
  const pkg = JSON.parse(originalManifest)
  if (pkg.name !== originalName || pkg.version !== originalVersion || !existsSync(join(source, 'dist'))) {
    throw new Error('Compatibility input must be the original @zanehu-ai/synapse-ui@0.1.8 package with dist')
  }
  const before = hashes(join(source, 'dist'))
  const staging = join(scratch, 'renamed')
  mkdirSync(staging)
  for (const file of ['dist', 'README.md', 'LICENSE']) {
    if (existsSync(join(source, file))) cpSync(join(source, file), join(staging, file), { recursive: true })
  }
  pkg.name = '@zanehu-ai/x-ui'
  pkg.repository = { type: 'git', url: 'https://github.com/zanehu-ai/x-ui.git' }
  writeFileSync(join(staging, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
  const after = hashes(join(staging, 'dist'))
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Compatibility package changed dist contents')
  mkdirSync(destination, { recursive: true })
  const filename = 'zanehu-ai-x-ui-0.1.8.tgz'
  // npm versions differ in whether --ignore-scripts suppresses prepare for
  // local packing. Write a deterministic npm-format archive without executing
  // or deleting the original lifecycle metadata, and without rebuilding dist.
  run('python3', ['-c', `
import gzip, pathlib, sys, tarfile
source, output = map(pathlib.Path, sys.argv[1:])
with output.open('wb') as raw:
    with gzip.GzipFile(fileobj=raw, filename='', mtime=0) as compressed:
        with tarfile.open(fileobj=compressed, mode='w', format=tarfile.GNU_FORMAT) as archive:
            for path in sorted(source.rglob('*')):
                if not path.is_file():
                    continue
                info = tarfile.TarInfo('package/' + path.relative_to(source).as_posix())
                info.size = path.stat().st_size
                info.mode = 0o755 if path.stat().st_mode & 0o111 else 0o644
                with path.open('rb') as content:
                    archive.addfile(info, content)
`, staging, join(destination, filename)], staging)
  const packed = { filename, integrity: 'sha512-' + createHash('sha512').update(readFileSync(join(destination, filename))).digest('base64') }
  const record = {
    original: { name: originalName, version: originalVersion, registryIntegrity: originalIntegrity, archiveIntegrityVerified: sourceKind === 'registry-tarball' },
    originalRepository: JSON.parse(originalManifest).repository,
    sourceKind,
    originalManifestSha256: createHash('sha256').update(originalManifest).digest('hex'),
    package: { name: pkg.name, version: pkg.version, filename: packed.filename, integrity: packed.integrity },
    distFiles: Object.fromEntries(before),
    distSha256: createHash('sha256').update(JSON.stringify(before)).digest('hex'),
  }
  writeFileSync(join(destination, packed.filename + '.provenance.json'), JSON.stringify(record, null, 2) + '\n')
  process.stdout.write(JSON.stringify({ filename: packed.filename, integrity: packed.integrity, distFiles: before.length, distSha256: record.distSha256 }) + '\n')
} finally {
  rmSync(scratch, { recursive: true, force: true })
}
