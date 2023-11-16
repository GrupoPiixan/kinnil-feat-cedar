// Firebase-admin
const firebase = require('../database/config');

/**
 * * Método para validar el token de autenticación
 *
 * @param {token: ''}
 */
const isAValidToken = async (token = '') => {
    return firebase.auth
        .verifyIdToken(token)
        .then((decodedToken) => {
            // console.log('Token validado: ', decodedToken);
            console.log('Token validado');
        })
        .catch(() => {
            return Promise.reject(`El token es incorrecto`);
        });
}

/**
 * * Método para validar que dicho correo no exista este registrado
 *
 * @param {email: ''}
 */
const accountNotExists = async (email = '') => {
    try {
        if (email !== 'iguales') {
            await firebase.auth.getUserByEmail(email);
            return Promise.reject(`El correo "${email}" ya está registrado`);
        }
    } catch (error) {
        console.log('El correo no existe');
    }
}

module.exports = {
    isAValidToken,
    accountNotExists,
}