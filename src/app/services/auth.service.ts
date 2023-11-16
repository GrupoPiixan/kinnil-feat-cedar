import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// * Firebase
import { AngularFireAuth } from '@angular/fire/compat/auth';
import "firebase/auth";
import { AngularFirestore } from '@angular/fire/compat/firestore';

// * Utils
import { LocalStorageService } from '../utils/local-storage.service';
import { jsonUtils } from '../utils/json-utils';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  user$: Observable<any>;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private lStorage: LocalStorageService) {
    // * Inicializamos el usuario si está logueado
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user !== null) {
          // * Consultar el usuario en la base de datos
          return this.afs.doc('usuarios/' + user.uid).valueChanges();
        } else {
          // * Si no está logueado, retornamos un cero
          return Promise.resolve(0);
        }
      })
    );
  }

  // * Iniciamos sesión
  login(email: string, password: string): void {
    try {
      // * Iniciar sesion en el servicio de Firebase
      this.afAuth.signInWithEmailAndPassword(email, password).then((user) => {
        if (user) {
          // * Recargamos la página para redireccionar al dashboard
          window.location.reload();
        }
      }).catch(error => {
        // * Mostrar error si el servicio no funciona
        switch (error.code) {
          case 'auth/wrong-password':
            window.alert('Error al intentar iniciar sesión');
            break;
          case 'auth/user-not-found':
            window.alert('Este usuario no está registrado');
            break;
          default:
            break;
        }
      });
    } catch (err) {
      // * Mostrar error
      console.log('Catch login: ', err);
    }
  }

  validateSesion(data: any): void {
    // * Obtener los datos de la session
    this.afAuth.authState.subscribe((auth) => {
      // * Verificar si el usuario esta logueado
      if (auth != null) {
        this.afAuth.idToken.subscribe(async (token) => {
          // * Guardar el token en el local storage
          data.token = token;

          // * Guardar los menus que tendra el usuario
          data.menus = await this.validatePrivilegesUser(data);

          // * Guardar los datos del usuario en el localStorage
          this.lStorage.saveLocalStorage(this.lStorage.keyLocalStorageUser, data);
        });
      }
    });
  }

  // * Validar acceso a los menus del usuario
  private async validatePrivilegesUser(user: any) {
    let menus: any = [];

    // * Si el usuario es Super Usuario le damos todos los menus
    if (user.role === 'Super Usuario') return jsonUtils.menus;

    // * Ciclamos los menus del sistema
    for (let i = 0; i < jsonUtils.menus.length; i++) {
      // * Verificamos si el menu tiene submenus
      if (jsonUtils.menus[i].submenus.length === 0) {
        // * Si el menu no tiene submenus, verificamos si el usuario tiene permisos
        for (let j = 0; j < user.accesos.length; j++) {
          // * Verificamos que el menu tenga privilegios y que sea del menu lateral
          if (user.accesos[j].privilegio !== 0 && jsonUtils.menus[i].isLateralMenu) {
            // * Si el usuario tiene permisos, agregamos el menu al array
            if (jsonUtils.menus[i].idMenu === user.accesos[j].menu) {
              jsonUtils.menus[i].privileges = user.accesos[j].privilegio;
              menus.push(jsonUtils.menus[i]);
            }
          }
        }
      } else if (jsonUtils.menus[i].submenus.length > 0) {
        // * Si el menu tiene submenus, los ciclamos
        for (let j = 0; j < jsonUtils.menus[i].submenus.length; j++) {
          // * Verificamos si el usuario tiene permisos
          for (let k = 0; k < user.accesos.length; k++) {
            // * Verificamos que el menu tenga privilegios y que sea del menu lateral
            if (user.accesos[k].privilegio !== 0 && jsonUtils.menus[i].submenus[j].isLateralMenu) {
              // * Si el usuario tiene permisos, agregamos el menu al array
              if (jsonUtils.menus[i].submenus[j].idMenu === user.accesos[k].menu) {
                // * Damos el privilegio al submenu
                jsonUtils.menus[i].submenus[j].privileges = user.accesos[k].privilegio;
                // * Preguntamos si el menu principal existe
                let menuExist = this.findMenuExist(menus, jsonUtils.menus[i].idMenu);
                if (menuExist.resp) {
                  // * Si el menu existe, agregamos el submenu al array
                  menus[menuExist.index].submenus.push(jsonUtils.menus[i].submenus[j]);
                } else {
                  // * Si el menu no existe, agregamos el menu con su submenu
                  menus.push({
                    name: jsonUtils.menus[i].name,
                    icon: jsonUtils.menus[i].icon,
                    url: jsonUtils.menus[i].url,
                    idMenu: jsonUtils.menus[i].idMenu,
                    privileges: jsonUtils.menus[i].privileges,
                    submenus: [jsonUtils.menus[i].submenus[j]]
                  });
                }
              }
            }
          }
        }
      }
    }

    // * Retornamos el array de menus
    return menus;
  }

  // * Metodo para buscar si un menu existe
  private findMenuExist(menu: any, idMenu: number) {
    for (let i = 0; i < menu.length; i++) {
      // * Si el menu existe, retornamos true y el indice
      if (menu[i].idMenu === idMenu) return { resp: true, index: i };
    }
    // * Si el menu no existe, retornamos false y el indice cero
    return { resp: false, index: 0 };
  }

  // * Cerramos sesión
  logout(): void {
    this.afAuth.signOut().then(() => {
      // * Borramos el usuario del local storage
      this.lStorage.deleteLocalStorage('usuario');
      // * Recargamos la página para redireccionar a login
      window.location.reload();
    });
  }

  // * Recuperar contraseña
  restorePassword(email: string): void {
    try {
      // * Enviamos la petición para recuperar la contraseña
      this.afAuth.sendPasswordResetEmail(email).then(() => {
        // * Mostramos un mensaje de exito
        window.alert(`Se ha enviado un correo a ${email} para restablecer la contraseña`);
      }).catch(error => {
        // * Mostramos un mensaje de error
        window.alert('Correo no reconocido, verifica que sea un correo válido y registrado en nuestra plataforma');
      });
    } catch (err) {
      // * Mostramos un mensaje de error
      console.log('Catch restorePassword: ', err);
    }
  }

}
