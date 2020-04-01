const mongoose = require("mongoose");

/**
 * url-shortener-api: is the data base name, is provided at the end of URL of mongodb
 * so we don't need to provide the db name in the callback after we connect to the client as in vanilla mongodb
 *   */

mongoose.connect(process.env.MONGODB_URI, {
  // These options are set To fix all deprecation warnings
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

// We now need to get notified if we connect successfully or if a connection error occurs:
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB Connected!");
})