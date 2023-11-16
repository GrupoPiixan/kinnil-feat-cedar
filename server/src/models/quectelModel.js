const firebase = require('../database/config');

// * Controlador para alertas
const { saveDataTrucks } = require('../controllers/truckAlertsCtrl');

// * Metodos de conversion
const {
    convertBitsToTemperature,
    convertBitsToPressure,
    convertTemperatureToBits,
    convertPressureToBits,
    convertMilliamperesToRealValueA1,
    convertMilliamperesToRealValueA2
} = require('../middlewares/convertDataQuectel');

// * Metodo que guarda los datos mandados desde el quectel
const saveDataQuectel = async (data) => {
    data.creacionRegistro = new Date();
    try {
        // * Se manda a guardar los datos en la coleccion quectel
        await firebase.db.collection('quectel').add(data);
        console.log('Success -> Registro guardado en firebase');
        return {
            sts: "rsv",
            cver: await getVersionConfigQuectel(data.id),
        };
    } catch (error) {
        // * Error al guardar los datos
        console.log('Error -> El registro no se pudo guardar');
        return {
            sts: "error"
        };
    }
};

// * Metodo que guarda los arrays de datos mandados desde el quectel
exports.saveDataQuectelArray = async (data) => {
    let idQuectel = 0;

    // * Ciclamos el array de tramas
    for (let index = 0; index < data.arrSens.length; index++) {
        // ? Ver como obtener la fecha correctamente (si se empieza a usar Redis)
        data.arrSens[index].creacionRegistro = new Date();
        data.arrSens[index].estatus = await getStatusQuectel(data.arrSens[index].id);

        // TODO: Se imprimen los datos crudos
        console.log('Datos crudos sensores -> ', `a1: ${data.arrSens[index].a1}`, `a2: ${data.arrSens[index].a2}`);
        console.log('Datos crudos picos -> ', `m1: ${data.arrSens[index].m1}`, `m2: ${data.arrSens[index].m2}`);

        // * Se mandan a convertir los bits para tener los datos correctos de presión y temperatura
        // const temperature = await convertBitsToTemperature(data.arrSens[index].a1);
        // * Limitamos la cantidad de decimales a 2 de la temperatura
        // data.arrSens[index].a1 = parseFloat(temperature.toFixed(2));

        data.arrSens[index].a1 = convertMilliamperesToRealValueA1(data.arrSens[index].a1);
        data.arrSens[index].a2 = convertMilliamperesToRealValueA2(data.arrSens[index].a2);

        data.arrSens[index].m1 = convertMilliamperesToRealValueA1(data.arrSens[index].m1);
        data.arrSens[index].m2 = convertMilliamperesToRealValueA2(data.arrSens[index].m2);

        try {
            console.log('Datos a guardar: ', new Date().toLocaleString(), data.arrSens[index]);
            // * Se manda a guardar los datos en la colección quectel
            await firebase.db.collection('quectel').add(data.arrSens[index]);
            idQuectel = data.arrSens[index].id;
            console.log('Success -> Registro N°' + (index + 1) + ' guardado en firebase');
        } catch (error) {
            // * Error al guardar los datos
            console.log('Error -> El registro no se pudo guardar');
            return {
                sts: "error"
            };
        }
    }

    // * Se manda a guardar la información del camion en local asincronamente
    saveDataTrucks(data.arrSens, await getConfigForAlerts(idQuectel));

    return {
        sts: "rsv",
        cver: await getVersionConfigQuectel(idQuectel),
    };
};

// * Metodo para obtener la configuración para el quectel
exports.getConfigQuectel = async (IDSensor) => {
    try {
        // * Se obtiene la configuracion del quectel
        const config = await firebase.db.collection('camiones').where('IDSensor', '==', IDSensor).limit(1).get();

        // * Verifica si existe el camion con el IDSensor mandado
        if (config.empty) {
            console.log('Error -> No se encontró camión para sacar la configuración del sensor');
            return {
                sts: "error"
            };
        } else {
            console.log('Success -> Configuración obtenida correctamente');
            const response = {
                sts: "rsv",
                cver: config.docs[0].data().configVersion,

                IDSensor: config.docs[0].data().IDSensor,
                enOperacion: config.docs[0].data().lOperacion,
                setPointPresion: await convertPressureToBits(config.docs[0].data().pSPoint),
                enDetenido: (config.docs[0].data().lDetenido) * 60,
                setPointTemperatura: await convertTemperatureToBits(config.docs[0].data().tSPoint)
            };
            console.log('Configuracion: ', response);
            return response;
        }
    } catch (error) {
        // * Error al obtener la configuracion
        console.log('Error -> No se pudo obtener la configuración');
        return {
            response: {
                sts: "error"
            }
        };
    }
};

// * Metodo para obtener la version de configuración para el quectel
const getVersionConfigQuectel = async (IDSensor) => {
    try {
        // * Se obtiene la configuracion del quectel
        const config = await firebase.db.collection('camiones').where('IDSensor', '==', IDSensor).limit(1).get();

        // * Verifica si existe el camion con el IDSensor mandado
        if (config.empty) {
            console.log('Error -> No se encontró camión para sacar la versión de la configuración del sensor');
            return "error";
        } else {
            console.log('Success -> Versión de configuración obtenida correctamente');
            // * Se retorna la version de configuración
            return config.docs[0].data().configVersion;
        }
    } catch (error) {
        // * Error al obtener la configuracion
        console.log('Error -> No se pudo obtener la versión de la configuración');
        return "error";
    }
};

// * Metodo para obtener la configuración para las alertas
const getConfigForAlerts = async (IDSensor) => {
    try {
        // * Se obtiene la configuracion del quectel
        const config = await firebase.db.collection('camiones').where('IDSensor', '==', IDSensor).limit(1).get();

        // * Verifica si existe el camion con el IDSensor mandado
        if (config.empty) {
            console.log('Error -> No se encontró camión para sacar la configuración del sensor para las alertas');
            return {
                sts: "error"
            };
        } else {
            console.log('Success -> Configuración obtenida correctamente');
            const response = {
                sts: "rsv",
                cver: config.docs[0].data().configVersion,

                nombreCamion: config.docs[0].data().Nombre,
                IDSensor: config.docs[0].data().IDSensor,

                enOperacion: config.docs[0].data().lOperacion,
                enDetenido: (config.docs[0].data().lDetenido) * 60,

                setPointPresion: await convertPressureToBits(config.docs[0].data().pSPoint),
                presionMax: config.docs[0].data().pMax,
                presionMin: config.docs[0].data().pMin,
                setPointTemperatura: await convertTemperatureToBits(config.docs[0].data().tSPoint),
                temperaturaMax: config.docs[0].data().tMax,
                temperaturaMin: config.docs[0].data().tMin
            };
            console.log('Configuracion para alertas: ', response);
            return response;
        }
    } catch (error) {
        // * Error al obtener la configuracion
        console.log('Error -> No se pudo obtener la configuración');
        return {
            response: {
                sts: "error"
            }
        };
    }
};

const getStatusQuectel = async (IDSensor) => {
    const data = await firebase.db.collection('datosAlertas').where('id', '==', IDSensor).orderBy('creacionRegistro', 'desc').limit(1).get();
    if (data.empty) {
        return 'Sin estatus';
    } else {
        return data.docs[0].data().estatus;
    }
};
