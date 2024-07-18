import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';

// * Services
import { LocalStorageService } from '../utils/local-storage.service';

// * Firebase
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  dataUser: any;

  constructor(private http: HttpClient,
    private lStorage: LocalStorageService,
    private afs: AngularFirestore) {
    // * Obtenemos el usuarios del local storage para obetener el token
    this.dataUser = lStorage.getLocalStorage(this.lStorage.keyLocalStorageUser);
  }

  // * Crear un usuario
  createUser(user: any) {
    // * Asginar el token a la información del usuario
    user.token = this.dataUser.token;

    // * Enviar la información al servidor
    return this.http.post(`${environment.urlAPIServer}/usuarios/crearUsuario`, user);
  }

  // * Actualizar los datos del usuario
  updateUser(userBD: any, userForm: any) {
    // * Verificamos si el email es igual al email del usuario que se esta editando
    if (userForm.email === userBD.email) userForm.email = 'iguales';

    // * Asginar el token a la información del usuario
    userForm.token = this.dataUser.token;

    // * Asignar el uid a la información del usuario
    userForm.uid = userBD.uid;

    // * Enviar la información al servidor
    return this.http.put(`${environment.urlAPIServer}/usuarios/actualizarUsuario`, userForm);
  }

  // * Eliminar un usuario
  deleteUser(user: any) {
    // * Asginar el token a la información del usuario
    user.token = this.dataUser.token;

    // * Enviar la información al servidor
    return this.http.delete(`${environment.urlAPIServer}/usuarios/eliminarUsuario/${user.token}/${user.uid}`, user);
  }

  getUsers() {
    // * Obtener los registros de la colección de usuarios
    return this.afs.collection('usuarios', ref => ref.where('activo', '==', true)).snapshotChanges();
  }

  getUser(uid: string) {
    // * Obtener al usuario
    return this.afs.collection('usuarios', ref => ref.where('uid', '==', uid)).snapshotChanges();
  }

  // * Actualizar privilegios de un usuario
  async updatePrivileges(uid: string, menu: any, newPrivilege: string) {
    // * Consultamos al usuario
    await this.afs.doc(`usuarios/${uid}`).update({
      // * Removemos el privilegio anterior
      accesos: firebase.firestore.FieldValue.arrayRemove({
        menu: menu.idMenu,
        privilegio: parseInt(menu.privileges)
      })
    });

    // * Consultamos al usuario
    return await this.afs.doc(`usuarios/${uid}`).update({
      // * Agregamos el nuevo privilegio
      accesos: firebase.firestore.FieldValue.arrayUnion({
        menu: menu.idMenu,
        privilegio: parseInt(newPrivilege)
      })
    });
  }

  getAllUsersWithNotificationsEnabled() {
    return this.afs.collection('usuarios', ref => ref.where('notify', '==', true)).get();
  }

}
