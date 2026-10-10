import 'dotenv/config';

import express from 'express';
import { Pool } from 'pg';

const app = express();
const PORT = process.env.PORT || 8000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

app.get('/', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const { rows } = await client.query('SELECT * FROM cars');
        res.json({ cars: rows });
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).json({ error: 'Failed to connect to the database.' });
    } finally {
        client?.release();
    }
});

app.listen(PORT, () => {
    console.log(`Listening to http://localhost:${PORT}`);
});