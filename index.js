const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const server = require('./qr');
const pairRoute = require('./pair');

app.use('/server', server);
app.use('/code', pairRoute);

app.get('/pair', (req, res) => {
  res.sendFile(path.join(__dirname, 'pair.html'));
});

app.get('/qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'qr.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Your server is running on http://localhost:${PORT}`);
});
