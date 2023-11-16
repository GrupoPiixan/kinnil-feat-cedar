import { Injectable } from '@angular/core';

// * Utils
import { LocalStorageService } from '../utils/local-storage.service';

// * Services
import { UsersService } from '../services/users.service';

@Injectable({
  providedIn: 'root'
})
export class CheckPrivilegesService {

  constructor(private lStorage: LocalStorageService, private userSrv: UsersService) { }

  // * Metodo para verificar si el usuario tiene privilegios
  checkPrivileges(privileges: any, idMenuPage: number): boolean {
    // * Obtenemos la información del usuario del localStorage
    let userData = this.lStorage.getLocalStorage(this.lStorage.keyLocalStorageUser);

    // * Si el usuario es Super Usuario le damos todos los privilegios
    if (userData.role === 'Super Usuario') {
      let privilegeTemp = 0;
      // * Verificamos los privilegios y solo los que sean 3 los pasamos
      for (let index = 0; index < privileges.length; index++) {
        if (privileges[index] === 3) { privilegeTemp = 3; break; }
      }
      // * Si el privilegio es 3, retornamos true, solo si es Super Usuario
      switch (privilegeTemp) {
        case 3:
          return true;
        default:
          return false;
      }
    }

    // * Si el usuario no tiene accesos retornamos false
    if (userData.accesos.length > 0) {
      // * Si el usuario tiene accesos, verificamos si el idMenuPage está en el arreglo de accesos
      for (let i = 0; i < userData.accesos.length; i++) {
        if (userData.accesos[i].menu == idMenuPage) {
          // * Si el idMenuPage está en el arreglo de accesos, pasamos a verificar los privilegios
          for (let j = 0; j < privileges.length; j++) {
            // * Si el usuario tiene privilegios, retornamos true
            if (privileges[j] == userData.accesos[i].privilegio) {
              return true;
            }
          }
        }
      }
    }
    // * Si el usuario no tiene accesos o no tiene privilegios, retornamos false
    return false;
  }

  // * Metodo para devolver el privilegio de cada menu
  getRoleMenus(menus: any, uid: string) {
    // * Consultamos al usuario en la base de datos
    return this.userSrv.getUser(uid).subscribe((user: any) => {
      // * Ciclamos el usuario aunque sea solo uno
      return user.map((userPayload: any) => {
        // * Guardamos el usuario en una variable
        let user = userPayload.payload.doc.data();
        // * Ciclamos los menus
        menus.forEach((m: any) => {
          // * Verificamos si el menu tiene submenus
          if (m.submenus.length <= 0) {
            // * Si no tiene submenus, verificamos si el usuario tiene privilegios en el menu
            m.permissions = this.permissionsMenu(user, m.idMenu);
            m.privileges = this.privilegeMenu(user, m.idMenu);
          } else if (m.submenus.length > 0) {
            // * Si tiene submenus los ciclamos
            m.submenus.forEach((sm: any) => {
              // * Verificamos si el usuario tiene privilegios en el submenu
              sm.permissions = this.permissionsMenu(user, sm.idMenu);
              sm.privileges = this.privilegeMenu(user, sm.idMenu);
            });
          }
        });
      });
    });
  }

  // * Metodo para devolver el permiso del usuario en el menu especificado
  private permissionsMenu(user: any, idMenu: number) {
    // * Si el usuario no tiene accesos retornamos false
    if (user.accesos.length > 0) {
      if (user.role === 'Super Usuario') { return 'Ver, Editar, Crear y Eliminar' }
      // * Si el usuario tiene accesos, verificamos si el idMenuPage está en el arreglo de accesos
      for (let i = 0; i < user.accesos.length; i++) {
        // * Si el idMenuPage está en el arreglo de accesos, pasamos a verificar los permisos
        if (user.accesos[i].menu == idMenu) {
          // * Verificamos los permisos que tiene el usuario
          switch (user.accesos[i].privilegio) {
            case 1:
              return 'Ver';
            case 2:
              return 'Ver y Editar';
            case 3:
              return 'Ver, Editar, Crear y Eliminar';
          }
        }
      }
    }
    // * Si el usuario no tiene accesos o no tiene permisos, retornamos false
    return 'Sin privilegios';
  }

  // * Metodo para devolver el privilegio del usuario en el menu especificado
  private privilegeMenu(user: any, idMenu: number) {
    // * Si el usuario no tiene accesos retornamos false
    if (user.accesos.length > 0) {
      if (user.role === 'Super Usuario') { return 3 }
      // * Si el usuario tiene accesos, verificamos si el idMenuPage está en el arreglo de accesos
      for (let i = 0; i < user.accesos.length; i++) {
        // * Si el idMenuPage está en el arreglo de accesos, pasamos a verificar los privilegios
        if (user.accesos[i].menu == idMenu) {
          // * Verificamos los privilegios que tiene el usuario
          return user.accesos[i].privilegio;
        }
      }
    }
    // * Si el usuario no tiene accesos o no tiene privilegios, retornamos false
    return 0;
  }

}
