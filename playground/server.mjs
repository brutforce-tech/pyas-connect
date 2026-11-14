/**
 * The PyasConnect playground: the element alone, on a plain page, against any
 * Pyas API (a local one by default), with real sign-ins. No dependencies.
 *
 *   npm run build -w @pyas/connect      once, or `npx stencil build --watch` there
 *   npm run playground                  http://localhost:4100
 *
 * Settings come from playground/.env (gitignored) or the environment:
 *
 *   PYAS_API_KEY=pyas_sk_...    a live key of the app to connect into (never sent to the page)
 *   PYAS_API_URL=http://localhost:3030
 *   PORT=4100
 *
 * Add the playground's address (http://localhost:4100) to the app's allowed
 * origins in the dashboard, or the API refuses the page.
 */

import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync, createReadStream } from 'node:fs'
import { dirname, extname, join, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ELEMENT_DIR = join(HERE, '..', 'packages', 'connect', 'dist', 'pyas-connect')

// playground/.env, then the environment (which wins).
const fileEnv = {}
const envFile = join(HERE, '.env')
if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
        if (m && !line.trim().startsWith('#')) fileEnv[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
    }
}
const env = (name, fallback) => process.env[name] || fileEnv[name] || fallback

const API_URL = env('PYAS_API_URL', 'http://localhost:3030').replace(/\/+$/, '')
// Read when used, so a key added to .env (or the e2e suite's key file) needs no restart.
const apiKey = () => {
    const file = env('PYAS_API_KEY_FILE', '')
    if (file && existsSync(file)) { try { return JSON.parse(readFileSync(file, 'utf8')).apiKey ?? '' } catch { return '' } }
    if (existsSync(envFile)) {
        const m = readFileSync(envFile, 'utf8').match(/^\s*PYAS_API_KEY\s*=\s*(.*?)\s*$/m)
        if (m && !process.env.PYAS_API_KEY) return m[1].replace(/^['"]|['"]$/g, '')
    }
    return env('PYAS_API_KEY', '')
}
const PORT = Number(env('PORT', '4100'))
const ORIGIN = `http://localhost:${PORT}`

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.map': 'application/json', '.json': 'application/json' }

const send = (res, status, body, type = 'application/json') => {
    res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' })
    res.end(typeof body === 'string' ? body : JSON.stringify(body))
}

const readBody = (req) => new Promise((resolve) => {
    let data = ''
    req.on('data', (c) => { data += c; if (data.length > 1e5) req.destroy() })
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}) } catch { resolve({}) } })
})

/** A file under a folder, never outside it. */
const serveFrom = (res, root, rel) => {
    const file = normalize(join(root, rel))
    if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) return send(res, 404, 'Not found', 'text/plain')
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', 'cache-control': 'no-store' })
    createReadStream(file).pipe(res)
}

/** What your server does: a connect session, made with the key the page never sees. */
const makeSession = async (req, res) => {
    const API_KEY = apiKey()
    if (!API_KEY) return send(res, 500, { error: { code: 'PLAYGROUND_NO_KEY', message: 'Set PYAS_API_KEY in playground/.env (a live key of the app to connect into).' } })
    const input = await readBody(req)
    const body = {
        ...(Array.isArray(input.providers) && input.providers.length ? { providers: input.providers } : {}),
        ...(input.subjectId ? { subjectId: String(input.subjectId) } : {}),
        ...(input.loginHint ? { loginHint: String(input.loginHint) } : {}),
        ...(input.mode === 'redirect' ? { returnUrl: `${ORIGIN}/?returned=1` } : {}),
    }
    try {
        const r = await fetch(`${API_URL}/v2/connect/sessions`, { method: 'POST', headers: { 'x-api-key': API_KEY, 'content-type': 'application/json' }, body: JSON.stringify(body) })
        const json = await r.json().catch(() => ({}))
        if (!r.ok) return send(res, r.status, json)
        return send(res, 200, { token: json.data.token, sessionId: json.data.id, expiresAt: json.data.expiresAt })
    } catch {
        return send(res, 502, { error: { code: 'PLAYGROUND_API_UNREACHABLE', message: `The Pyas API at ${API_URL} did not answer. Is it running?` } })
    }
}

createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', ORIGIN)
    if (req.method === 'POST' && url.pathname === '/api/pyas-session') return makeSession(req, res)
    if (url.pathname === '/api/config') return send(res, 200, { apiUrl: API_URL, hasKey: !!apiKey(), origin: ORIGIN })
    if (url.pathname.startsWith('/element/')) {
        if (!existsSync(ELEMENT_DIR)) return send(res, 503, 'Build the element first: npm run build -w @pyas/connect', 'text/plain')
        return serveFrom(res, ELEMENT_DIR, url.pathname.slice('/element/'.length))
    }
    if (url.pathname === '/' || url.pathname === '/index.html') return serveFrom(res, HERE, 'index.html')
    return send(res, 404, 'Not found', 'text/plain')
}).listen(PORT, () => {
    console.log(`PyasConnect playground: ${ORIGIN}`)
    console.log(`  API: ${API_URL}${apiKey() ? '' : '  (no PYAS_API_KEY yet: set it in playground/.env)'}`)
    console.log(`  Allow ${ORIGIN} in the app's allowed origins in the dashboard.`)
})
