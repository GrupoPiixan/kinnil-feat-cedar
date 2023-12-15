import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// * Utils
import { CheckPrivilegesService } from '../../utils/check-privileges.service';
import { jsonUtils } from '../../utils/json-utils';

// * Services
import { UsersService } from '../../services/users.service';

// * Jquery
declare var $: any;

@Component({
  selector: 'app-privileges-detail',
  templateUrl: './privileges-detail.component.html',
  styleUrls: ['./privileges-detail.component.css']
})
export class PrivilegesDetailComponent implements OnInit {

  // * Identificador de la página para los privilegios del usuario (Obligatorio en todas las páginas, es el mismo que esta en environment.ts)
  idMenuPage: number = 5.3;

  // * Todos los menus del sistema
  menus: any = [];

  // * Variable para guardar el uid del usuario y su nombre
  uid: string = '';
  userName: string = '';

  // * Variable para el rol del usuario
  menu: any = [];
  privilege: string = '0';

  constructor(private checkPrivileges: CheckPrivilegesService,
    private route: ActivatedRoute,
    private userSrvs: UsersService) { }

  ngOnInit(): void {
    // * Obtenemos el uid del usuario a consultar por la url
    this.uid = this.route.snapshot.paramMap.get("uid") || '';
    // * Obtenemos el nombre del usuario a consultar por la url
    this.userName = this.route.snapshot.paramMap.get("name") || '';
    // * Inicializamos los menus
    this.systemMenus();
  }

  systemMenus(): void {
    // * Obtenemos los menus del sistema
    this.menus = jsonUtils.menus;
    // * Nos subscribimos al observable para obtener los privilegios de cada menu
    this.checkPrivileges.getRoleMenus(this.menus, this.uid);
  }

  // * Obtenemos los privilegios del usuario
  verifiPrivileges(privileges: any): boolean {
    return this.checkPrivileges.checkPrivileges(privileges, this.idMenuPage);
  }

  // * Metodo para iniciar modal de edición de usuario con su rol
  editRoleUser(menu: any): void {
    this.menu = menu;
    this.privilege = menu.privileges;
  }

  updatePrivileges(): void {
    // * Actualizamos los privilegios del usuario
    this.userSrvs.updatePrivileges(this.uid, this.menu, this.privilege).then(() => {
      // * Cerramos el modal
      $("#modalEditarUsuario").click();
      alert('Los privilegios del usuario se han actualizado correctamente');
    });
  }

}
