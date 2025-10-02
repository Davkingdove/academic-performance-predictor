const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection config
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root', // Set your MySQL password
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Create a new schema
db.query('SHOW DATABASES', (err, results) => {
  if (err) throw err;
});

app.post('/api/schema', (req, res) => {
  const { schemaName } = req.body;
  if (!schemaName) return res.status(400).json({ error: 'Schema name required' });
  db.query(`CREATE DATABASE \`${schemaName}\``, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Schema created' });
  });
});

// List all schemas
app.get('/api/schemas', (req, res) => {
  db.query('SHOW DATABASES', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const schemas = results.map((row) => row.Database);
    res.json({ schemas });
  });
});

// List tables in a schema
app.get('/api/schema/:schemaName/tables', (req, res) => {
  const { schemaName } = req.params;
  db.query(`SHOW TABLES FROM \`${schemaName}\``, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const tables = results.map((row) => Object.values(row)[0]);
    res.json({ tables });
  });
});

// Create a table in a schema
app.post('/api/schema/:schemaName/table', (req, res) => {
  const { schemaName } = req.params;
  const { tableName } = req.body;
  if (!tableName) return res.status(400).json({ error: 'Table name required' });
  db.query(`CREATE TABLE \`${schemaName}\`.\`${tableName}\` (id INT PRIMARY KEY AUTO_INCREMENT)`, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Table created' });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
