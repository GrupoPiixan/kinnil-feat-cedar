const { Router } = require('express')
const { check } = require('express-validator');

// * Validaciones y Ctrl
const { saveUser, updateUser, deleteUser, pruebaGET, pruebaPOST } = require('../controllers/usuariosCtrl');
const { validarCampos } = require('../middlewares/validate');
const { isAValidToken, accountNotExists } = require('../middlewares/validateFirebase');

const router = Router();

// * Rutas generales para el funcionamiento de la API Usuarios

// * Ruta para guardar un usuario
router.post('/crearUsuario', [
    check('token').custom(isAValidToken),
    check('email').custom(accountNotExists),
    validarCampos
], saveUser);

// * Ruta para actualizar el usuario
router.put('/actualizarUsuario', [
    check('token').custom(isAValidToken),
    check('email').custom(accountNotExists),
    validarCampos
], updateUser);

// * Ruta para eliminar el usuario
router.delete('/eliminarUsuario/:token/:uid', [
    check('token').custom(isAValidToken),
    validarCampos
], deleteUser);

// * Pruebas para edgardo con quectel para whaterHouse
router.get('/prueba-quectel', pruebaGET);
router.post('/prueba-quectel', pruebaPOST);

module.exports = router;