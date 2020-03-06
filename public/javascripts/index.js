"use strict";
const dbSelector = document.querySelector("#databasesSelector");
const connectForm = document.querySelector("#connectForm");

const urlselector = document.querySelector("#dburl");

const containerCollections = document.querySelector("#containerCollections");
const collections = document.querySelectorAll(".collectionCard");

const containerDocuments = document.querySelector("#containerDocuments");

const containerDocumentWorker = document.querySelector("#documentWorkDesk");

const newJsonDocumentInput = document.querySelector("#newJsonDocumentInput");
const jsonPreviewField = document.querySelector("#jsonPreview");
const newJsonDocumentButton = document.querySelector("#newJsonDocumentButton");
const documentWorkDeskForm = document.querySelector("#documentWorkDeskForm");

const documentUpdateForm = document.querySelector("#documentUpdateForm");

const updateJsonDocumentInput = document.querySelector(
  "#updateJsonDocumentInput"
);
const jsonPreviewUpdate = document.querySelector("#jsonPreviewUpdate");
const updateJsonDocumentButton = document.querySelector(
  "#updateJsonDocumentButton"
);

const stepsContainer = document.querySelector("#stepsContainer");
const stepReady = document.querySelector("#stepReady");
const stepConnected = document.querySelector("#stepConnected");
const stepAuth = document.querySelector("#stepAuth");

let contextData = {};

let isUpdate = false;

const validateJson = json => {
  try {
    JSON.parse(json);
  } catch (error) {
    return false;
  }
  return true;
};

if (updateJsonDocumentInput)
  updateJsonDocumentInput.addEventListener("input", () => {
    if (
      contextData["dbName"] &&
      contextData["collectionName"] &&
      contextData["docUpdate"]
    ) {
      jsonPreviewUpdate.innerText = updateJsonDocumentInput.value.replace(
        /,/g,
        ", \n"
      );
      jsonPreviewUpdate.style.color = validateJson(
        updateJsonDocumentInput.value
      )
        ? "green"
        : "red";
      PR.prettyPrint();
      if (
        updateJsonDocumentInput.value.replace(/\s\s*/g, "").trim() &&
        validateJson(updateJsonDocumentInput.value)
      ) {
        updateJsonDocumentButton.disabled = false;
      } else {
        updateJsonDocumentButton.disabled = true;
      }
    }
  });

if (documentUpdateForm)
  documentUpdateForm.addEventListener("submit", evt => {
    console.log("llego");
    evt.preventDefault();
    if (
      contextData["dbName"] &&
      contextData["collectionName"] &&
      contextData["docUpdate"]
    ) {
      if (
        updateJsonDocumentInput.value.replace(/\s\s*/g, "").trim() &&
        validateJson(updateJsonDocumentInput.value)
      ) {
        updateDocument(
          JSON.parse(updateJsonDocumentInput.value),
          contextData["docUpdate"]
        );
      }
    }
  });

const createDocument = (dbName, colName, doc) => {
  let body = JSON.stringify({
    dbName: dbName,
    colName: colName,
    document: JSON.parse(doc),
    url: contextData["url"]
  });
  console.log("body", body);
  fetch("/newDoc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body
  })
    .then(resp => resp.json())
    .then(data => {
      if (data.success) {
        getDocuments(dbName, colName);
        getCollections(dbName);
      }
    });
};

if (documentWorkDeskForm)
  documentWorkDeskForm.addEventListener("submit", evt => {
    console.log("llego");
    evt.preventDefault();

    if (!isUpdate) {
      if (contextData["dbName"] && contextData["collectionName"]) {
        if (
          newJsonDocumentInput.value.replace(/\s\s*/g, "").trim() &&
          validateJson(newJsonDocumentInput.value)
        ) {
          createDocument(
            contextData["dbName"],
            contextData["collectionName"],
            newJsonDocumentInput.value
          );
        }
      }
    }
  });

if (newJsonDocumentInput)
  newJsonDocumentInput.addEventListener("input", () => {
    if (contextData["dbName"] && contextData["collectionName"]) {
      jsonPreviewField.innerText = newJsonDocumentInput.value.replace(
        /,/g,
        ", \n"
      );
      jsonPreviewField.style.color = validateJson(newJsonDocumentInput.value)
        ? "green"
        : "red";
      PR.prettyPrint();
      if (
        newJsonDocumentInput.value.replace(/\s\s*/g, "").trim() &&
        validateJson(newJsonDocumentInput.value)
      ) {
        newJsonDocumentButton.disabled = false;
      } else {
        newJsonDocumentButton.disabled = true;
      }
    }
  });

