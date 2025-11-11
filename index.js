const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2'); // <== penting!
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

