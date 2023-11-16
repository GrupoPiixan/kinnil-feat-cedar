const camposTrama = [
    'id',
    'ubi',
    'a1',
    'a2',
    'a3',
    'a4',
    'm1',
    'm2',
    'd1',
    'd2',
    'd3',
    'd4'
];

const camposDataTrama = [
    'optn',
    'data',
    'xtra'
];

const validateTrama = (trama) => {
    var result = { error: false, response: null };
    // * Validad que la trama traiga los campos correctos
    for (let index = 0; index < camposTrama.length; index++) {
        // * Si no existe el campo, se retorna un error
        if (!trama.hasOwnProperty(camposTrama[index])) {
            console.log(`Error -> La trama no es la correcta`);
            result.error = true;
            result.response = {
                sts: "error"
            };
            break;
        }
    }
    return result;
};

// * Verificar que la trama sea correcta
const validateTramaArray = (trama) => {
    var result = { error: false, response: null };
    // * Ciclamos el array de tramas
    for (let i = 0; i < trama.arrSens.length; i++) {
        // * Validad que la trama traiga los campos correctos
        for (let index = 0; index < camposTrama.length; index++) {
            // * Si no existe el campo, se retorna un error
            if (!trama.arrSens[i].hasOwnProperty(camposTrama[index])) {
                console.log(`Error -> La trama no es la correcta`);
                result.error = true;
                result.response = {
                    sts: "error"
                };
                break;
            }
        }
    }
    return result;
};

// * Verificar que la trama inicial sea correcta
const validateDataTrama = (trama) => {
    var result = { error: false, response: null};
    // * Validad que la trama traiga los campos correctos
    for (let index = 0; index < camposDataTrama.length; index++) {
        // * Si no existe el campo, se retorna un error
        if (!trama.hasOwnProperty(camposDataTrama[index])) {
            console.log(`Error -> La trama de datos no es la correcta`);
            result.error = true;
            result.response = {
                sts: "error"
            };
            break;
        }
    }
    return result;
}

module.exports = {
    validateTramaArray,
    validateDataTrama
}
