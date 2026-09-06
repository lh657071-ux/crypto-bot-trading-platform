import pool from '../config/database';

export interface TradingBot {
  id: string;
  user_id: string;
  exchange_api_key_id: string;
  name: string;
  description?: string;
  symbol: string;
  trading_mode: string;
  status: string;
  is_paper_trading: boolean;
  initial_capital: number;
  position_size?: number;
  leverage: number;
  timeframe: string;
  use_indicators: boolean;
  min_signal_strength: number;
  settings: Record<string, any>;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_profit: number;
  started_at?: Date;
  last_trade_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export class TradingBotRepository {
  /**
   * Create trading bot
   */
  async create(
    userId: string,
    exchangeApiKeyId: string,
    data: Partial<TradingBot>
  ): Promise<TradingBot | null> {
    try {
      const query = `
        INSERT INTO trading_bots (
          user_id, exchange_api_key_id, name, description, symbol, trading_mode,
          is_paper_trading, initial_capital, timeframe, use_indicators, min_signal_strength, settings
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;
      const result = await pool.query(query, [
        userId,
        exchangeApiKeyId,
        data.name,
        data.description,
        data.symbol,
        data.trading_mode,
        data.is_paper_trading || false,
        data.initial_capital,
        data.timeframe || '1h',
        data.use_indicators !== false,
        data.min_signal_strength || 70,
        JSON.stringify(data.settings || {}),
      ]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error creating trading bot:', error);
      return null;
    }
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<TradingBot | null> {
    try {
      const query = 'SELECT * FROM trading_bots WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding bot:', error);
      return null;
    }
  }

  /**
   * Find all by user
   */
  async findByUser(userId: string): Promise<TradingBot[]> {
    try {
      const query = 'SELECT * FROM trading_bots WHERE user_id = $1 ORDER BY created_at DESC';
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error finding bots:', error);
      return [];
    }
  }

  /**
   * Update bot
   */
  async update(id: string, updates: Partial<TradingBot>): Promise<TradingBot | null> {
    try {
      const fields = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const query = `
        UPDATE trading_bots
        SET ${fields}
        WHERE id = $1
        RETURNING *
      `;

      const values = [id, ...Object.values(updates)];
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating bot:', error);
      return null;
    }
  }

  /**
   * Update bot status
   */
  async updateStatus(id: string, status: string): Promise<boolean> {
    try {
      const query = 'UPDATE trading_bots SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2';
      const result = await pool.query(query, [status, id]);
      return result.rowCount === 1;
    } catch (error) {
      console.error('Error updating bot status:', error);
      return false;
    }
  }

  /**
   * Delete bot
   */
  async delete(id: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM trading_bots WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rowCount === 1;
    } catch (error) {
      console.error('Error deleting bot:', error);
      return false;
    }
  }
}

export default new TradingBotRepository();
