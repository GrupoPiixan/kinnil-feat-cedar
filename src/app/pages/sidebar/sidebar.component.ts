import { Component, OnInit } from '@angular/core';

// * Utils
import { LocalStorageService } from '../../utils/local-storage.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  // * Variable para guardar los datos del usuario
  public userData: any = {};

  /**
   * TODO: Menus de la barra de navegación
   * 
   * El Super Usuario es el usuario que tiene todos los menus y privilegios
   * 
   * Rangos de los privilegios del usuario
   * 1 -> Ver
   * 2 -> Ver y Editar
   * 3 -> Ver, Editar, Crear y Eliminar
   * 
   * Si se agregaran más privilegios se deberá de agregar en enviroment.ts
   */
  menus: any = [];

  menuOpen: string = '';

  constructor(private lStorage: LocalStorageService) {
    // * Mandamos llamar la función para obtener los datos del usuario
    this.initDataUserLocalStorage();
  }

  ngOnInit(): void { }

  // * Metodo para obtener los datos del usuario
  initDataUserLocalStorage(): void {
    /**
     * TODO: Timer para verificar que la variable userData se llene correctamente.
     * Solo se usa aquí ya que el navbar-sidebar.component se carga
     * al inicio junto con el dasboard.component al iniciar sesión y se debe de verificar 
     * que la información del usuario se traiga correctamente, en cualquier otro lado
     * que se deba obtener la información del usuario del localStorage
     * solo usar esta linea de código:
     * this.lStorage.getLocalStorage(this.lStorage.keyLocalStorageUser);
     * e iniciarlizar la variable donde guardes la información del usuario.
     */
    var timer = setInterval(() => {
      // * Obtenemos los datos del usuario que esta logueado del localStorage
      this.userData = this.lStorage.getLocalStorage(this.lStorage.keyLocalStorageUser);
      // * Obtenemos los menus del usuario
      this.menus = this.userData.menus;

      // * Verificamos que la variable userData no este vacia
      (JSON.stringify(this.userData) === '{}') ? window.location.reload() : null;
      // * Limpiamos el timer
      clearInterval(timer);
    }, 1000);
  }

  // * Metodo para abrir y cerra el menu en el sidebar
  isSelectedMenu(menu: string) {
    if (this.menuOpen !== menu) {
      this.menuOpen = menu;
    } else {
      this.menuOpen = '';
    }
  }

}
