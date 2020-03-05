const dbSelector = document.querySelector("#databasesSelector");

const getCollections = dbName => {
  return fetch(`/collections?dbName=${dbName}`).then(res => res.json());
};

if (dbSelector)
  dbSelector.addEventListener("change", evt => {
    if (evt.target.value)
      getCollections.then(collections => {
        if (collections && collections.lenght) {
          const element = document.createElement("select");
          collections.forEach(collection => {
              const option = document.createElement("option");
              option.value = 
          });
        }
      });
  });
