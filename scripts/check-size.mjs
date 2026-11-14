// The bundle budget: the element with the core, gzipped, at most 25 KB.
// Stencil's runtime is shared by every Stencil component on a page and is reported, not counted.
import fs from 'node:fs'
import zlib from 'node:zlib'
import path from 'node:path'

const BUDGET = 25 * 1024
const dir = 'packages/connect/dist/components'
const gz = (file) => zlib.gzipSync(fs.readFileSync(path.join(dir, file))).length
const element = gz('pyas-connect.js')
const runtime = fs.readdirSync(dir).filter((f) => /^p-.*\.js$/.test(f)).reduce((n, f) => n + gz(f), 0)
const kb = (n) => `${(n / 1024).toFixed(1)} KB`
console.log(`<pyas-connect> with the core: ${kb(element)} gzipped (budget ${kb(BUDGET)}); Stencil runtime: ${kb(runtime)}`)
if (element > BUDGET) {
    console.error('Over budget.')
    process.exit(1)
}
