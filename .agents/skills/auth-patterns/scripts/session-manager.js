/**
 * Session Lifecycle Manager
 * logic for token generation and revocation (database/redis).
 */

export class SessionManager {
  /**
   * Generates a pair of Access and Refresh tokens
   */
  static generateTokens(user, secrets) {
    const accessToken = sign(
      { sub: user.id, role: user.role }, 
      secrets.access, 
      { expiresIn: '15m' }
    );
    
    const refreshToken = sign(
      { sub: user.id, version: user.tokenVersion }, 
      secrets.refresh, 
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Revokes all sessions for a user by incrementing token version
   */
  static async revokeAllSessions(userId, db) {
    await db.users.updateOne(
      { id: userId }, 
      { $inc: { tokenVersion: 1 } }
    );
  }
}
