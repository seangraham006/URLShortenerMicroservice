require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
const isUrl = require('is-url');

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
  originalURL: {type: String, required: true},
  shortenedURL: {type: String, required: true}
});

const URL = mongoose.model('URL',URLSchema);

/*const createAndSaveURL = (originalURL,shortURL,done) => {
  const url = new URL({
    original_url: originalURL,
    short_url: shortURL,
  });
  url.save(function(err,data) {
    if (err) return console.log(err);
    done(null, data);
  });
};*/

const createAndSaveURL = async (originalURL, shortURL) => {
  const url = new URL({
    original_url: originalURL,
    short_url: shortURL,
  });

  try {
    const savedURL = await url.save();
    return savedURL;
  } catch (err) {
    console.log(err)
    throw err;
  }
};

/*const findOneByURL = (url,done) => {
  URL.findOne({original_url: url}, function (err, data) {
    if (err) return console.log(err);
    done(null, data);
  });
}*/

const findOneByURL = async (url) => {
  try {
    const foundURL = await URL.findOne({ originalURL: url });
    return foundURL;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

function isValidURL(string) {
  console.log(string);
  if (isUrl(string)) {
    console.log("true");
    return true
  } else {
    return false
  }
}

app.post("/api/shorturl", async (req,res) => {
  const { url } = req.body;

  if (isValidURL(url)) {
    //check if exists
    findOneByURL(url, (err, foundURL) => {
      if (foundURL) {
        res.json({
          original_url: foundURL.original_url,
          short_url: foundURL.short_url
        });
      } else {
        const shortCode = nanoid(6);
        createAndSaveURL(url, shortCode, (err, savedURL) => {
          if (!err) {
            res.json({
              original_url: savedURL.original_url,
              short_url: savedURL.short_url
            });
          }
        });
      }
    });
  } else {
    res.json({ "error": 'invalid url' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
