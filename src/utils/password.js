
const encoder = new TextEncoder()
const ITERATIONS = 1000

const toB64 = (bytes) => btoa(String.fromCharCode(...bytes))
const fromB64 = (b64) => Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0))

async function derive(password, salt, iterations) {
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
    return new Uint8Array(bits)
}

export async function hashPassword(password) {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const hash = await derive(password, salt, ITERATIONS)
    return `pbkdf2$${ITERATIONS}$${toB64(salt)}$${toB64(hash)}`
}

export async function verifyPassword(password, stored) {
    if (!stored) return false
    const [scheme, iterations, salt, hash] = stored.split('$')
    if (scheme !== 'pbkdf2') return false
    const actual = await derive(password, fromB64(salt), Number(iterations))
    const expected = fromB64(hash)
    if (actual.length !== expected.length) return false
    let diff = 0
    for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i]
    return diff === 0
}