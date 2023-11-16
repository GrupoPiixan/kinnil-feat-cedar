require('dotenv').config();

// * Arrancamos el servidor
const Server = require('./src/controllers/serverCtrl');
const server = new Server();

server.listen();