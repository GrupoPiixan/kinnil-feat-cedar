import { Component, OnInit, ViewChild } from '@angular/core';

import { environment } from '../../../environments/environment';

// * Services
import { DatePipe } from '@angular/common';
import { GetDataService } from '../../services/get-data.service';

import { Router } from '@angular/router';
import { TableComponent } from '../table/table.component';
import { GoogleMapsComponent } from '../google-maps/google-maps.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  @ViewChild(TableComponent) tabla: any;
  @ViewChild(GoogleMapsComponent) mapa: any;

  private timeoutId: any;

  tablaSensores: any = [];
  tablaSensoresMap: string = '';
  sensoresTabla: any = {
    messageEmpty: 'No hay sensores asignados',
    showSearch: true,
    showData: [5, 10, 15, 20, 25],
    headerRow: [{
      text: 'ID sensor',
      show: true
    }, {
      text: 'Locación',
      show: true
    }, {
      text: 'Velocidad banda underbin en ft/sec',
      show: true
    }, {
      text: 'Velocidad banda underbin RPM',
      show: true
    }, {
      text: 'Indicador silo 1 abierto en modo manual',
      show: true
    }, {
      text: 'Indicador silo 2 abierto en modo manual',
      show: true
    }, {
      text: 'Indicador silo 3 abierto en modo manual',
      show: true
    }, {
      text: 'Indicador bandas encendidas',
      show: true
    }, {
      text: 'Alerta mantenimento banda, horas cumplidas',
      show: true
    }, {
      text: 'Alarma del RPM',
      show: true
    }, {
      text: 'Posición Silo 1',
      show: true
    }, {
      text: 'Posición Silo 2',
      show: true
    }, {
      text: 'Posición Silo 3',
      show: true
    }],
    buttons: {
      detail: {
        show: true,
        text: 'Detail',
      },
      edit: {
        show: false,
        text: 'Edit',
      },
      delete: {
        show: false,
        text: 'Delete',
      }
    }
  };
  dataRows: Array<any> = [];

  showComponents = false;

  contMap: number = 0;

  contDeviceActive: number = 0;
  contDeviceNotActive: number = 0;
  contDevicePause: number = 0;
  contDeviceInactive: number = 0;
  contDeviceOff: number = 0;

  constructor(private service: GetDataService, private datePipe: DatePipe, private router: Router) { }

  async ngOnInit() {
    // * Obtenemos todos los camiones
    this.service.getAllTrucksData().subscribe(dataCamion => {
      let camionn: any = null;
      //* Ciclamos todos los camiones existentes
      dataCamion.map(camion => {
        camionn = camion.payload.doc.data()
        this.tablaSensores = [];
        this.contDeviceActive = 0;
        this.contDeviceNotActive = 0;
        
        for (let i = 0; i < camionn.idBoards.length; i++) {
          this.tableFill(camionn, camionn.idBoards[i]);
        }
      });
    });
    //this.timerHora();
  }

  timestampToDate(fecha: any) {
    let data = new Date(fecha * 1000);
    return this.datePipe.transform(data, 'dd/MM/YY HH:mm:ss');
  }

  detalle(data: any) {
    this.router.navigate(['/bomb-detail/' + data.idsensor]);
  }

  private tableFill(camionn: any, idBoard: string) {
    this.service.getData('quectel', idBoard).subscribe(dataSensor => {
      // * Si el camion esta asignado a un sensor se agrega al arreglo de sensores
      dataSensor.map(sensor => {
        let data: any = sensor.payload.doc.data();
        let objeto = this.tablaSensores.find((el: any) => idBoard == el.IdSensor);

        if (this.tablaSensores.indexOf(objeto) === -1) {
          this.tablaSensores.push({
            IdSensor: idBoard,
            sensor: data,
            camion: camionn
          });
        } else {
          let index = this.tablaSensores.indexOf(objeto)
          this.tablaSensores[index].sensor = data;
        }
      });

      // * Igualamos el arreglo de sensores a otra variable para enviarla al mapa
      this.tablaSensoresMap = this.tablaSensores;
      this.dataRows = [];

      this.contDeviceActive = this.tablaSensores.filter((el: { sensor: { estatus: string }; }) => el.sensor.estatus === 'Activo').length;
      this.contDeviceNotActive = this.tablaSensores.filter((el: { sensor: { estatus: string }; }) => el.sensor.estatus !== 'Activo').length;
      this.contDevicePause = this.tablaSensores.filter((el: { sensor: { estatus: string }; }) => el.sensor.estatus === 'En Pausa').length;
      this.contDeviceInactive = this.tablaSensores.filter((el: { sensor: { estatus: string }; }) => el.sensor.estatus === 'Inactivo').length;
      this.contDeviceOff = this.tablaSensores.filter((el: { sensor: { estatus: string }; }) => el.sensor.estatus === 'Apagado').length;
      console.log("DATA TABLE", this.tablaSensores);
      
      // * Llenamos la tabla con los datos
      this.tablaSensores.forEach((data: any) => {
        this.dataRows.push([
          data.sensor.id,
          data.camion.Nombre,
          data.sensor.ftmin,
          data.sensor.rpm,
          data.sensor.st_s1,
          data.sensor.st_s2,
          data.sensor.st_s3,
          data.sensor.bands,
          data.sensor.mtto,
          data.sensor.al_1,
          data.sensor.p_s1,
          data.sensor.p_s2,
          data.sensor.p_s3,
        ]);
      });

      // * Mostramos el mapa y tabla de sensores
      this.showComponents = true;

      // * Actualizamos el mapa en dashboard
      // this.mapa?.fillMap();
      this.contMap++;
    });
  }

  // * Método para dejar numero con 2 decimales y con coma
  private numberFormat(number: any) {
    return number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  }

  //* Timer para actualizar hora a tiempo real 
  timerHora() {
    const time = new Date()
    this.timeoutId = setTimeout(() => {
      for (let index = 0; index < this.dataRows.length; index++) {
        const status = this.dataRows[index][2];
        if (status == 'Activo') {
          this.dataRows[index][3] = this.datePipe.transform(time, 'dd/MM/YY HH:mm:ss');
        }
      }
      clearTimeout(this.timeoutId);
      this.timerHora()
    }, 30000)
  }
}
