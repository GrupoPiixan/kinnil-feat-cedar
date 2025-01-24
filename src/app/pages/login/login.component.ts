import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import Swal from 'sweetalert2';

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
  showError: boolean = false;
  errorMessage: string = '';

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
    const modalElement = document.getElementById('mfaModal');
    if (modalElement) {
      this.mfaModal = new bootstrap.Modal(modalElement);
    }
  }
  async showCustomPrompt(text: string) {
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
    return userInput || null;
  }

  async login(): Promise<void> {
    try {
      const { email, password } = this.loginForm.value;
      if (this.loginForm.valid) {
        const login = await this.authService.login(email, password);
        switch (login) {
          case 'Success': {
            this.showError = false;
            this.errorMessage = '';
            window.location.reload();
            break;
          }
          case 'MFA REQUIRED': {
            this.mfaModal.show();
            break;
          }
          default:
            this.errorMessage = 'Wrong Password or User';
            this.showError = true;
            break;
        }
      } else if (this.loginForm.invalid) {
        this.errorMessage = 'Please fill all the fields';
        this.showError = true;
      }
    } catch (error: any) {
      console.log(error.code);
    }
  }

  restorePassword(): void {
    if (this.emailRestore !== '') {
      this.authService.restorePassword(this.emailRestore);
      let time = setTimeout(() => {
        this.emailRestore = '';
        clearTimeout(time);
      }, 1500);
    }
  }
  async enableMfa() {
    try {
      const phoneNumber = this.MFAForm.value.tel;
      if (!phoneNumber || !/^\+\d{10,15}$/.test(phoneNumber)) {
        throw new Error('The phone number must be in E.164 format (e.g., +1234567890). Please try again.');
      }

      const user = await this.afAuth.currentUser;
      if (!user) {
        Swal.fire({
          title: 'Error',
          text: 'User not found',
          icon: 'error', // Opciones: 'success', 'error', 'warning', 'info', 'question'
        });
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


      // Ask user for the verification code.
      const verificationCode = window.prompt("We have sent you a code, please enter it here");
      if (!verificationCode) {
        throw new Error('Verification code is null try again');
      }
      // Then:
      const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

      const mfaDisplayName = 'Phone number';
      await multiFactor(user).enroll(multiFactorAssertion, mfaDisplayName);
      window.location.reload();

    } catch (error: any) {
      console.error("log err", error);
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error', // Opciones: 'success', 'error', 'warning', 'info', 'question'
      }).then(() => {
        window.location.reload();
      });
    }
  }

}
