// * Ctrl
const { socketServer, io } = require('../controllers/socketCtrl');

// * Correr el servidor de socket.io
socketServer.listen(process.env.PORTSOCKETIO, () => {
    console.log(`Servidor de socket.io corriendo en el puerto ${process.env.PORTSOCKETIO}`);
});

/*setInterval(() => {
    io.emit('server_to_webs', { idClipboard: '00001', string: 'server to client', bool: true, number: 1, array: [1, 2, 3], object: { a: 1, b: 2, c: 3 }, date: new Date() });
}, 1000);*/
