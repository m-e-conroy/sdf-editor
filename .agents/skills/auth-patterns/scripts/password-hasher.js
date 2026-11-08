/**
 * Secure Password Hashing using Node.js Crypto
 * Implementation of scrypt (recommended for security).
 */

import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

export class PasswordHasher {
  /**
   * Hashes a password with a unique salt
   * Format: salt:hash
   */
  static async hash(password) {
    const salt = randomBytes(16).toString('hex');
    const buf = await scryptAsync(password, salt, 64);
    return `${salt}:${buf.toString('hex')}`;
  }

  /**
   * Compares a raw password against a stored hash
   */
  static async verify(password, storedValue) {
    const [salt, hash] = storedValue.split(':');
    const hashBuf = Buffer.from(hash, 'hex');
    const verifyBuf = await scryptAsync(password, salt, 64);
    
    // Timing safe comparison to prevent side-channel attacks
    return timingSafeEqual(hashBuf, verifyBuf);
  }
}
