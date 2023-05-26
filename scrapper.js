const axios = require('axios');
const cheerio = require('cheerio');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('data.db', (error) => {
  if (error) {
    console.error('Error connecting to SQLite database:', error);
  } else {
    console.log('Connected to SQLite database');
  }
});

function createTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS currency (
      symbol TEXT,
      name TEXT,
      buy TEXT,
      sell TEXT
    )
  `);
}

function storeData(data) {
  db.serialize(() => {
    db.run('DELETE FROM currency', (error) => {
      if (error) {
        console.error('Error deleting existing data:', error);
      } else {
        const insertStatement = db.prepare(
          'INSERT INTO currency (symbol, name, buy, sell) VALUES (?, ?, ?, ?)'
        );
        data.forEach((item) => {
          insertStatement.run(item.symbol, item.name, item.buy, item.sell);
        });
        insertStatement.finalize();
        console.log('Data updated and inserted into SQLite database');
      }
    });
  });
}

function fetchDataAndStore() {
  axios
    .get('https://www.centkantor.pl/kursy-walut')
    .then((response) => {
      const $ = cheerio.load(response.data);
      const data = [];

      $('tr').each((index, element) => {
        const $td = $(element).find('td');

        const symbol = $td.eq(1).text();
        const name = $td.eq(2).text();
        const buy = $td.eq(3).text();
        const sell = $td.eq(4).text();

        const item = {
          symbol: symbol,
          name: name,
          buy: buy,
          sell: sell,
        };

        data.push(item);
      });

      storeData(data);
    })
    .catch((error) => {
      console.log('Error:', error);
    });
}

createTable(); // Create the table if it doesn't exist

// Initial data fetch and store
fetchDataAndStore();

// Schedule data update every 5 minutes
const updateInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
setInterval(() => {
  fetchDataAndStore();
}, updateInterval);
