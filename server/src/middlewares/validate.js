const { validationResult } = require('express-validator');


/**
 * * Método que valida los campos de la petición
 *
 * @param {req}
 * @param {res}
 * @param {next}
 * @return {*} 
 */
const validarCampos = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json(errors);
    }

    next();
}

module.exports = {
    validarCampos
}