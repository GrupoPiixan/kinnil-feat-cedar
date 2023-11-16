const express = require('express');
const app = express();
const { createServer } = require('http');
const socketServer = createServer(app);
const { Server } = require("socket.io");
const io = new Server(socketServer, {
    cors: {
        origin: '*',
    },
});

// * Método para escuchar las conexiones de los clientes
io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    // * Método para escuchar los mensajes de los clientes
    socket.on('web_to_server', web_to_server);

    // * Método para escuchar los mensajes de las tablillas
    socket.on('board_to_server', board_to_server);
});

// * Método para escuchar las desconexiones de los clientes
io.on('disconnect', () => {
    console.log('user disconnected', socket.id);
});

function web_to_server(message) {
    console.log('web_to_server: ', message);
    // * Notificar a todas las tablillas conectadas
    io.emit('server_to_boards', message);
}

function board_to_server(message) {
    console.log('board_to_server: ', message);
    // * Notificar a todas las web conectadas
    io.emit('server_to_webs', message);
}

module.exports = {
    socketServer,
    io
}