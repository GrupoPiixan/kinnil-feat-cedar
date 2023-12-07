const firebase = require('../database/config');

exports.saveDataPLC = async (data) => {
    let tempData = {...data};

    tempData.creacionRegistro = new Date();

    return await firebase.db.collection('quectel').add(tempData);
};