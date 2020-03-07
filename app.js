"use strict";
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
app.get(/\/(databases)*/, (req, res) => {
  mu.connect()
    .then(client => mu.getDatabases(client))
    .then(databases => {
      //console.log("dbs", databases.databases);
      if (databases.databases && databases.databases.length)
        mu.connect()
          .then(client =>
            mu.getCollections(client, databases.databases[0].name)
          )
          .then(collections =>
            Promise.all(
              collections.map(collection =>
                mu
                  .connect()
                  .then(client =>
                    mu.getCollectionsStats(
                      client,
                      "nlf_main_db",
                      collection.name
                    )
                  )
              )
            )
              .then(stats => {
                collections.map(
                  (collection, index) => (
                    (collection["stats"] = stats[index]), collection
                  )
                );
                //console.log("collections", collections);
                res.render("databases", {
                  databases: databases.databases,
                  collections: collections || []
                });
              })
              .catch(err => {
                //console.log("errorcito", err);
                res.json({ error: err });
              })
          );
      else
        res.render("databases", {
          databases: databases.databases,
          collections: []
        });
    })
    .catch(err => console.log("errorcito", err));
});

app.get("/connect/*", (req, res) => {
  const url = req.params[0];
  if (url)
    mu.connect(url)
      .then(client => {
        //console.log("client", client);
        return client
          .db()
          .admin()
          .listDatabases();
      })

      .then(data => {
        //console.log("data", data);
        res.json(((data.success = true), data));
        // } else res.json({ success: false, error: "got no client" });
      })
      .catch(err => {
        //console.log("error", err);
        res.json({ success: false, error: err });
      });
  else res.json({ success: false, error: "no url provided" });
});

app.get("/documents/*/", (req, res) => {
  const dbName = req.query["dbname"];
  const colName = req.query["colname"];
  const pag = req.query["pag"];
  const url = req.params[0];
  console.log("data", { dbName: dbName, colName: colName, url: url });
  if (!dbName || !colName || !dbName.length || !colName.length)
    res.json({
      success: false,
      error: "you have to provide database and collection name"
    });
  else
    mu.connect(url.includes("default_y22__y1237") ? undefined : url)
      .then(client => {
        mu.getDocuments(client, dbName, colName, pag).then(documents => {
          res.json({ success: true, documents: documents });
        });
      })
      .catch(err => res.json({ success: false, error: err }));
});

app.get("/collections/*/", (req, res) => {
  const dbName = req.query["dbname"];
  const url = req.params[0];
  if (dbName)
    mu.connect(url.includes("default_y22__y1237") ? undefined : url)
      .then(client => mu.getCollections(client, dbName))
      .then(collections =>
        Promise.all(
          collections.map(collection =>
            mu
              .connect(url.includes("default_y22__y1237") ? undefined : url)
              .then(client =>
                mu.getCollectionsStats(client, "nlf_main_db", collection.name)
              )
          )
        )
          .then(stats => {
            collections.map(
              (collection, index) => (
                (collection["stats"] = stats[index]), collection
              )
            );
            //console.log("collections", collections);
            res.json({ success: true, collections: collections });
          })
          .catch(err => {
            console.log("errorcito", err);
            res.json({ error: err });
          })
      );
  else
    res.json({
      error: "U have to send me the name of database",
      sentDatabase: dbName
    });
});

const validateJson = json => {
  try {
    JSON.parse(JSON.stringify(json));
  } catch (error) {
    return false;
  }
  return true;
};

app.post("/newDoc", (req, res) => {
  let body = req.body;
  if (body.dbName && body.colName) {
    if (body["document"] && validateJson(body["document"]))
      mu.connect(body.url)
        .then(client =>
          mu.insertDocument(client, body.dbName, body.colName, body["document"])
        )
        .then(resp => {
          res.json({ success: true, resp: resp });
        })
        .catch(error => {
          console.log("error inserting--------------------->", error);
        });
    else
      res.json({
        success: false,
        error: "You have to send a valid json stringtified"
      });
  }
});

app.post("/delDoc", (req, res) => {
  let body = req.body;
  if (body.dbName && body.colName) {
    if (body["document"] && validateJson(body["document"]))
      mu.connect(body.url)
        .then(client =>
          mu.deleteDocument(client, body.dbName, body.colName, body["document"])
        )
        .then(resp => {
          res.json({ success: true, resp: resp });
        })
        .catch(error => {
          console.log("error deleting--------------------->", error);
        });
    else
      res.json({
        success: false,
        error: "You have to send a valid json stringtified document"
      });
  }
});

app.post("/updateDoc", (req, res) => {
  let body = req.body;
  if (body.dbName && body.colName) {
    if (body["prevDoc"] && validateJson(body["prevDoc"])) {
      if (body["newDoc"] && validateJson(body["newDoc"])) {
        console.log("called", body);
        mu.connect(body.url)
          .then(client =>
            mu.updateDocument(
              client,
              body.dbName,
              body.colName,
              body["prevDoc"],
              body["newDoc"]
            )
          )
          .then(resp => {
            res.json({ success: true, resp: resp });
          })
          .catch(error => {
            console.log("error updating--------------------->", error);
          });
      } else
        res.json({
          success: false,
          error: "You have to send a valid json stringtified new document"
        });
    } else {
      res.json({
        success: false,
        error: "You have to send a valid json stringtified prev document"
      });
    }
  } else {
    res.json({
      success: false,
      error: "You have to send a valid req body"
    });
  }
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
