const mongoose = require('mongoose');
const url = process.env.APP_DB_URL;

mongoose.connect(url, {
  useNewUrlParser: true,
  useCreateIndex: true
});
