# Mongo explorer: for my web-dev class 🤓

Hi! This is a small project that tries to implement some features for exploring databases on Mongo, ¡like a bad version of atlas! 😅. Below, I'll show you how to run the project locally and where it's being run.

# Steps

1. Have installed Node and npm
   ```sh
   $ npm --version
   $ node --version
   ```
   if you don't have any of these, you can install it by following this link 👉🏻 [nodejs.org](https://nodejs.org/)
2. Clone repository

   ```sh
   $ git clone https://github.com/whatevercamps/mongo-explorer.git
   $ cd mongo-explorer
   ```

3. Install dependencies

   ```sh
   $ npm install
   ```

4. Set enviroment variables
   In order to get connected to a real mongo database, you will have to create a file into project folder, call it **.env** and write this...

   ```sh
   dbHostName=<valid database host e.g: localhost>
   dbName=<valid database name e.g: maindb>
   dbUser=<valid database admin user e.g:admin>
   dbPassword=<valid database admin password e.g:admin_password>
   ```

   save it and... that's it!

5. Run the project 🎉
   ```sh
   npm start
   ```
   The current port where server are running is the **:3000** port, but you can change it by going to node-explorer/bin/www file and modifying "3000" in this line ... `sh var port = normalizePort(process.env.PORT || "3000");`

# Demo

The funcional demo was deployed using Heroku and you can find it clicking that 👉🏻 [demo](https://whata-mongo-explorer.herokuapp.com/databases)

# To-dos (for pull requests ❤️)

- Make a nice filter
- Random path and credentials generator (for ethical purposes 🤓)
- Document code

## License

MIT
**Free Software, Hell Yeah!**
