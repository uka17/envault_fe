const FORMAT_VERSION = "v1";
const PBKDF2_ITERATIONS = 210_000;
const SALT_LENGTH_BYTES = 16;
const IV_LENGTH_BYTES = 12;

/**
 * Derives an AES-GCM key from a passphrase using PBKDF2.
 * @param key Passphrase entered by the user.
 * @param salt Random salt used for key derivation.
 * @returns A non-extractable AES-GCM CryptoKey.
 */
async function deriveAesKey(key: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(key),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/**
 * Encodes a byte array as base64.
 * @param bytes Bytes to encode.
 * @returns Base64-encoded string.
 */
function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/**
 * Decodes a base64 string into a byte array.
 * @param base64 Base64-encoded string.
 * @returns Decoded bytes.
 */
function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Encrypts a stash message client-side with a user-supplied passphrase.
 * Uses PBKDF2 (SHA-256) for key derivation and AES-GCM for encryption.
 * The server never sees the passphrase or the plaintext.
 * @param body Plaintext stash message.
 * @param key Passphrase used to encrypt (and later decrypt) the message.
 * @returns Self-describing ciphertext blob: `v1.<salt>.<iv>.<ciphertext>` (all base64).
 */
export async function encryptStashBody(body: string, key: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH_BYTES));
  const aesKey = await deriveAesKey(key, salt);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as unknown as BufferSource },
    aesKey,
    new TextEncoder().encode(body),
  );
  return [
    FORMAT_VERSION,
    toBase64(salt),
    toBase64(iv),
    toBase64(new Uint8Array(ciphertext)),
  ].join(".");
}

/**
 * Decrypts a stash body blob produced by {@link encryptStashBody}.
 * @param blob Ciphertext blob in `v1.<salt>.<iv>.<ciphertext>` format.
 * @param key Passphrase to attempt decryption with.
 * @returns Decrypted plaintext, or `null` if the blob is malformed or the key is wrong.
 */
export async function decryptStashBody(blob: string, key: string): Promise<string | null> {
  const parts = blob.split(".");
  if (parts.length !== 4 || parts[0] !== FORMAT_VERSION) return null;

  try {
    const [, saltB64, ivB64, ciphertextB64] = parts;
    const salt = fromBase64(saltB64);
    const iv = fromBase64(ivB64);
    const ciphertext = fromBase64(ciphertextB64);
    const aesKey = await deriveAesKey(key, salt);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as unknown as BufferSource },
      aesKey,
      ciphertext as unknown as BufferSource,
    );
    return new TextDecoder().decode(plaintext);
  } catch {
    return null;
  }
}

/**
 * Generates a random, human-typeable passphrase suitable for stash encryption.
 * @param length Number of characters to generate.
 * @returns Randomly generated passphrase.
 */
export function generateStashKey(length = 24): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
  const randomValues = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(randomValues, (value) => alphabet[value % alphabet.length]).join("");
}
