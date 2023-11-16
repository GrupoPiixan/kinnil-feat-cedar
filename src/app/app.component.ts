import { Component } from '@angular/core';

// * Servcies
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private authService: AuthService) {
    // * Inicializar el usuario
    this.initUser();
  }

  // * Metodo para cargar la informacion del usuario
  initUser(): void {
    // * Obetener datos del usuario
    this.authService.user$.subscribe((data) => {
      // * Validamos que existan datos del usuario
      if (data != 0) {
        // * Validamos la sesión del usuario y guardamos los datos en el local storage
        this.authService.validateSesion(data);
      }
    });
  }

}
