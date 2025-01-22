import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator,
  RecaptchaVerifier, getAuth
} from "firebase/auth";
declare var bootstrap: any;
// * Services
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  // * Formulario de login
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });
  MFAForm = new FormGroup({
    tel: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });
  emailRestore: string = '';
  private mfaModal: any;
  constructor(private authService: AuthService, private afAuth: AngularFireAuth) { }

  ngOnInit(): void { }
  ngAfterViewInit(): void {

    // Inicializar el modal
    const modalElement = document.getElementById('mfaModal');
    if (modalElement) {
      this.mfaModal = new bootstrap.Modal(modalElement);
    }
  }
  async login(): Promise<void> {
    const { email, password } = this.loginForm.value;
    // Verificar si el formulario es valido
    if (this.loginForm.valid) {
      // Enviar datos al servicio de autenticacion
      const login = await this.authService.login(email, password);
      if (login) {
        window.location.reload();
      } else {
        this.mfaModal.show();
      }
    } else if (this.loginForm.invalid) {
      // * Mostrar mensaje de error si el formulario es invalido
      window.alert('Por favor, ingrese un correo y una contraseña válidos.');
    }
  }

  restorePassword(): void {
    // * Enviar correo de recuperacion de contraseña
    if (this.emailRestore !== '') {
      this.authService.restorePassword(this.emailRestore);
      // * Limpiamos el campo de correo despues de intentar enviar el correo
      let time = setTimeout(() => {
        this.emailRestore = '';
        clearTimeout(time);
      }, 1500);
    }
  }
  async enableMfa() {
    const phoneNumber = this.MFAForm.value.tel;
    if (!phoneNumber || !/^\+\d{10,15}$/.test(phoneNumber)) {
      throw new Error('El número de teléfono debe estar en formato E.164 (ejemplo: +1234567890)');
    }

    const user = await this.afAuth.currentUser;
    if (!user) {
      alert('El usuario no está autenticado');
      return;
    }
    const recaptchaParameters = {
      size: 'invisible',
      callback: (response: string) => {
        console.log('reCAPTCHA solved, allow signInWithPhoneNumber.');
      }
    };
    const auth = getAuth();
    const recaptchaVerifier = new RecaptchaVerifier('recaptcha-container-id', recaptchaParameters, auth);
    const multiFactorSession = await multiFactor(user).getSession()
    const phoneInfoOptions = {
      phoneNumber: phoneNumber,
      session: multiFactorSession
    };

    const phoneAuthProvider = new PhoneAuthProvider(auth);

    // Send SMS verification code.
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier);
    console.log('verificationId', verificationId);

    // Ask user for the verification code.
    const verificationCode = prompt('Ingrese el código de verificación que recibió por SMS:');
    if (!verificationCode) {
      throw new Error('El código de verificación es necesario');
    }
    // Then:
    const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

    // Complete enrollment.
    const mfaDisplayName = 'Phone number'; // Define the display name
    return multiFactor(user).enroll(multiFactorAssertion, mfaDisplayName);


  }



}
