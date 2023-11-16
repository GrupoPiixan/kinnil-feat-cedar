const net = require('net'); // Sockets de tcp

// * Validaciones
const { validateTramaArray, validateDataTrama } = require('../middlewares/validateQuectel');

// * Modelo de datos del quectel
const { saveDataQuectelArray, getConfigQuectel } = require('../models/quectelModel');

// * Socket de comunicacion para resivir datos del quectel
const socketQuectel = net.createServer(function (socket) {
    // * Socket para errores de conexion
    socket.on('error', (err) => {
      console.log('Hubo un error en la conexión');
      socket.write(JSON.stringify({sts: "error"}));
    });

    // * Socket para trabajar con los datos recibidos
    socket.on('data', async (data) => confirmDataTrama(data, socket));
});

// * Metodo para saber que hacer con la trama recibida
async function confirmDataTrama(data, socket) {
  try {
    // * Formateamos la trama inicial a JSON
    const initialTrama = await JSON.parse(data.toString('utf-8'));
    // * Validamos la trama inicial
    const validate = validateDataTrama(initialTrama);
    // * Si la trama inicial es valida
    if (!validate.error) {
      // * Obtenemos la configuracion del quectel o guardamos la trama en la base de datos
      switch (initialTrama.optn) {
        case 'conf':
          getConfig(initialTrama.data, socket);
          break;
        case 'sens':
          saveData(initialTrama, socket);
          break;
        default:
          console.log('Error -> La opción no es válida');
          socket.write(JSON.stringify({sts: "error"}));
          break;
      }
    } else {
      socket.write(JSON.stringify(validate.response));
    }
  } catch (error) {
    console.log('Error -> La trama no es un objeto JSON: ', error);
    socket.write(JSON.stringify({sts: "error"}));
  }
}

// * Metodo para mandar la configuracion al quectel
async function getConfig(dataTrama, socket) {
  // * Obtener la configuracion para el quectel
  const config = await getConfigQuectel(dataTrama);
  socket.write(JSON.stringify(config));
}

// * Metodo para guardar la trama en la base de datos
async function saveData(dataTrama, socket) {
  // * Validacion de trama
  const errValidation = validateTramaArray(dataTrama.data);
  // * Imprimimos la información extra
  console.log('Información extra -> ', dataTrama.xtra);
  // * Si la trama es valida
  if (!errValidation.error) {
    // * Guardar datos en la base de datos
    const saveData = await saveDataQuectelArray(dataTrama.data);
    socket.write(JSON.stringify(saveData));
  } else {
    socket.write(JSON.stringify(errValidation.response));
  }
}

module.exports = {
  socketQuectel
}
