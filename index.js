const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2'); // <== penting!
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === Koneksi ke database ===
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Kendari2023',
  database: 'db_apikey',
  port: 3309
});

db.connect((err) => {
  if (err) {
    console.error('❌ Gagal konek ke database:', err);
  } else {
    console.log('✅ Terhubung ke database MySQL');
  }
});


