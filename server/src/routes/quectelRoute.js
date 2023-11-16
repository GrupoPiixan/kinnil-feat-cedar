const { Router } = require('express');

// * Ctrl
const { socketQuectel } = require('../controllers/quectelCtrl');

const router = Router();

// * Correr el socket para escuchar los datos del quectel
socketQuectel.listen(process.env.PORTQUECTEL, function () {
    console.log(`La comunicación con Quectel BG96 se encuentra en el puerto ${process.env.PORTQUECTEL}`);
});

module.exports = router;