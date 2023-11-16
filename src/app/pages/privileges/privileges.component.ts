import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators } from '@angular/forms';

// * Utils
import { CheckPrivilegesService } from '../../utils/check-privileges.service';

// * Services
import { UsersService } from '../../services/users.service';

// * Jquery
declare var $: any;

@Component({
  selector: 'app-privileges',
  templateUrl: './privileges.component.html',
  styleUrls: ['./privileges.component.css']
})
export class PrivilegesComponent implements OnInit {

    // * Identificador de la página para los privilegios del usuario (Obligatorio en todas las páginas, es el mismo que esta en environment.ts)
    idMenuPage: number = 5.2;

    // * Variable para guardar los datos del usuario
    public userData: any = {};
  
    // * Arreglo de usuarios
    users: any[] = [];
  
    // * Variables para guardar datos del usuario
    userEdit = {} as any;
    userEdit2 = {} as any;
  
    // * Formulario de nuevo usuario
    newUserForm = new FormGroup({
      userName: new FormControl('', [Validators.required, Validators.maxLength(17), this.removeSpaces]),
      email: new FormControl('', [Validators.required, Validators.email, this.removeSpaces]),
      password: new FormControl('', [Validators.required, Validators.minLength(6), this.removeSpaces]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6), this.removeSpaces]),
      telephone: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
      noEmployee: new FormControl('1', [Validators.required, Validators.maxLength(7)]),
      role: new FormControl('Usuario', [Validators.required]),
    });
  
    // * Formulario para editar usuario
    editUserForm = new FormGroup({
      userName: new FormControl('', [Validators.required, Validators.maxLength(17), this.removeSpaces]),
      email: new FormControl('', [Validators.required, Validators.email, this.removeSpaces]),
      telephone: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
    });
  
    constructor(private userServ: UsersService,
      private checkPrivileges: CheckPrivilegesService) { }
  
    ngOnInit(): void {
      // * Cargamos los usuarios
      this.getUsers();
    }
  
    ngOnDestroy(): void {
      // * Se da de baja del evento
      //this.dtTrigger.unsubscribe();
    }
  
    // * Obtenemos los privilegios del usuario
    verifiPrivileges(privileges: any): boolean {
      return this.checkPrivileges.checkPrivileges(privileges, this.idMenuPage);
    }
  
    // * Crear nuevo usuario
    createUser(): void {
      const { password, confirmPassword, telephone, noEmployee, email } = this.newUserForm.value;
  
      // * Validar que las contraseñas coincidan
      if (this.newUserForm.valid && (password === confirmPassword)) {
        if (noEmployee !== 0) {
          this.userServ.createUser(this.newUserForm.value).subscribe((res: any) => {
            if (res.errors === undefined) {
              alert(res.msg);
              this.newUserForm = new FormGroup({
                userName: new FormControl('', [Validators.required, Validators.maxLength(17), this.removeSpaces]),
                email: new FormControl('', [Validators.required, Validators.email, this.removeSpaces]),
                password: new FormControl('', [Validators.required, Validators.minLength(6), this.removeSpaces]),
                confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6), this.removeSpaces]),
                telephone: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]),
                noEmployee: new FormControl('1', [Validators.required, Validators.maxLength(7)]),
                role: new FormControl('Usuario', [Validators.required]),
              });
              $("#modalCrearUsuarioCerrar").click();
              window.location.reload();
            } else {
              alert(res.errors[0].msg);
            }
          });
        } else {
          alert('El número de empleado no puede ser 0');
        }
      } else {
        if (password.length < 6) {
          alert('La contraseña debe de tener 6 o más caracteres');
        } else if (password !== confirmPassword) {
          alert('Las contraseñas no coinciden');
        } else if (telephone.length < 10) {
          alert('El número telefónico debe de tener 10 caracteres');
        } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3,4})+$/.test(email)) {
          alert('El correo electrónico no es válido');
        }
      }
    }
  
    // * Mostrar informacion de un usuario en un modal
    initModalEditUser(user: any): void {
      // * Guardamos el usuario en un objeto
      this.userEdit.username = user.data.userName;
      this.userEdit.email = user.data.email;
      this.userEdit.telephone = user.data.telephone;
      this.userEdit.uid = user.uid;
  
      this.userEdit2.username = user.data.userName;
      this.userEdit2.email = user.data.email;
      this.userEdit2.telephone = user.data.telephone;
      this.userEdit2.uid = user.uid;
  
      // * Inicializamos el formulario
      this.editUserForm.value.userName = user.data.userName;
      this.editUserForm.value.email = user.data.email;
      this.editUserForm.value.telephone = user.data.telephone;
    }
  
    // * Editar usuario
    editUser(): void {
      const { telephone, email } = this.editUserForm.value;
      if (this.editUserForm.valid && confirm('¿Está seguro de que desea modificar este usuario?')) {
        this.userServ.updateUser(this.userEdit2, this.editUserForm.value).subscribe((res: any) => {
          if (res.errors === undefined) {
            alert(res.msg);
            this.editUserForm.reset();
            $("#modalEditarUsuarioCerrar").click();
            window.location.reload();
          } else {
            alert(res.errors[0].msg);
          }
        });
      } else {
        if (telephone.length < 10) {
          alert('El número telefónico debe de tener 10 caracteres');
        } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3,4})+$/.test(email)) {
          alert('El correo electrónico no es válido');
        }
      }
    }
  
    // * Eliminar usuario
    deleteUser(user: any): void {
      if (confirm('¿Está seguro de eliminar este usuario?')) {
        this.userServ.deleteUser(user).subscribe((res: any) => {
          if (res.errors === undefined) {
            alert(res.msg);
            window.location.reload();
          } else {
            alert(res.errors[0].msg);
          }
        });
      }
    }
  
    getUsers(): void {
      // * Obtenemos los usuarios
      this.userServ.getUsers().subscribe(res => {
        // * Ciclamos los usuarios y los guardamos en el arreglo
        this.users = res.map(user => {
          return {
            uid: user.payload.doc.id,
            data: user.payload.doc.data()
          };
        });
      });
    }
  
    removeSpaces(control: AbstractControl) {
      if (control && control.value && !control.value.replace(/\s/g, '').length) {
        control.setValue('');
      }
      return null;
    }

}
