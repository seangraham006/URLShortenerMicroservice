require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

function isValidURL(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

app.post("/api/shorturl", async (req,res) => {
  const { url } = req.body;
  if (isValidURL(url)) {
    console.log("true")
  } else {
    res.json({ "error": 'invalid url' })
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
