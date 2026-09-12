const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('OK');
});

app.get('/slow', (req, res) => {
  setTimeout(() => res.send('OK'), 100);
});

app.listen(3000, () => console.log('Listening on http://localhost:3000'));