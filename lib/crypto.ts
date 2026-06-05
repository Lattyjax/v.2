/**
 * Application-layer AES-256-GCM token encryption.
 *
 * Usage
 * -----
 * Set TOKEN_ENCRYPTION_KEY to a 32-byte secret (hex, base64, or any string).
 * Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * Behaviour when TOKEN_ENCRYPTION_KEY is unset
 * ---------------------------------------------
 * encryptToken  → returns the plain value unchanged (no-op, backward compatible)
 * decryptToken  → returns the plain value unchanged (handles legacy DB rows)
 *
 * Encrypted token format: enc:<iv_hex>:<auth_tag_hex>:<ciphertext_hex>
 * This prefix lets decryptToken detect encrypted vs legacy plain-text values.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 12  // 96-bit IV recommended for GCM

/** Derive a 32-byte Buffer from TOKEN_ENCRYPTION_KEY, or null if unset. */
function getKey(): Buffer | null {
  const raw = process.env.TOKEN_ENCRYPTION_KEY
  if (!raw) return null
  if (raw.length === 64 && /^[0-9a-f]+$/i.test(raw)) return Buffer.from(raw, 'hex')
  if (raw.length >= 44) {
    const buf = Buffer.from(raw, 'base64')
    if (buf.length >= 32) return buf.subarray(0, 32)
  }
  // Arbitrary passphrase → SHA-256 key derivation
  return createHash('sha256').update(raw).digest()
}

/**
 * Encrypt a token value before storing it in the database.
 * Returns the encrypted string (enc:<iv>:<tag>:<ct>) or the plain value if
 * TOKEN_ENCRYPTION_KEY is not configured.
 */
export function encryptToken(plain: string): string {
  const key = getKey()
  if (!key) return plain

  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return `enc:${iv.toString('hex')}:${tag.toString('hex')}:${ciphertext.toString('hex')}`
}

/**
 * Decrypt a token value retrieved from the database.
 * Handles three cases:
 *   • enc:... format  → decrypt
 *   • plain string    → return as-is (legacy row, or key not configured)
 *   • null / empty    → return null
 */
export function decryptToken(stored: string | null | undefined): string | null {
  if (!stored) return null
  if (!stored.startsWith('enc:')) return stored  // legacy plain-text row

  const key = getKey()
  if (!key) {
    // Key not configured but we have an encrypted value — log and return null
    // rather than crashing; the caller should treat this as a missing token.
    console.error('[crypto] TOKEN_ENCRYPTION_KEY is not set but an encrypted token was found in the database.')
    return null
  }

  const parts = stored.split(':')
  if (parts.length !== 4) {
    console.error('[crypto] Malformed encrypted token — expected enc:<iv>:<tag>:<ct>')
    return null
  }

  try {
    const iv = Buffer.from(parts[1], 'hex')
    const tag = Buffer.from(parts[2], 'hex')
    const ciphertext = Buffer.from(parts[3], 'hex')

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    return decipher.update(ciphertext).toString('utf8') + decipher.final('utf8')
  } catch (err) {
    console.error('[crypto] Token decryption failed:', err)
    return null
  }
}
