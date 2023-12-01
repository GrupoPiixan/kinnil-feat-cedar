// * Ctrl
const { iotCoreServer, socketServer } = require('../controllers/iotCoreCtrl');

// * Correr el servicio de AWS IoT Core
iotCoreServer();

// * Correr el servidor de socket.io
socketServer.listen(process.env.PORTSOCKETIO, () => {
    console.log(`Servidor de socket.io corriendo en el puerto ${process.env.PORTSOCKETIO}`);
});