import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const output = path.resolve('dist/theme')
await mkdir(output, { recursive: true })
await copyFile(path.resolve('src/theme/styles.css'), path.join(output, 'styles.css'))
