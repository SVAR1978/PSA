import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database schema
const initDB = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL Database.');
    
    // Create password_history table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_history (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) NOT NULL,
        hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Database schema initialized.');
    client.release();
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

initDB();

export default pool;
