"use strict";

var express = require("express");
require("./db/mongoose");
const Url = require("./models/url");
// var mongodb = require('mongodb');
// var mongoose = require('mongoose');

// var cors = require('cors');

var app = express();

// Basic Configuration
var port = process.env.PORT || 3000;

/** this project needs a db !! **/

// mongoose.connect(process.env.DB_URI);

// app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
/**
 * Earlier versions of Express used to have a lot of middleware bundled with it.
 * bodyParser was one of the middlewares that came it.
 * When Express 4.0 was released they decided to remove the bundled middleware from Express and make them separate packages instead.
 * The syntax then changed from app.use(express.json()) to app.use(bodyParser.json()) or app.use(express.urlencoded()) after installing the bodyParser module.
 *
 * bodyParser was added back to Express in release 4.16.0, because people wanted it bundled with Express like before.
 * That means you don't have to use bodyParser.json() anymore if you are on the latest release. You can use express.json() instead.
 * app.use(express.urlencoded()) : decodes "urlencoded" requests (form submissions)
 * app.use(bodyParser.json()) : decodes "json" requests
 *
 */
app.use(express.urlencoded({ extended: false }));
/**
 * The process.cwd() => method returns the current working directory of the Node.js process.
 * app.use('/public',...) => To create a virtual path prefix (where the path does not actually exist in the file system) for files that are served by the express.static function
 * express.static(process.cwd() + '/public') => using the absolute path of the directory that contains static files
 * However, the path that you provide to the express.static function is relative to the directory from where you launch your node process.
 * If you run the express app from another directory, it’s safer to use the absolute path of the directory that you want to serve
 */
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Posting new URL end point to generate a short url for it
app.post("/api/shorturl/new", async (req, res) => {
  try {
    // checking if the url already exists in the db
    const url = await Url.findOne({ address: req.body.url });
    if (url) {
      // if it exists, send it back without saving it again
      res.send(url);
    } else {
      // if it doesn't, create an instance and save it
      const urlInstance = new Url({
        address: req.body.url
      });
      await urlInstance.save();
      res.status(201).send(urlInstance);
    }
  } catch (error) {
     res.status(400).send({"error":"invalid URL"});
    //res.status(400).send({"error": error.message});

  }
});

app.get("/api/shorturl/:url", async function(req, res) {
  try {
    const shortAddress = req.params.url
    const address = await Url.findById(shortAddress)
    if(!address){
      throw new Error("This url doesn't exist in the Database")
    }
    res.redirect(address.address)
  } catch (error) {
    res.status(400).send({"error":"invalid URL"})
    //res.status(400).send({"error": error.message});
  }
});

app.listen(port, function() {
  console.log(`Node.js listening on port ${process.env.PORT}`);
});