const deleteDocument = doc => {
  if (contextData["dbName"] && contextData["collectionName"]) {
    let body = {
      dbName: contextData["dbName"],
      colName: contextData["collectionName"],
      document: doc,
      url: contextData["url"]
    };
    console.log("update", doc);
    fetch("/delDoc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.success) {
          getDocuments(contextData["dbName"], contextData["collectionName"]);
          getCollections(contextData["dbName"]);
        }
      });
  }
};

const updateDocument = (doc, secondDoc) => {
  if (secondDoc) {
    if (contextData["dbName"] && contextData["collectionName"]) {
      console.log("update", doc);

      let body = {
        dbName: contextData["dbName"],
        colName: contextData["collectionName"],
        prevDoc: secondDoc,
        newDoc: doc,
        url: contextData["url"]
      };

      fetch("/updateDoc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
        .then(resp => resp.json())
        .then(data => {
          if (data.success) {
            getDocuments(contextData["dbName"], contextData["collectionName"]);
            getCollections(contextData["dbName"]);
          }
        });
    }
  } else {
    document.querySelectorAll(".optionDocument").forEach(option => {
      option.className = option.className.includes("show")
        ? "optionDocument collapse"
        : "optionDocument collapse show";
    });
    contextData["docUpdate"] = { ...doc };
    delete doc["_id"];
    updateJsonDocumentInput.value = JSON.stringify(doc);
    updateJsonDocumentInput.focus();

    jsonPreviewUpdate.innerText = updateJsonDocumentInput.value.replace(
      /,/g,
      ", \n"
    );
    jsonPreviewUpdate.style.color = validateJson(updateJsonDocumentInput.value)
      ? "green"
      : "red";
  }
};

const getDocuments = (dbName, collectionName) => {
  fetch(
    `/documents/${contextData["url"] ||
      "default_y22__y1237"}/?dbname=${dbName}&colname=${collectionName}`
  )
    .then(res => res.json())
    .then(data => {
      if (data && data.success) {
        containerDocuments.innerHTML = "";
        contextData = { dbName: dbName, collectionName: collectionName };
        jsonPreviewField.innerText = `{\n"${"text_attr"}": "example_val",\n "${"number_attr"}": 12, \n "${"array_attr"}": ["a", 2, {}]\n}`;
        jsonPreviewField.style.color = "green";
        containerDocumentWorker.className = "card";
        if (data.documents && data.documents.length) {
          data.documents.forEach((doc, index) => {
            let element = document.createElement("div");
            element.className = "card";
            let textHTML = `
            <div class="card-header" id="heading${index}">
  <h2 class="mb-0">
    <button
      class="btn btn-link"
      type="button"
      data-toggle="collapse"
      data-target="#collapse${index}"
      aria-expanded="true"
      aria-controls="collapse${index}"
    >
      id: ${doc._id}
    </button>
  </h2>
</div>

<div
  id="collapse${index}"
  class="collapse"
  aria-labelledby="heading${index}"
  data-parent="#containerDocuments"
>
  <div class="card-body">
    <div class="container">
        <div class="row">
          <div class="col-6" id="deleteDocumentButtonContainer${doc._id}">
            
          </div>
          <div class="col-6" id="updateDocumentButtonContainer${doc._id}">
            
          </div>
        </div>
        <hr>
        <div class="row">
          <div class="col-12">
            <pre class="prettyprint" style="border: none;">
        <code class="languaje-javascript linenums">
${JSON.stringify(doc).replace(/,/g, ", \n")}
          </code>
      </pre>
          </div>
        </div>
    </div>
  </div>
</div>

            `;
            element.innerHTML = textHTML;
            containerDocuments.appendChild(element);

            let buttonDel = document.createElement("button");
            buttonDel.className = "btn btn-danger";
            buttonDel.innerText = "Deleteg";
            buttonDel.addEventListener("click", () => deleteDocument(doc));

            let buttonUpdate = document.createElement("button");
            buttonUpdate.className = "btn btn-warning";
            buttonUpdate.innerText = "Updateg";
            buttonUpdate.addEventListener("click", () => updateDocument(doc));

            document
              .querySelector(`#deleteDocumentButtonContainer${doc._id}`)
              .appendChild(buttonDel);
            document
              .querySelector(`#updateDocumentButtonContainer${doc._id}`)
              .appendChild(buttonUpdate);
          });
          PR.prettyPrint();
        }
      }
    });
};

if (collections)
  collections.forEach(collection => {
    collection.addEventListener("click", () => {
      let dbName = collection.dataset.dbname;
      let colName = collection.dataset.colname;
      console.log({ dbName: dbName, colName: colName });
      getDocuments(dbName, colName);
    });
  });
else console.log("no hay collecciones", collections);

if (connectForm)
  connectForm.addEventListener("submit", evt => {
    evt.preventDefault();
    let url = urlselector.value.replace(/\s\s*/g, "").trim();
    console.log("url", url);
    if (url && url.length) {
      fetch(`/connect/${url}`)
        .then(res => res.json())
        .then(data => {
          stepsContainer.className = "col-md-4 second";

          stepReady.style.color = "yellow";
          stepConnected.style.color = "yellow";
          stepAuth.style.color = "yellow";

          //volver

          console.log("data", data);
          if (data && data.success) {
            stepReady.innerHTML = "<i class='fas fa-check'></i> Ready";
            stepConnected.innerHTML = "<i class='fas fa-check'></i> Connected";
            stepAuth.innerHTML = "<i class='fas fa-check'></i> Authenticated";

            stepReady.style.color = "green";
            stepConnected.style.color = "green";
            stepAuth.style.color = "green";

            dbSelector.innerHTML = "";
            contextData["url"] = url;
            if (data.databases && data.databases) {
              data.databases.forEach(db => {
                let dbOp = document.createElement("option");
                dbOp.innerHTML = db["name"];
                dbOp.value = db["name"];
                dbSelector.appendChild(dbOp);
              });
            } else {
              let dbOp = document.createElement("option");
              dbOp.value = "No databases";
              dbOp.innerHTML = "No databases";
              dbSelector.appendChild(dbOp);
            }
          } else if (data.error) {
            if (data.error.name && data.error.name == "MongoParseError") {
              stepReady.innerHTML = "<i class='fas fa-times'></i> Ready";
              stepConnected.innerHTML =
                "<i class='fas fa-clock'></i> Connected";
              stepAuth.innerHTML = "<i class='fas fa-clock'></i> Authenticated";

              stepReady.style.color = "red";
              stepConnected.style.color = "yellow";
              stepAuth.style.color = "yellow";
            } else if (
              data.error.name &&
              data.error.name == "MongoNetworkError"
            ) {
              stepReady.innerHTML = "<i class='fas fa-check'></i> Ready";
              stepConnected.innerHTML =
                "<i class='fas fa-check'></i> Connected";
              stepAuth.innerHTML = "<i class='fas fa-times'></i> Authenticated";

              stepReady.style.color = "green";
              stepConnected.style.color = "green";
              stepAuth.style.color = "red";
            } else if (data.error.errno && data.error.errno == "ENOTFOUND") {
              stepReady.innerHTML = "<i class='fas fa-check'></i> Ready";
              stepConnected.innerHTML =
                "<i class='fas fa-times'></i> Connected";
              stepAuth.innerHTML = "<i class='fas fa-clock'></i> Authenticated";

              stepReady.style.color = "green";
              stepConnected.style.color = "red";
              stepAuth.style.color = "yellow";
            }

            console.log(
              "error",
              data.error.name || data.error.errno || JSON.stringify(data.error)
            );
          } else console.log("error desconocido", data);
        });
    }
  });

const getCollections = dbName => {
  containerCollections.innerHTML = "";
  fetch(
    `/collections/${contextData["url"] ||
      "default_y22__y1237"}/?dbname=${dbName}`
  )
    .then(res => res.json())
    .then(data => {
      console.log("data", data);
      if (data && data.success) {
        if (data.collections && data.collections.length) {
          data.collections.forEach(collection => {
            let element = document.createElement("div");
            element.className = "row";
            element.innerHTML = `
                    <div class="col-12">
                      <div class="card collectionCard">
                        <div class="card-body">
                          <h5 class="card-title">
                            ${collection.name} collection
                          </h5>
                          <h6 class="card-subtitle mb-2 text-muted">
                            ${collection.stats.count} documents
                          </h6>
                          <p class="card-text">
                            col. size: ${collection.stats.size} Bytes <br />
                            avg. doc. size: ${collection.stats.avgObjSize}
                            Bytes<br />
                            size in storage: ${collection.stats.storageSize}
                            Bytes<br />
                          </p>
                        </div>
                        <div class="card-footer">
                          <a>See documents</a>
                        </div>
                      </div>
                    </div>
              `;
            element.addEventListener("click", () => {
              let dbName = collection.stats.ns.split(".")[0];
              let colName = collection.stats.ns.split(".")[1];

              getDocuments(dbName, colName);
            });
            containerCollections.appendChild(element);
          });
        }
      }
    });
};

if (dbSelector)
  dbSelector.addEventListener("change", evt => {
    if (evt.target.value) getCollections(evt.target.value);
  });
