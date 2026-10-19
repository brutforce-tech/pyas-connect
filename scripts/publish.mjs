// Publishes every package at its version, in dependency order. A pre-release
// (2.0.0-rc.1) goes to the `next` tag, so `latest` stays on the last release.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { PACKAGES } from './packages.mjs'

const tag = process.argv[2]
const versions = new Set(PACKAGES.map((p) => JSON.parse(fs.readFileSync(path.join(p.dir, 'package.json'), 'utf8')).version))
if (versions.size !== 1) throw new Error(`The packages are at different versions: ${[...versions].join(', ')}. Run scripts/set-version.mjs.`)
const [version] = versions
if (tag && tag !== `v${version}`) throw new Error(`The tag ${tag} does not match the packages' version ${version}.`)
const distTag = version.includes('-') ? 'next' : 'latest'
for (const p of PACKAGES) {
    console.log(`Publishing ${p.name}@${version} (${distTag})`)
    execFileSync('npm', ['publish', '--access', 'public', '--provenance', '--tag', distTag], { cwd: p.publishDir, stdio: 'inherit', shell: process.platform === 'win32' })
}
