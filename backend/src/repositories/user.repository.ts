import pool from '../config/database';

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export class UserRepository {
  /**
   * Create new user
   */
  async create(
    email: string,
    username: string,
    passwordHash: string,
    fullName?: string
  ): Promise<User | null> {
    try {
      const query = `
        INSERT INTO users (email, username, password_hash, full_name)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, username, full_name, is_active, is_verified, created_at, updated_at
      `;
      const result = await pool.query(query, [email, username, passwordHash, fullName]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const query = `
        SELECT id, email, username, full_name, is_active, is_verified, created_at, updated_at
        FROM users
        WHERE email = $1
      `;
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const query = `
        SELECT id, email, username, full_name, is_active, is_verified, created_at, updated_at
        FROM users
        WHERE id = $1
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  /**
   * Update user
   */
  async update(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const fields = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const query = `
        UPDATE users
        SET ${fields}
        WHERE id = $1
        RETURNING id, email, username, full_name, is_active, is_verified, created_at, updated_at
      `;

      const values = [id, ...Object.values(updates)];
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  /**
   * Get user by email with password hash
   */
  async findByEmailWithPassword(email: string): Promise<(User & { password_hash: string }) | null> {
    try {
      const query = `
        SELECT id, email, username, full_name, password_hash, is_active, is_verified, created_at, updated_at
        FROM users
        WHERE email = $1
      `;
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user with password:', error);
      return null;
    }
  }
}

export default new UserRepository();
