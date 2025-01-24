import { Component, OnInit } from '@angular/core';
// * Services
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit(): void {

  }
  logout(): void {
    // * Preguntamos si desea cerrar sesión
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      // * Cerramos la sesión del usuario
      this.authService.logout();
    }
  }

}
