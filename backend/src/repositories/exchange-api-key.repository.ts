import pool from '../config/database';

export interface ExchangeApiKey {
  id: string;
  user_id: string;
  exchange_name: string;
  api_key: string;
  api_secret: string;
  passphrase?: string;
  is_active: boolean;
  last_tested_at?: Date;
  test_status?: string;
  created_at: Date;
  updated_at: Date;
}

export class ExchangeApiKeyRepository {
  /**
   * Create API key
   */
  async create(
    userId: string,
    exchangeName: string,
    apiKey: string,
    apiSecret: string,
    passphrase?: string
  ): Promise<ExchangeApiKey | null> {
    try {
      const query = `
        INSERT INTO exchange_api_keys (user_id, exchange_name, api_key, api_secret, passphrase)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const result = await pool.query(query, [userId, exchangeName, apiKey, apiSecret, passphrase]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error creating API key:', error);
      return null;
    }
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<ExchangeApiKey | null> {
    try {
      const query = 'SELECT * FROM exchange_api_keys WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding API key:', error);
      return null;
    }
  }

  /**
   * Find by user and exchange
   */
  async findByUserAndExchange(userId: string, exchangeName: string): Promise<ExchangeApiKey | null> {
    try {
      const query = `
        SELECT * FROM exchange_api_keys
        WHERE user_id = $1 AND exchange_name = $2
      `;
      const result = await pool.query(query, [userId, exchangeName]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding API key:', error);
      return null;
    }
  }

  /**
   * Find all by user
   */
  async findByUser(userId: string): Promise<ExchangeApiKey[]> {
    try {
      const query = `
        SELECT * FROM exchange_api_keys
        WHERE user_id = $1 AND is_active = true
      `;
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error finding API keys:', error);
      return [];
    }
  }

  /**
   * Update API key
   */
  async update(id: string, updates: Partial<ExchangeApiKey>): Promise<ExchangeApiKey | null> {
    try {
      const fields = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const query = `
        UPDATE exchange_api_keys
        SET ${fields}
        WHERE id = $1
        RETURNING *
      `;

      const values = [id, ...Object.values(updates)];
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating API key:', error);
      return null;
    }
  }

  /**
   * Delete API key
   */
  async delete(id: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM exchange_api_keys WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rowCount === 1;
    } catch (error) {
      console.error('Error deleting API key:', error);
      return false;
    }
  }
}

export default new ExchangeApiKeyRepository();
