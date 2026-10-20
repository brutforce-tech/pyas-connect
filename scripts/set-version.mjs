// node scripts/set-version.mjs 2.0.0: every package, and their dependencies on each other, at one version.
import fs from 'node:fs'
import path from 'node:path'
import { PACKAGES } from './packages.mjs'

const version = process.argv[2]
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version ?? '')) {
    console.error('Usage: node scripts/set-version.mjs <version>, e.g. 2.0.0 or 2.0.0-rc.1')
    process.exit(1)
}
const names = new Set(PACKAGES.map((p) => p.name))
for (const p of PACKAGES) {
    const file = path.join(p.dir, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'))
    pkg.version = version
    for (const field of ['dependencies', 'peerDependencies']) {
        for (const dep of Object.keys(pkg[field] ?? {})) if (names.has(dep)) pkg[field][dep] = version
    }
    fs.writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`)
    console.log(`${p.name} ${version}`)
}
