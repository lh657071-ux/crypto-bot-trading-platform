import pool from '../config/database';

export interface Order {
  id: string;
  bot_id?: string;
  user_id: string;
  exchange_order_id?: string;
  symbol: string;
  order_type: 'limit' | 'market';
  order_side: 'buy' | 'sell';
  status: 'open' | 'closed' | 'canceled' | 'pending';
  price?: number;
  amount: number;
  filled: number;
  remaining?: number;
  total_cost?: number;
  fee?: number;
  signal_id?: string;
  created_at: Date;
  updated_at: Date;
  filled_at?: Date;
  canceled_at?: Date;
}

export class OrderRepository {
  /**
   * Create order
   */
  async create(userId: string, data: Partial<Order>): Promise<Order | null> {
    try {
      const query = `
        INSERT INTO orders (
          user_id, bot_id, symbol, order_type, order_side,
          price, amount, filled, remaining, total_cost, fee, signal_id, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `;
      const result = await pool.query(query, [
        userId,
        data.bot_id,
        data.symbol,
        data.order_type,
        data.order_side,
        data.price,
        data.amount,
        data.filled || 0,
        data.remaining || data.amount,
        data.total_cost,
        data.fee,
        data.signal_id,
        data.status || 'pending',
      ]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<Order | null> {
    try {
      const query = 'SELECT * FROM orders WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding order:', error);
      return null;
    }
  }

  /**
   * Find by user
   */
  async findByUser(userId: string, limit: number = 50): Promise<Order[]> {
    try {
      const query = `
        SELECT * FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;
      const result = await pool.query(query, [userId, limit]);
      return result.rows;
    } catch (error) {
      console.error('Error finding orders:', error);
      return [];
    }
  }

  /**
   * Find by bot
   */
  async findByBot(botId: string): Promise<Order[]> {
    try {
      const query = `
        SELECT * FROM orders
        WHERE bot_id = $1
        ORDER BY created_at DESC
      `;
      const result = await pool.query(query, [botId]);
      return result.rows;
    } catch (error) {
      console.error('Error finding orders:', error);
      return [];
    }
  }

  /**
   * Update order
   */
  async update(id: string, updates: Partial<Order>): Promise<Order | null> {
    try {
      const fields = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const query = `
        UPDATE orders
        SET ${fields}
        WHERE id = $1
        RETURNING *
      `;

      const values = [id, ...Object.values(updates)];
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating order:', error);
      return null;
    }
  }
}

export default new OrderRepository();
