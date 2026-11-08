/**
 * WebAuthn (Passkeys) Helper Logic
 * Client-side methods for credential registration and authentication.
 */

export const Passkeys = {
  /**
   * Register a new Passkey
   */
  async register(options) {
    // Convert base64 fields from server to Uint8Arrays
    const credentialOptions = {
      ...options,
      challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
      user: {
        ...options.user,
        id: Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0))
      }
    };

    const credential = await navigator.credentials.create({
      publicKey: credentialOptions
    });

    return credential;
  },

  /**
   * Authenticate with a Passkey
   */
  async authenticate(options) {
    const assertionOptions = {
      ...options,
      challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
      allowCredentials: options.allowCredentials?.map(c => ({
        ...c,
        id: Uint8Array.from(atob(c.id), c => c.charCodeAt(0))
      }))
    };

    const assertion = await navigator.credentials.get({
      publicKey: assertionOptions
    });

    return assertion;
  }
};
