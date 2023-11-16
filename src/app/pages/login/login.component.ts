import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators  } from '@angular/forms';

// * Services
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  // * Formulario de login
  loginForm = new FormGroup({
    email: new FormControl('',[Validators.required, Validators.email]), 
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  emailRestore: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void { }

  login(): void {
    const { email, password } = this.loginForm.value;
    // Verificar si el formulario es valido
    if (this.loginForm.valid) {
      // Enviar datos al servicio de autenticacion
      this.authService.login(email, password);
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

}
