// ./src/APIs/setup/main.js
const express = require('express');
const app = express();

app.use(express.json());

app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    endpoints: ['/api/chat']
  });
});

require('./load')(app);

app.listen(3000, () => {
  console.log('[API] Listening on http://localhost:3000');
});

module.exports = app;
