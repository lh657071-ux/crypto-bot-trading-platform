import pool from '../config/database';

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  is_revoked: boolean;
  created_at: Date;
  expires_at: Date;
}

export class RefreshTokenRepository {
  /**
   * Store refresh token
   */
  async create(userId: string, token: string, expiresAt: Date): Promise<RefreshToken | null> {
    try {
      const query = `
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await pool.query(query, [userId, token, expiresAt]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error creating refresh token:', error);
      return null;
    }
  }

  /**
   * Find refresh token
   */
  async findByToken(token: string): Promise<RefreshToken | null> {
    try {
      const query = `
        SELECT * FROM refresh_tokens
        WHERE token = $1 AND is_revoked = false AND expires_at > NOW()
      `;
      const result = await pool.query(query, [token]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding refresh token:', error);
      return null;
    }
  }

  /**
   * Revoke token
   */
  async revoke(token: string): Promise<boolean> {
    try {
      const query = 'UPDATE refresh_tokens SET is_revoked = true WHERE token = $1';
      const result = await pool.query(query, [token]);
      return result.rowCount === 1;
    } catch (error) {
      console.error('Error revoking token:', error);
      return false;
    }
  }

  /**
   * Revoke all user tokens
   */
  async revokeAllUserTokens(userId: string): Promise<number> {
    try {
      const query = 'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1';
      const result = await pool.query(query, [userId]);
      return result.rowCount || 0;
    } catch (error) {
      console.error('Error revoking user tokens:', error);
      return 0;
    }
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpired(): Promise<number> {
    try {
      const query = 'DELETE FROM refresh_tokens WHERE expires_at < NOW()';
      const result = await pool.query(query);
      return result.rowCount || 0;
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
      return 0;
    }
  }
}

export default new RefreshTokenRepository();
