import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';

// * Firebase
import { AngularFireAuth } from '@angular/fire/compat/auth';
import "firebase/auth";
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
// * Utils
import { LocalStorageService } from '../utils/local-storage.service';
import { jsonUtils } from '../utils/json-utils';
import {
  getAuth,
  RecaptchaVerifier,
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator
} from "firebase/auth";
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
  async showCustomPrompt(text: string) {
    const recaptcha = document.getElementById('recaptcha-container-id');
    if (recaptcha) recaptcha.style.display = 'none'; // Oculta temporalmente el reCAPTCHA

    const { value: userInput } = await Swal.fire({
      title: text,
      input: 'text',
      inputPlaceholder: 'Enter code here',
      showCancelButton: true,
      confirmButtonText: 'Send',
      cancelButtonText: 'Cancel',
      didOpen: () => {
        const input = Swal.getInput();
        if (input) {
          input.focus(); // Asegura el foco en el input
        }
      },
    });

    if (recaptcha) recaptcha.style.display = ''; // Reactiva el reCAPTCHA

    return userInput || null;
  }


  // * Iniciamos sesión
  async login(email: string, password: string): Promise<String> {
    try {
      await this.afAuth.signInWithEmailAndPassword(email, password)
      return "MFA REQUIRED"
    } catch (error: any) {
      if (error.code == 'auth/multi-factor-auth-required') {
        const recaptchaParameters = {
          size: 'invisible',
          callback: (response: string) => { }
        };
        const auth = getAuth();
        const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container-id', recaptchaParameters, auth);
        const resolver = getMultiFactorResolver(auth, error);
        const phoneInfoOptions = {
          multiFactorHint: resolver.hints[0],
          session: resolver.session
        };
        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
        let verificationCode = window.prompt("We have sent you a code, please enter it here");
        if (verificationCode !== null) {
          try {
            var cred = PhoneAuthProvider.credential(
              verificationId, verificationCode);
            const multiFactorAssertion =
              PhoneMultiFactorGenerator.assertion(cred);
            await resolver.resolveSignIn(multiFactorAssertion);
            return "Success"
          } catch (error: any) {
            if (error.code == 'auth/invalid-verification-code') {
              Swal.fire({
                title: 'Error',
                text: "Invalid verification code, try again and send a new code",
                icon: 'error',
                confirmButtonText: 'Ok'
              }).then(() => {
                window.location.reload();
              })
            }

          }

        } else {
          Swal.fire({
            title: 'Error',
            text: 'Verification code is null, try again',
            icon: 'error',
            confirmButtonText: 'Ok'
          }).then(() => {
            window.location.reload();
          })

          return "Error"
        }

      }
      if (error.code == 'auth/invalid-login-credentials') {
        return "Invalid credentials"
      }
      return "Error"
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
        Swal.fire({
          title: 'Mail Sent',
          text: 'We have sent you an email to reset your password',
          icon: 'success',
          confirmButtonText: 'Ok'
        });
      }).catch(error => {
        // * Mostramos un mensaje de error
        Swal.fire({
          title: 'Error',
          text: 'Email not recognized, verify that it is a valid email and registered in our platform',
          icon: 'error',
          confirmButtonText: 'Ok'
        });
      });
    } catch (err) {
      // * Mostramos un mensaje de error
      console.log('Catch restorePassword: ', err);
    }
  }
  deleteUser(): void {
    this.afAuth.signOut().then(() => {
      this.lStorage.deleteLocalStorage('usuario');
    });
  }


  // * Send email verification to specific email
  async sendEmailVerification(): Promise<void> {
    try {
      await this.afAuth.currentUser.then((user) => {
        user?.sendEmailVerification().then(() => {
          // * Mostramos un mensaje de exito
          Swal.fire({
            title: 'Mail Sent',
            text: 'We have sent you an email to verify your account',
            icon: 'success',
            confirmButtonText: 'Ok'
          });
        }).catch(error => {
          // * Mostramos un mensaje de error
          Swal.fire({
            title: 'Error',
            text: 'An error occurred while sending the email, please try again later',
            icon: 'error',
            confirmButtonText: 'Ok'
          });
        });
      });
    } catch (err) {
      // * Mostramos un mensaje de error
      console.log('Catch sendEmailVerification: ', err);
    }
  }

}
