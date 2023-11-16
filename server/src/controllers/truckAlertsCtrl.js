const cron = require('node-cron');
const moment = require('moment');

const request = require('request');

const firebase = require('../database/config');
const { botStart } = require('./telegramBot');

console.log('Iniciando servicio de alertas');

let bot = null;

// * Constantes de los tiempos de los estados
const Pausa = 3;
const Apagado = 5;
const Ignorar = 10;

// * Variable que tendrá los id's de los chats de telegram
let chatsTelegram = [];
let chatsSendTelegram = [];

//* Variable que tendrá los números de teléfonos de los usuarios
let phonesUsers = [];
let phonesSendUsers = [];

const initBot = async () => {
    bot = await botStart();
}
initBot();

// * Cron que se ejecuta cada minuto
cron.schedule('* * * * *', () => updateStatusTruck());

exports.saveDataTrucks = async (data, conf) => {
    // * Eliminamos los campos de la configuracion que no usaremos
    delete conf.status;
    delete conf.configVersion;
    delete conf.IDSensor;
    // * Ciclamos el array de datos del quectel
    for (let index = 0; index < data.length; index++) {
        // * Asignamos una fecha de tipo moment y tambien asignamos la configuracion
        data[index].creacionRegistroMoment = new moment();
        data[index].config = conf;
        // * Intentamos guardar la información en la colección
        try {
            // * Si el registro no existe, se guarda y si ya existe, se actualiza completamente
            console.log('Guardando datos del quectel ' + data[index].id + ' para alertas del camión');
            await firebase.db.collection("datosAlertas").doc(data[index].id).set(data[index]);
        } catch (error) {
            // * Error al guardar los datos
            console.log('Error al guardar los datos del camion para alertas');
        }
    }
};

// * Método que se ejecutara cada minuto para actualizar el estado de los camiones
const updateStatusTruck = async () => {
    try {
        // * Obtenemos los datos del quectel para alertas
        const data = await firebase.db.collection('datosAlertas').get();
        // * Si existen datos los ciclamos
        if (!data.empty) {
            data.forEach(async (doc) => {
                try {
                    // * Igualamos la información del documento a una variable
                    const dataTruck = doc.data();
                    // * Obtenemos la fecha en formato timestime y la convertimos a fecha de moment
                    const dateCreate = moment.unix(dataTruck.creacionRegistroMoment._seconds).format('YYYY-MM-DD HH:mm:ss');
                    // * Obtenemos los minutos entre dos fechas dadas
                    var duration = new moment().diff(dateCreate, 'minutes');

                    // TODO: a2 es la temperatura, a1 es la presión

                    // ! Código para probar las alertas
                    // dataTruck.config.temperaturaMax = 200;
                    // dataTruck.a1 = 500;
                    // checkDataForAlerts(dataTruck);

                    // * Si el tiempo guardado en la BD es mayor a 30 minutos lo ponemos "En Pausa" y si es más de 60 lo ponemos "Apagado"
                    if (duration >= Pausa && duration < Apagado) {
                        console.log('Actualizar estatus a "En Pausa" del quectel ' + dataTruck.id);
                        // * Actualizamos el estado del quectel que se mostrara en el dashboard
                        await updateStatusQuectel(dataTruck.id, 'En Pausa');
                        await doc.ref.update({
                            estatus: 'En Pausa'
                        });
                    } else if (duration >= Apagado) {
                        // * Si el lapso de tiempo ya supera los 70 minutos, ya no actualizamos el estado del quectel
                        if (duration <= Ignorar) {
                            console.log('Actualizar estatus a "Apagado" del quectel ' + dataTruck.id);
                            // * Actualizamos el estado del quectel que se mostrara en el dashboard
                            await updateStatusQuectel(dataTruck.id, 'Apagado');
                            await doc.ref.update({
                                estatus: 'Apagado'
                            });
                        } else {
                            console.log('Quectel ' + dataTruck.id + ' supero los ' + Ignorar + ' minutos, no se actualiza el estatus quedando como "Apagado"');
                        }

                        // * Si la temperatura y presión son mayores a los setPoint's esta activo, si estos están por debajo esta inactivo
                    } else if (dataTruck.a2 > dataTruck.config.setPointTemperatura || dataTruck.a1 > dataTruck.config.setPointPresion) {
                        console.log('Actualizar estatus a "Activo" del quectel ' + dataTruck.id);
                        // * Mandamos la información a verificar para detonar alertas asincronamente
                        checkDataForAlerts(dataTruck);
                        await updateStatusQuectel(dataTruck.id, 'Activo');
                        await doc.ref.update({
                            estatus: 'Activo'
                        });
                    } else if (dataTruck.a2 < dataTruck.config.setPointTemperatura || dataTruck.a1 < dataTruck.config.setPointPresion) {
                        console.log('Actualizar estatus a "Inactivo" del quectel ' + dataTruck.id);
                        // * Mandamos la información a verificar para detonar alertas asincronamente
                        checkDataForAlerts(dataTruck);
                        await updateStatusQuectel(dataTruck.id, 'Inactivo');
                        await doc.ref.update({
                            estatus: 'Inactivo'
                        });
                    }
                } catch (error) {
                    // * Error al actualizar el estatus del camion
                    console.log('Error al actualizar el estado del camion para alertas');
                }
            });
        } else {
            // * No existen datos
            console.log('No existen datos para actualizar');
        }
    } catch (error) {
        console.log('Error al consultar los datos para actualizar el estado de los camiones');
    }
}

