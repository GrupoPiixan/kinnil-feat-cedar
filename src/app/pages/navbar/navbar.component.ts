import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
// * Services
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private authService: AuthService, private afAuth: AngularFireAuth,) { }

  async ngOnInit(): Promise<void> {
    let user = await this.afAuth.currentUser
    if (!user?.multiFactor?.enrolledFactors.length) {
      this.authService.logout();
    }
  }
  logout(): void {
    // * Preguntamos si desea cerrar sesión
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      // * Cerramos la sesión del usuario
      this.authService.logout();
    }
  }

}
