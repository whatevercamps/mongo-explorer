var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var app = express();

//cosas mias
const mongoUtils = require("./dbUtils/MongoHandler.js");
const mu = mongoUtils();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//bellos endpoints
app.get("/databases", (req, res) => {
  mu.connect()
    .then(client => mu.getDatabases(client))
    .then(databases => {
      console.log("dbs", databases.databases);
      res.render("databases", { databases: databases.databases });
    })
    .catch(err => console.log("errorcito", err));
});

app.get("/collections", (req, res) => {
  const dbName = req.params["dbname"];
  if (dbName)
    mu.connect()
      .then(client => mu.getCollections(client, dbName))
      .then(collections => {
        console.log("collections", collections);
        res.json({ collections: collections });
      })
      .catch(err => {
        console.log("errorcito", err);
        res.json({ error: err });
      });
  else res.json({ error: "U have to send me the name of database" });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
