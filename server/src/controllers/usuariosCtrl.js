const { response, request } = require("express");
const firebase = require("../database/config");

// * API para crear un nuevo usuario
const saveUser = async (req = request, res = response) => {
  // * Obtenemos los datos del usuario de la petición
  const { userName, email, password, telephone, noEmployee, role } = req.body;

  try {
    // * Creamos un usuario en firebase con correo y contraseña
    const userCreate = await firebase.auth.createUser({ email, password });

    // * Guardamos el usuario en la base de datos
    await firebase.db.doc(`/usuarios/${userCreate.uid}`).set({
      uid: userCreate.uid,
      userName,
      noEmployee,
      email,
      telephone,
      role,
      fechaCreacion: new Date(),
      activo: true,
      accesos: [
        {
          menu: 1,
          privilegio: 1
        }
      ]
    });

    // * Enviamos una respuesta al cliente
    res.json({
      msg: "El usuario ha sido registrado correctamente",
    });
  } catch (error) {
    // * Enviamos una respuesta al cliente
    res.json({
      msg: "Error al registrar los datos del usuario",
    });
  }
};

const updateUser = async (req = request, res = response) => {
  // * Obtenemos los datos del usuario de la petición
  const { userName, email, telephone, uid } = req.body;

  try {
    // * Verificamos que el correo no sea el mismo
    if (email !== "iguales") {
      // * Actualizamos los datos del usuario
      await firebase.db.doc(`/usuarios/${uid}`).update({
        userName,
        email,
        telephone,
      });

      // * Actualizamos las credenciales del usuario
      await firebase.auth.updateUser(uid, {
        email,
      });
    } else {
      // * Actualizamos los datos del usuario
      await firebase.db.doc(`/usuarios/${uid}`).update({
        userName,
        telephone,
      });
    }

    // * Enviamos una respuesta al cliente
    res.json({
      msg: "El usuario ha sido actualizado correctamente",
    });
  } catch (error) {
    // * Enviamos una respuesta al cliente
    res.json({
      msg: "Error al actualizar los datos del usuario",
    });
  }
};

const deleteUser = async (req = request, res = response) => {
  // * Obtenemos los datos del usuario de la petición
  const { uid } = req.params;

  try {
    // * Eliminamos el usuario de la base de datos
    await firebase.db.doc(`/usuarios/${uid}`).delete();

    /*await firebase.db.doc(`/usuarios/${uid}`).update({
      activo: false,
    });*/

    // * Eliminamos las credenciales del usuario
    await firebase.auth.deleteUser(uid);
    
    // await firebase.auth.updateUser(uid, {
    //   disabled: true,
    // });

    // * Enviamos una respuesta al cliente
    res.json({
      msg: "El usuario ha sido eliminado correctamente",
    });
  } catch (error) {
    // * Enviamos una respuesta al cliente
    res.json({
      msg: "Error al eliminar el usuario",
    });
  }
};


// * Pruebas para edgardo con quectel para whaterHouse
const pruebaGET = async (req = request, res = response) => {
  req.query.nombre = req.query.nombre || 'mundo';
  if (req.query.nombre.length >= 200) {
    res.json({
      body: '_OKRCV|'
    });
  } else {
    res.json({
      body: req.query.nombre
    });
  }
}
const pruebaPOST = async (req = request, res = response) => {
  res.json(req.body);
}

module.exports = {
  saveUser,
  updateUser,
  deleteUser,
  pruebaGET,
  pruebaPOST
};
