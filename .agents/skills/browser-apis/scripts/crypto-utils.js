/**
 * Web Crypto API Utilities
 * Secure hashing and encryption.
 */

const CryptoUtils = {
  /**
   * Generates a SHA-256 hash of a string
   */
  async hash(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Generates a cryptographically strong random string
   */
  generateRandomString(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Basic AES-GCM Encryption (Simplified)
   */
  async encrypt(text, secret) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret.padEnd(32)), 'AES-GCM', false, ['encrypt']
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key, enc.encode(text)
    );
    return { ciphertext, iv };
  }
};

export { CryptoUtils };
