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
      text: 'ID',
      show: false
    }, {
      text: 'Nombre',
      show: true
    }, {
      text: 'Estatus',
      show: true
    }, {
      text: 'Última hora de reporte',
      show: true
    }, {
      text: 'Set point presión',
      show: true
    }, {
      text: 'minPressure',
      show: false
    }, {
      text: 'maxPressure',
      show: false
    }, {
      text: 'Presión',
      show: true
    }, {
      text: 'Pico de presión',
      show: true
    }, {
      text: 'Temperatura',
      show: true
    }, {
      text: 'Pico de temperatura',
      show: true
    }, {
      text: 'Set point temperatura',
      show: true
    }, {
      text: 'minTemp',
      show: false
    }, {
      text: 'maxTemp',
      show: false
    }, {
      text: 'Alarma',
      show: false
    }, {
      text: 'Comentario',
      show: false
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
        this.tableFill(camionn);
      });
    });
    this.timerHora();
  }

  timestampToDate(fecha: any) {
    let data = new Date(fecha * 1000);
    return this.datePipe.transform(data, 'dd/MM/YY HH:mm:ss');
  }

  detalle(data: any) {
    this.router.navigate(['/bomb-detail/' + data.id]);
  }

  private tableFill(camionn: any) {
    this.service.getData('quectel', camionn.IDSensor).subscribe(dataSensor => {
      // * Si el camion esta asignado a un sensor se agrega al arreglo de sensores
      dataSensor.map(sensor => {
        let data: any = sensor.payload.doc.data();
        let objeto = this.tablaSensores.find((el: { IdSensor: any; }) => el.IdSensor == data.id);
        if (this.tablaSensores.indexOf(objeto) == -1) {
          this.tablaSensores.push({
            IdSensor: camionn.IDSensor,
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

      // * Llenamos la tabla con los datos
      this.tablaSensores.forEach((data: any) => {
        this.dataRows.push([
          data.sensor.id,
          data.camion.Nombre,
          data.sensor.estatus,
          this.timestampToDate(data.sensor.creacionRegistro.seconds),
          data.camion.pSPoint + ' psi',
          data.camion.pMin,
          data.camion.pMax,

          this.numberFormat(parseFloat(data.sensor.a1)) + ' psi',
          this.numberFormat(parseFloat(data.sensor.m1)) + ' psi',

          this.numberFormat(parseFloat(data.sensor.a2)) + ' ºC',
          this.numberFormat(parseFloat(data.sensor.m2)) + ' ºC',

          data.camion.tSPoint + ' ºC',
          data.camion.tMin,
          data.camion.tMax,
          '-----', '-----'
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
