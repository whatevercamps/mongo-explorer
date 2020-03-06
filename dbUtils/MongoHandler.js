"use strict";

const MongoClient = require("mongodb").MongoClient;
const dotenv = require("dotenv");
const ObjectID = require("mongodb").ObjectID;
dotenv.config();

const MongoHandler = () => {
  const mu = {};
  let dbHostName = process.env.dbHostName || "";
  let dbUser = process.env.dbUser || "";
  let dbPassword = process.env.dbPassword || "";

  mu.connect = _url => {
    const url =
      _url ||
      `mongodb+srv://${dbUser}:${dbPassword}@${dbHostName}?retryWrites=true&w=majority`;
    console.log("connect", url);

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

  mu.getCollectionsStats = (client, dbName, collectionName) => {
    return client
      .db(dbName)
      .collection(collectionName)
      .stats()
      .finally(() => {
        client.close();
      });
  };

  mu.getDocuments = (client, dbName, collectionName) => {
    return client
      .db(dbName)
      .collection(collectionName)
      .find({})
      .limit(20)
      .sort({ _id: -1 })
      .toArray()
      .finally(() => client.close());
  };

  mu.insertDocument = (client, dbName, colName, doc) => {
    console.log("insertando", doc);
    const playersHandler = client.db(dbName).collection(colName);
    return playersHandler.insertOne(doc).finally(() => {
      console.log("doc inserted");
      client.close();
    });
  };

  mu.deleteDocument = (client, dbName, colName, doc) => {
    return client
      .db(dbName)
      .collection(colName)
      .findOneAndDelete(((doc._id = new ObjectID(doc._id)), doc))
      .finally(() => client.close());
  };

  mu.updateDocument = (client, dbName, colName, prevDoc, newDoc) => {
    console.log("updating", { prev: prevDoc, new: newDoc });
    return client
      .db(dbName)
      .collection(colName)
      .findOneAndReplace(
        ((prevDoc._id = new ObjectID(prevDoc._id)), prevDoc),
        newDoc
      )
      .finally(() => client.close());
  };
  return mu;
};

// const mu = MongoHandler();

// mu.connect()
//   .then(client => mu.getCollections(client, "nlf_main_db"))
//   .then(collections =>
//     Promise.all(
//       collections.map(collection =>
//         mu
//           .connect()
//           .then(client =>
//             mu.getCollectionsStats(client, "nlf_main_db", collection.name)
//           )
//       )
//     ).then(stats => {
//       collections.map(
//         (collection, index) => (
//           (collection["stats"] = stats[index]), collection
//         )
//       );
//       console.log("jeje", collections);
//     })
//   );

module.exports = MongoHandler;
// fetch("http://swapi.co/api/people/2/")
//   .then(characterResponse => characterResponse.json())
//   .then(characterResponseJson => {
//     Promise.all(
//       characterResponseJson.films.map(filmUrl =>
//         fetch(filmUrl).then(filmResponse => filmResponse.json())
//       )
//     ).then(films => {
//       console.log(films);
//     });
//   });
