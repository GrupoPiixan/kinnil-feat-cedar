import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { GetDataService } from '../../services/get-data.service';

// * Enviroment
import { environment } from 'src/environments/environment';

// * Utils
import { CheckPrivilegesService } from '../../utils/check-privileges.service';

declare const $: any;

@Component({
  selector: 'app-machines',
  templateUrl: './machines.component.html',
  styleUrls: ['./machines.component.css']
})
export class MachinesComponent implements OnInit {

  // * Identificador de la página para los privilegios del usuario (Obligatorio en todas las páginas, es el mismo que esta en environment.ts)
  idMenuPage: number = 2.2;
  date: Date = new Date()
  hoy: String = this.date.getFullYear() + '-' + (this.date.getMonth() + 1) + '-' + this.date.getDay()


  // * Creamos la variable que tendra los datos para llenar la tabla
  tablaCamiones: any;
  showComponents = false;

  temperaturaMax: number = 1;
  temperaturaMin: any = 1;
  submitted = false;
  camiones = ['Bomba', 'Trompo'];
  trucksForm = new FormGroup({
    noBases: new FormControl('', [Validators.required, Validators.nullValidator]),
    Nombre: new FormControl('', [Validators.required, Validators.nullValidator]),
    uMantenimiento: new FormControl('', Validators.required),
    pMantenimiento: new FormControl('', Validators.required),
    lOperacion: new FormControl('', [Validators.required, Validators.min(1), Validators.max(60)]),
    lDetenido: new FormControl('', [Validators.required, Validators.min(1), Validators.max(60)]),
    pMin: new FormControl('', [Validators.required, Validators.min(1)]),
    pSPoint: new FormControl('', [Validators.required, Validators.min(1)]),
    pMax: new FormControl('', [Validators.required, Validators.min(1)]),
    tMin: new FormControl('', [Validators.required, Validators.min(1)]),
    tSPoint: new FormControl('', [Validators.required, Validators.min(1)]),
    tMax: new FormControl('', [Validators.required]),
    uid: new FormControl(),
    idBoards: new FormControl(),
    configVersion: new FormControl(),
  });

  presionMax: number = 1;
  camionesTabla: any = {
    messageEmpty: 'Ningún dato disponible en esta tabla',
    showSearch: true,
    showData: [5, 10, 15, 20, 25],
    headerRow: [{
      text: 'uid',
      show: false
    },{
      text: 'Nombre',
      show: true
    },{
      text: 'Cantidad de bases',
      show: true
    }],
    buttons: {
      detail: {
        show: true,
        text: 'Detail',
      },
      edit: {
        show: true,
        text: 'Edit',
      },
      delete: {
        show: true,
        text: 'Delete',
      }
    }
  };
  dataRows:Array<any>=[];

  constructor(private formBuilder: FormBuilder,
    private service: GetDataService,
    private checkPrivileges: CheckPrivilegesService,
    private router: Router) {
  }

  ngOnInit(): void {
    this.getData();
  }

  // * Obtenemos los datos de los camiones
  getData() {
    this.service.getTrucksData().snapshotChanges().subscribe(dataT => {
      this.tablaCamiones = []
      this.dataRows=[]
      dataT.map(truck => {
        let camion: any = truck.payload.doc.data();
        camion.uid = truck.payload.doc.id;
        this.tablaCamiones.push(camion);
        this.dataRows.push(([camion.uid, camion.Nombre, camion.noBases]));
      });
      // * Mostramos el mapa y tabla de sensores
      this.showComponents = true;
    });
  }

  // * Crear camión nuevo
  onTrucks() {
    let confirm = false;
    if (this.trucksForm.valid) {
      // this.tablaCamiones.forEach((x: any) => {
      //   if (x.noBases == this.trucksForm.value.noBases) {
      //     alert('ID (tablilla) ya utilizado')
      //     confirm = true
      //   }
      // });
      // if (confirm == false) {
        this.trucksForm.value.configVersion = `${this.trucksForm.value.noBases}-0A`
        this.trucksForm.get("noBases")?.setValue(parseInt(this.trucksForm.get("noBases")?.value || ""))
        let form = this.trucksForm.value;
        form.idBoards = ["","","",""];
        this.service.setTruckData(form).then(() => {
          alert('Camión registrado con exito');
          $("#modalNewMachine").modal("show");
        });
      // }
    } else {
      alert('Datos inválidos, favor de revisar la información')
    }
  }

  // * Resetea modal para crear camión nuevo 
  onModal() {
    this.trucksForm.reset();
    return true
  }

  // * Actualizacion de camión en la base de datos
  onEditTruck(uid: any) {
    if (this.trucksForm.valid) {
      // let configVersion = this.trucksForm.value.configVersion.split('-');
      // let numero = +configVersion[1].match(/(\d+)/g)
      // let letra: any = new String(configVersion[1].match(/([a-zA-Z ]+)/g)).codePointAt(0)
      // if ((letra + 1) === 91) {
      //   letra = 65;
      //   numero += 1;
      // } else { letra += 1; }
      // this.trucksForm.value.configVersion = '' + configVersion[0] + '-' + numero + String.fromCodePoint(letra)
      if (this.trucksForm.value.tMax < this.trucksForm.value.tMin) {
        alert('Temperatura minima no puedes er mayo a maxima');
      } else if (this.trucksForm.value.pMax < this.trucksForm.value.pMin) {
        alert('Presion minima no puedes er mayo a maxima');
      } else {
        this.service.updateTruckData(uid, this.trucksForm.value).then(() => {
          alert('Camión actualizado con exito');
          $("#modalNewMachine").modal("hide")
        }).catch(() => alert('Error'))
      }
    }
    else {
      alert('Datos inválidos, favor de revisar la información')
    }
  }

  // * Obtenemos los privilegios del usuario
  verifiPrivileges(privileges: any): boolean {
    return this.checkPrivileges.checkPrivileges(privileges, this.idMenuPage);
  }

  // * Abrir Componente detalle camion
  detalle(data: any) {
    this.tablaCamiones.forEach((camion: any) => {
      if (camion.uid === data.uid) {
        this.router.navigate(['/machine-detail/' + camion.uid]);
      }
    });
   
  }

  // * Abrir modal de editar
  edit(data: any) {
    this.tablaCamiones.forEach((camion: any) => {
      if (camion.uid === data.uid) {
        this.trucksForm.setValue(camion);
        $("#modalNewMachine").modal("show")
      }
    });
  }

   // * Eliminar camión
  delete(data: any) {
    this.tablaCamiones.forEach((camion: any) => {
      if (camion.uid === data.uid) {
        if (confirm('¿Seguro de que desea eliminar este equipo?')) {
          this.service.deleteTruckData(camion.uid).then(() => {
            alert('Camión eliminado con exito')
          });
        }
      }
    });
  }

}
