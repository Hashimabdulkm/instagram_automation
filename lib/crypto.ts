"use server";

// Simple AES-GCM helpers for encrypting/decrypting short secrets (e.g., access tokens)
// Requires process.env.ENCRYPTION_KEY to be a base64 string representing 32 bytes

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function getRawKey(): Uint8Array {
  const base64Key = process.env.ENCRYPTION_KEY;
  if (!base64Key) {
    throw new Error("ENCRYPTION_KEY is not set");
  }
  let raw: Uint8Array;
  try {
    // Create a proper Uint8Array with ArrayBuffer
    const buffer = Buffer.from(base64Key, "base64");
    raw = new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
  } catch (e) {
    throw new Error("ENCRYPTION_KEY must be base64-encoded");
  }
  if (raw.byteLength !== 32) {
    throw new Error("ENCRYPTION_KEY must decode to 32 bytes (256-bit)");
  }
  return raw;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const raw = getRawKey();
  return await crypto.subtle.importKey(
    "raw",
    raw.buffer as ArrayBuffer,  // Explicit cast
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function randomIv(): Uint8Array {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  return iv;
}

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(s: string): Uint8Array {
  // Create a proper Uint8Array with ArrayBuffer
  const buffer = Buffer.from(s, "base64");
  return new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
}

export async function encryptString(plaintext: string): Promise<string> {
  const key = await getCryptoKey();
  const iv = randomIv();
  const data = textEncoder.encode(plaintext);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      data.buffer as ArrayBuffer
    )
  );
  // Store as iv:ciphertext (both base64)
  return `${toBase64(iv)}:${toBase64(ciphertext)}`;
}

export async function decryptString(payload: string): Promise<string> {
  const [ivB64, ctB64] = payload.split(":");
  if (!ivB64 || !ctB64) throw new Error("Invalid encrypted payload format");

  const key = await getCryptoKey();
  const iv = fromBase64(ivB64);
  const ciphertext = fromBase64(ctB64);

  const plaintext = new Uint8Array(
    await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
      key,
      ciphertext.buffer as ArrayBuffer
    )
  );
  return textDecoder.decode(plaintext);
}

/**
 * Verifies Instagram webhook payload signature using HMAC-SHA256
 * @param payload - The raw request body as string
 * @param signature - The X-Hub-Signature-256 header value (with "sha256=" prefix)
 * @param secret - The Instagram App Secret
 * @returns true if signature is valid, false otherwise
 */
export async function verifyInstagramSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Remove "sha256=" prefix from signature
    const expectedSignature = signature.replace("sha256=", "");

    // Create HMAC key from secret
    const key = await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Generate signature for the payload
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      textEncoder.encode(payload)
    );

    // Convert to hex string
    const generatedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Compare signatures using constant-time comparison
    return constantTimeCompare(generatedSignature, expectedSignature);
  } catch (error) {
    console.error("[Crypto] Signature verification failed:", error);
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}