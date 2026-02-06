import express from 'express';
import cors from 'cors';
import pg from 'pg';
const { Pool } = pg;

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  // connectionString: process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL,
  connectionString: "postgresql://postgres:RevAJPaQCrrzJJBVQpRxgfNRshSpwttt@ballast.proxy.rlwy.net:55662/railway",
  // ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  ssl: { rejectUnauthorized: false }, 
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Test database connection and create table
async function initDatabase() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    // Create assessments table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_email VARCHAR(255),
        primary_name VARCHAR(255),
        user_phone VARCHAR(255),
        secondary_name VARCHAR(255),
        is_married BOOLEAN DEFAULT FALSE,
        total_asset_value FLOAT,
        total_income_value FLOAT,
        is_eligible BOOLEAN,
        submission_data JSONB
      )
    `);
    
    console.log('Database tables created successfully!');
    client.release();
  } catch (err) {
    console.error('Database initialization error:', err);
    throw err;
  }
}

// Initialize database on startup
initDatabase().catch(console.error);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Handsome OALA API is running' });
});

// Create assessment
app.post('/assessments/', async (req, res) => {
  try {
    console.log('Creating assessment for user_email:', req.body.user_email);
    
    const {
      user_email,
      primary_name,
      user_phone,
      secondary_name,
      is_married,
      total_asset_value,
      total_income_value,
      is_eligible,
      submission_data
    } = req.body;

    const result = await pool.query(
      `INSERT INTO assessments 
       (user_email, primary_name, user_phone, secondary_name, is_married, 
        total_asset_value, total_income_value, is_eligible, submission_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [user_email, primary_name, user_phone, secondary_name, is_married,
       total_asset_value, total_income_value, is_eligible, submission_data]
    );

    console.log('Successfully created assessment with ID:', result.rows[0].id);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Failed to create assessment:', err);
    res.status(500).json({ detail: `Database error: ${err.message}` });
  }
});

// Get assessments
app.get('/assessments/', async (req, res) => {
  try {
    const { skip = 0, limit = 100, user_email, search } = req.query;
    
    let query = 'SELECT * FROM assessments WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (user_email) {
      query += ` AND user_email = $${paramCount}`;
      params.push(user_email);
      paramCount++;
    }

    if (search) {
      query += ` AND (primary_name ILIKE $${paramCount} OR user_phone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(skip));

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch assessments:', err);
    res.status(500).json({ detail: `Database error: ${err.message}` });
  }
});

// Get single assessment
app.get('/assessments/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM assessments WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ detail: 'Assessment not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Failed to fetch assessment:', err);
    res.status(500).json({ detail: `Database error: ${err.message}` });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
