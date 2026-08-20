import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import pool from './database.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));

app.use(express.json());

// Note: We receive a SHA-256 digest from the frontend, NEVER a plaintext password.
// This prevents plaintext passwords from touching the network or backend server memory.
// We then hash this digest with bcrypt before storing it to protect against DB leaks.

app.post('/api/save-password', async (req, res) => {
  const { sessionId, digest } = req.body;

  if (!sessionId || !digest) {
    return res.status(400).json({ error: 'sessionId and digest are required fields' });
  }

  try {
    // Hash the digest using bcrypt
    const saltRounds = 10;
    const bcryptHash = await bcrypt.hash(digest, saltRounds);

    // Store in DB, scoped by sessionId
    const query = 'INSERT INTO password_history (session_id, hash) VALUES ($1, $2)';
    await pool.query(query, [sessionId, bcryptHash]);

    res.status(201).json({ message: 'Password digest saved successfully' });
  } catch (error) {
    console.error('Error saving password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/check-reuse', async (req, res) => {
  const { sessionId, digest } = req.body;

  if (!sessionId || !digest) {
    return res.status(400).json({ error: 'sessionId and digest are required fields' });
  }

  try {
    // Retrieve all saved hashes for this session
    const query = 'SELECT hash FROM password_history WHERE session_id = $1';
    const result = await pool.query(query, [sessionId]);

    let isReused = false;

    // Check incoming digest against stored bcrypt hashes
    for (const row of result.rows) {
      const match = await bcrypt.compare(digest, row.hash);
      if (match) {
        isReused = true;
        break;
      }
    }

    res.json({ isReused });
  } catch (error) {
    console.error('Error checking password reuse:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