// * Método que actualiza el estado del quectel que se mostrara en el dashboard
const updateStatusQuectel = async (IDSensor, status) => {
    const dataQuectel = await firebase.db.collection('quectel').where('id', '==', IDSensor).orderBy('creacionRegistro', 'desc').limit(1).get();
    dataQuectel.forEach(async (docQuectel) => {
        docQuectel.ref.update({
            estatus: status
        });
    });
};

// * Obtenemos los correos de los usuarios administradores para enviar los correos de alertas (se pide al iniciar el server y cuando un admin se actualice)
firebase.db.collection('usuarios').where('activo', '==', true).where('notifications', '==', true).onSnapshot(async (snapshot) => {
    chatsTelegram = [];
    phonesUsers = [];
    snapshot.forEach(async (doc) => {
        const data = doc.data();
        if (data.telegramChatId !== undefined && data.telegramChatId !== null) chatsTelegram.push(data.telegramChatId);
        if (data.telephone !== undefined && data.telephone !== null && data.telephone) phonesUsers.push(`${data.telephone}`);
    });
});

// * Método para verificar las alertas y avisar a los usuarios
const checkDataForAlerts = async (dataTruck) => {
    console.log(`*-*-*-*-*-*-*-*-*-*- ${dataTruck.id} -*-*-*-*-*-*-*-*-*-*`);
    const tolerancePercentage = 0;

    /*console.log('Temperatura mínima: ', (dataTruck.a2 < (dataTruck.config.temperaturaMin - (dataTruck.config.temperaturaMin * (tolerancePercentage / 100)))), dataTruck.a2, '<', (dataTruck.config.temperaturaMin - (dataTruck.config.temperaturaMin * (tolerancePercentage / 100))));
    if (dataTruck.a2 < (dataTruck.config.temperaturaMin - (dataTruck.config.temperaturaMin * (tolerancePercentage / 100)))) {
        console.log('Alerta de temperatura mínima superada');
        sendTelegramAlert('La temperatura mínima del equipo ' + dataTruck.config.nombreCamion + ' con el KinnilID: ' + dataTruck.id + ' es: ' + dataTruck.a2.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + '°C', `tempMin_${dataTruck.id}`);

        for (let i = 0; i < phonesUsers.length; i++) {
            const element = phonesUsers[i];
            await sendSMSAlert(element, 'La temperatura mínima del equipo ' + dataTruck.config.nombreCamion + ' con el KinnilID: ' + dataTruck.id + ' es: ' + dataTruck.a2.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + '°C', `tempMin_${dataTruck.id}`);
        }
    } else {
        deleteForSendAlert(`tempMin_${dataTruck.id}`);
        deleteForSendAlertSMS(`tempMin_${dataTruck.id}`);
    }

    console.log('Temperatura máxima: ', (dataTruck.a2 > (dataTruck.config.temperaturaMax + (dataTruck.config.temperaturaMax * (tolerancePercentage / 100)))), dataTruck.a2, '>', (dataTruck.config.temperaturaMax + (dataTruck.config.temperaturaMax * (tolerancePercentage / 100))));
    if (dataTruck.a2 > (dataTruck.config.temperaturaMax + (dataTruck.config.temperaturaMax * (tolerancePercentage / 100)))) {
        console.log('Alerta de temperatura máxima superada');
        sendTelegramAlert('La temperatura máxima del equipo ' + dataTruck.config.nombreCamion + ' con el KinnilID: ' + dataTruck.id + ' es: ' + dataTruck.a2.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + '°C', `tempMax_${dataTruck.id}`);

        for (let i = 0; i < phonesUsers.length; i++) {
            const element = phonesUsers[i];
            await sendSMSAlert(element, 'La temperatura máxima del equipo ' + dataTruck.config.nombreCamion + ' con el KinnilID: ' + dataTruck.id + ' es: ' + dataTruck.a2.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + '°C', `tempMax_${dataTruck.id}`);
        }
    } else {
        deleteForSendAlert(`tempMax_${dataTruck.id}`);
        deleteForSendAlertSMS(`tempMax_${dataTruck.id}`);
    }*/

    console.log('Presión mínima: ', (dataTruck.a1 < (dataTruck.config.presionMin - (dataTruck.config.presionMin * (tolerancePercentage / 100)))), dataTruck.a1, '<', (dataTruck.config.presionMin - (dataTruck.config.presionMin * (tolerancePercentage / 100))));
    if (dataTruck.a1 < (dataTruck.config.presionMin - (dataTruck.config.presionMin * (tolerancePercentage / 100)))) {
        console.log('Alerta de presión mínima superada');
        sendTelegramAlert('La presión mínima del equipo ' + dataTruck.config.nombreCamion + ' con el KinnilID: ' + dataTruck.id + ' es: ' + dataTruck.a1.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + 'Psi', `presMin_${dataTruck.id}`);

        for (let i = 0; i < phonesUsers.length; i++) {
            const element = phonesUsers[i];
            await sendSMSAlert(element, 'La presión mínima del equipo ' + dataTruck.config.nombreCamion + ' con el KinnilID: ' + dataTruck.id + ' es: ' + dataTruck.a1.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + 'Psi', `presMin_${dataTruck.id}`);
        }
    } else {
        deleteForSendAlert(`presMin_${dataTruck.id}`);
        deleteForSendAlertSMS(`presMin_${dataTruck.id}`);
    }

    console.log('Presión máxima: ', (dataTruck.a1 > (dataTruck.config.presionMax + (dataTruck.config.presionMax * (tolerancePercentage / 100)))), dataTruck.a1, '>', (dataTruck.config.presionMax + (dataTruck.config.presionMax * (tolerancePercentage / 100))));
    if (dataTruck.a1 > (dataTruck.config.presionMax + (dataTruck.config.presionMax * (tolerancePercentage / 100)))) {
        console.log('Alerta de presión máxima superada');
        sendTelegramAlert('La presión máxima del equipo ' + dataTruck.config.nombreCamion + ' con el KinnilID: ' + dataTruck.id + ' es: ' + dataTruck.a1.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + 'Psi', `presMax_${dataTruck.id}`);

        for (let i = 0; i < phonesUsers.length; i++) {
            const element = phonesUsers[i];
            await sendSMSAlert(element, 'La presión máxima del equipo ' + dataTruck.config.nombreCamion + ' con el KinnilID: ' + dataTruck.id + ' es: ' + dataTruck.a1.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + 'Psi', `presMax_${dataTruck.id}`);
        }
    } else {
        deleteForSendAlert(`presMax_${dataTruck.id}`);
        deleteForSendAlertSMS(`presMax_${dataTruck.id}`);
    }

    console.log('Presión pico: ', (dataTruck.m1 >= (dataTruck.config.presionMax + (dataTruck.config.presionMax * (tolerancePercentage / 100)))), dataTruck.m1, '>=', (dataTruck.config.presionMax + (dataTruck.config.presionMax * (tolerancePercentage / 100))));
    if (dataTruck.m1 > (dataTruck.config.presionMax + (dataTruck.config.presionMax * (tolerancePercentage / 100)))) {
        console.log('Alerta de presión supero el pico máximo');
        sendTelegramAlert('La presión del equipo ' + dataTruck.config.nombreCamion + ' con el KinnilID: ' + dataTruck.id + ' supero el pico con: ' + dataTruck.m1.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + 'Psi', `picoMax_${dataTruck.id}`);

        for (let i = 0; i < phonesUsers.length; i++) {
            const element = phonesUsers[i];
            await sendSMSAlert(element, 'La presión del equipo ' + dataTruck.config.nombreCamion + ' con el KinnilID: ' + dataTruck.id + ' supero el pico con: ' + dataTruck.m1.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,') + 'Psi', `picoMax_${dataTruck.id}`);
        }

    } else {
        deleteForSendAlert(`picoMax_${dataTruck.id}`);
        deleteForSendAlertSMS(`picoMax_${dataTruck.id}`);
    }

    // * Spacer to kinnil's
    for (let i = 0; i < Array(5).length; i++) console.log('');
};

const sendTelegramAlert = (msg, key) => {
    try {
        for (let i = 0; i < chatsTelegram.length; i++) {
            if (chatsSendTelegram.find(element => element === `${key}_${chatsTelegram[i]}`) === undefined) {
                bot.telegram.sendMessage(chatsTelegram[i], msg);
                chatsSendTelegram.push(`${key}_${chatsTelegram[i]}`);
                console.log(`Run Send: ${key}_${chatsTelegram[i]} - `, chatsSendTelegram);
            }
        }
    
        console.log('Show data_send - ', key, chatsSendTelegram);
    } catch (error) {
        console.log('Error sendTelegramAlert: ', error);
    }
}

const sendSMSAlert = async (numero, msg, key) => {

    let sendToRequest = false;

    var options = {
        'method': 'POST',
        'url': 'https://api.labsmobile.com/json/send',
        'headers': {
            'Content-Type': 'application/json',
            'Authorization': 'Basic Z2VzdGlvbkBncGlpeGFuLmNvbTpYczQ1T0pkejNTblBRdTlQTERKMmdOa2Zhb2ZPa2o0OQ=='
        },
        body: JSON.stringify({
            "message": `${msg}`,
            "tpoa": "Sender",
            "recipient": [{ msisdn: numero }],
        })
    };

    if (phonesSendUsers.find(element => element === `${key}_${numero}`) === undefined) {
        
        console.log(`Enviando alerta a: ${numero}`);

        if (!sendToRequest) {
            try {
                await fetch(options.url, {
                    method: options.method,
                    headers: options.headers,
                    body: options.body
                });
            } catch (error) {
                console.log('Error SMS fetch: ', error);
                sendToRequest = true;
            }
        }
        
        if (sendToRequest) {
            try {
                request(options, function (error, response) {
                    if (error) throw new Error(error);
                });
            } catch (err) {
                console.log("Error SMS request: ", err);
            }
        }

        phonesSendUsers.push(`${key}_${numero}`);
        console.log(`Run Send: ${key}_${numero} - `, phonesSendUsers);
    }

    console.log('Show data_send_sms - ', key, phonesSendUsers);
}

const deleteForSendAlert = (key) => {
    try {
        for (let i = 0; i < chatsTelegram.length; i++) {
            const index = chatsSendTelegram.indexOf(`${key}_${chatsTelegram[i]}`);
            if (index > -1) {
                chatsSendTelegram.splice(index, 1);
                console.log(`Run Delete: ${key}_${chatsTelegram[i]} - `, chatsSendTelegram);
            }
        }
    
        console.log('Show data_delete - ', key, chatsSendTelegram);
    } catch (error) {
        console.log('Error deleteForSendAlert: ', error);
    }
};

const deleteForSendAlertSMS = (key) => {
    try {
        for (let i = 0; i < phonesUsers.length; i++) {
            const index = phonesSendUsers.indexOf(`${key}_${phonesUsers[i]}`);
            if (index > -1) {
                phonesSendUsers.splice(index, 1);
                console.log(`Run Delete: ${key}_${phonesUsers[i]} - `, phonesSendUsers);
            }
        }
    
        console.log('Show data_delete_sms - ', key, phonesSendUsers);
    } catch (error) {
        console.log('Error deleteForSendAlertSMS: ', error);
    }
};

/*
For send email
let dataEmail = {
    from: '',
    recipients: admins,
    subject: '',
    message: ''
};

console.log('Alerta de temperatura minima superada');
dataEmail.from = 'Alerta de temperatura minima alcanzada';
dataEmail.subject = 'Alerta de temperatura minima alcanzada en el camion con el Kinnil ID: ' + dataTruck.id;
dataEmail.message = 'La temperatura minima fue alcanzada en el camion con el Kinnil ID: ' + dataTruck.id + ' es: ' + dataTruck.a1 + '°C';
await sendEmail(dataEmail);

*/