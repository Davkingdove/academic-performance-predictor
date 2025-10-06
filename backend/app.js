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
// app.post('/api/schema/:schemaName/table', (req, res) => {
//   const { schemaName } = req.params;
//   const { tableName } = req.body;
//   //console.log('Creating table:', tableName, 'in schema:', schemaName);
//   if (!tableName) return res.status(400).json({ error: 'Table name required' });
//   db.query(`CREATE TABLE \`${schemaName}\`.\`${tableName}\` (
//     id INT PRIMARY KEY AUTO_INCREMENT,
//     first_name VARCHAR(100),
//     last_name VARCHAR(100),
//     english_30 DECIMAL(5,2),
//     english_70 DECIMAL(5,2),
//     english_100 DECIMAL(5,2),
//     maths_30 DECIMAL(5,2),
//     maths_70 DECIMAL(5,2),
//     maths_100 DECIMAL(5,2),
//     social_std_30 DECIMAL(5,2),
//     social_std_70 DECIMAL(5,2),
//     social_std_100 DECIMAL(5,2)
//   )`, (err) => {
//     if (err) return res.status(500).json({ error: err.message });
//     res.json({ message: 'Table created' });
//   });
// });

// Create a table in a schema AND its register table (with only id, student_id initially)
app.post('/api/schema/:schemaName/table', (req, res) => {
  const { schemaName } = req.params;
  const { tableName } = req.body;
  if (!tableName) return res.status(400).json({ error: 'Table name required' });

  // Create class table
  db.query(`CREATE TABLE \`${schemaName}\`.\`${tableName}\` (
    id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    english_30 DECIMAL(5,2),
    english_70 DECIMAL(5,2),
    english_100 DECIMAL(5,2),
    maths_30 DECIMAL(5,2),
    maths_70 DECIMAL(5,2),
    maths_100 DECIMAL(5,2),
    social_std_30 DECIMAL(5,2),
    social_std_70 DECIMAL(5,2),
    social_std_100 DECIMAL(5,2)
  )`, (err) => {
    if (err) return res.status(500).json({ error: err.message });

    // Create register table with only id and student_id
    const registerTable = `${tableName}-register`;
    db.query(
      `CREATE TABLE \`${schemaName}\`.\`${registerTable}\` (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT,
        FOREIGN KEY (student_id) REFERENCES \`${schemaName}\`.\`${tableName}\`(id) ON DELETE CASCADE
      )`,
      (err2) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ message: 'Class and register tables created' });
      }
    );
  });
});

// Add months as columns to the register table
app.post('/api/schema/:schemaName/register/:registerTable/add-months', (req, res) => {
  const { schemaName, registerTable } = req.params;
  const { months } = req.body; // months should be an array of month names
  if (!Array.isArray(months) || months.length === 0) {
    return res.status(400).json({ error: 'Months array required' });
  }
  const addCols = months.map(m => `ADD COLUMN \`${m}\` JSON`).join(', ');
  db.query(
    `ALTER TABLE \`${schemaName}\`.\`${registerTable}\` ${addCols}`,
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Months added to register table' });
    }
  );
});

// Get all rows in a table (class)
app.get('/api/schema/:schemaName/table/:tableName/rows', (req, res) => {
  const { schemaName, tableName } = req.params;
  console.log(`Fetching rows from ${schemaName}.${tableName}`);
  db.query(`SELECT * FROM \`${schemaName}\`.\`${tableName}\``, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ rows: results });
  });
});

// Add students in bulk
app.post('/api/schema/:schemaName/table/:tableName/add-students', (req, res) => {
  const { schemaName, tableName } = req.params;
  const { count } = req.body;
  if (!count || isNaN(count) || count < 1) return res.status(400).json({ error: 'Invalid count' });
  const students = [];
  for (let i = 1; i <= count; i++) {
    students.push([
      `firstname${i}`,
      `lastname${i}`,
      null, null, null, null, null, null, null, null, null
    ]);
  }
  db.query(
    `INSERT INTO \`${schemaName}\`.\`${tableName}\` (first_name, last_name, english_30, english_70, english_100, maths_30, maths_70, maths_100, social_std_30, social_std_70, social_std_100) VALUES ?`,
    [students],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      // Get the inserted IDs
      const firstId = result.insertId;
      const registerTable = `${tableName}-register`;
      const ids = [];
      for (let i = 0; i < result.affectedRows; i++) {
        ids.push(firstId + i);
      }
      if (!ids.length) return res.status(500).json({ error: 'No students found to map.' });
      const values = ids.map(student_id => `(${student_id})`).join(',');
      db.query(
        `INSERT INTO \`${schemaName}\`.\`${registerTable}\` (student_id) VALUES ${values}`,
        (err3) => {
          if (err3) return res.status(500).json({ error: err3.message });
          res.json({ message: `${count} students added and mapped to register` });
        }
      );
    }
  );
});

// Get all rows in a register table
app.get('/api/schema/:schemaName/register/:registerTable/rows', (req, res) => {
  const { schemaName, registerTable } = req.params;
  db.query(`SELECT * FROM \`${schemaName}\`.\`${registerTable}\``, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ rows: results });
  });
});

// Update all students
app.post('/api/schema/:schemaName/table/:tableName/update-all', (req, res) => {
  const { schemaName, tableName } = req.params;
  const { rows } = req.body;
  if (!Array.isArray(rows)) return res.json({ success: false, error: "No rows provided." });
  let error = null;
  let updated = 0;
  const promises = rows.map(row => {
    return new Promise((resolve) => {
      db.query(
        `UPDATE \`${schemaName}\`.\`${tableName}\` SET first_name=?, last_name=?, english_30=?, english_70=?, english_100=?, maths_30=?, maths_70=?, maths_100=?, social_std_30=?, social_std_70=?, social_std_100=? WHERE id=?`,
        [row.first_name, row.last_name, row.english_30, row.english_70, row.english_100, row.maths_30, row.maths_70, row.maths_100, row.social_std_30, row.social_std_70, row.social_std_100, row.id],
        (err) => {
          if (err) error = err.message;
          else updated++;
          resolve();
        }
      );
    });
  });
  Promise.all(promises).then(() => {
    if (error) return res.json({ success: false, error });
    res.json({ success: true, updated });
  });
});

// Update single student
app.post('/api/schema/:schemaName/table/:tableName/update-row', (req, res) => {
  const { schemaName, tableName } = req.params;
  const { row } = req.body;
  if (!row || !row.id) return res.json({ success: false, error: "No row provided." });
  db.query(
    `UPDATE \`${schemaName}\`.\`${tableName}\` SET first_name=?, last_name=?, english_30=?, english_70=?, english_100=?, maths_30=?, maths_70=?, maths_100=?, social_std_30=?, social_std_70=?, social_std_100=? WHERE id=?`,
    [row.first_name, row.last_name, row.english_30, row.english_70, row.english_100, row.maths_30, row.maths_70, row.maths_100, row.social_std_30, row.social_std_70, row.social_std_100, row.id],
    (err) => {
      if (err) return res.json({ success: false, error: err.message });
      res.json({ success: true });
    }
  );
});

// Delete single student
app.post('/api/schema/:schemaName/table/:tableName/delete-row', (req, res) => {
  const { schemaName, tableName } = req.params;
  const { id } = req.body;
  if (!id) return res.json({ success: false, error: "No id provided." });
  db.query(
    `DELETE FROM \`${schemaName}\`.\`${tableName}\` WHERE id=?`,
    [id],
    (err) => {
      if (err) return res.json({ success: false, error: err.message });
      res.json({ success: true });
    }
  );
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
