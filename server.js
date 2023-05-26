const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const moment = require('moment');

const app = express();
const port = 3000;

const db = new sqlite3.Database('data.db', (error) => {
  if (error) {
    console.error('Error connecting to SQLite database:', error);
  } else {
    console.log('Connected to SQLite database');
  }
});

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  db.all('SELECT * FROM currency', (error, rows) => {
    if (error) {
      console.error('Error retrieving data from SQLite:', error);
      res.status(500).send('Internal server error');
    } else {
      const lastUpdate = moment().format('YYYY-MM-DD HH:mm:ss');
      res.render('index', { data: rows, lastUpdate });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
