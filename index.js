require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();

let nanoid;
(async () => {
  nanoid = (await import('nanoid')).nanoid;
})();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('Failed to connect:', err));

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

const URLSchema = new mongoose.Schema({
  OriginalURL: {type: String, required: true},
  ShortenedURL: {type: String, required: true}
});

const URL = mongoose.model('URL',URLSchema);

const createAndSaveURL = (originalURL,shortURL,done) => {
  const url = new URL({
    "original_url": originalURL,
    "short_url": shortURL,
  });
  url.save(function(err,data) {
    if (err) return console.log(err);
    done(null, data)
  });
};

const findOneByURL = (URL,done) => {
  URL.findOne({original_url: URL}, function (err, data) {
    if (err) return console.log(err);
    done(null, data);
  });
}

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
    const shortCode = nanoid(6);
    console.log(shortCode);

  } else {
    res.json({ "error": 'invalid url' })
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
