"use strict";

const MongoClient = require("mongodb").MongoClient;
const dotenv = require("dotenv");
dotenv.config();

const MongoHandler = () => {
  const mu = {};
  let dbHostName = process.env.dbHostName || "";
  // let dbName = process.env.dbName || "";
  let dbUser = process.env.dbUser || "";
  let dbPassword = process.env.dbPassword || "";

  mu.connect = () => {
    const url = `mongodb+srv://${dbUser}:${dbPassword}@${dbHostName}?retryWrites=true&w=majority`;
    console.log(url);

    const client = new MongoClient(url, { useNewUrlParser: true });
    return client.connect();
  };

  mu.getDatabases = client => {
    return client
      .db()
      .admin()
      .listDatabases()
      .finally(() => {
        client.close();
      });
  };

  mu.getCollections = (client, dbName) => {
    return client
      .db(dbName)
      .listCollections()
      .toArray()
      .finally(() => {
        client.close();
      });
  };

  return mu;
};

const mu = MongoHandler();

mu.connect()
  .then(client => mu.getCollections(client, "nlf_main_db"))
  .then(collections => {
    console.log("las collecciones son", collections);
  })
  .catch(err => console.log("errorcito", err));

module.exports = MongoHandler;
