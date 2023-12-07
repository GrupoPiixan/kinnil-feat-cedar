import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

// * Service
import { GetDataService } from 'src/app/services/get-data.service';

// * Variable for SheetJS
import * as XLSX from '@sheet/chart';

@Component({
  selector: 'app-bomb-detail',
  templateUrl: './bomb-detail.component.html',
  styleUrls: ['./bomb-detail.component.css']
})
export class BombDetailComponent implements OnInit {

  // * Formulario de reporte
  reportForm = new FormGroup({
    initDate: new FormControl('', [Validators.required]),
    finishDate: new FormControl('', [Validators.required]),
  });

  title = 'GCC';
  types: any = 'LineChart';
  datos: any = [];
  columnNames = ['Temperatura', 'Presión'];

  width = 550;
  height = 400;

  lat = 28.697674082872545;
  lng = -106.14222521042797;

  camiones: any = [];
  sensores: any = [];
  tablaSensores: any = [];
  truck: any = []

  baseNumber: number = 0;

  // * rango de grafica
  rango: Date = new Date();
  fecha = new Date();
  fechaHoy = new Date();
  fecha_Rango: Date;
  fecha_RangoFinal: any = null;

  presion: any = [];
  temperatura: any = []
  categorias: any = [];
  //  chartOptions: Highcharts.Options = { }

  // * Variables para grafica con zoom
  public primaryXAxis: any;
  public chartData: any[] = [];
  public titlee: string = 'Grafica Zoom';
  public primaryYAxis: any;
  public border: any;
  public zoom: any;
  public animation: any;
  public legend: any;

  public crosshair: any;
  public tooltip: any;
  public marker: any;

  series1: any[] = [];
  point1: any;
  value: number = 80;
  yMin: number = 2000;
  yMax: number = 0;
  uid: string = '';

  constructor(private route: ActivatedRoute, private service: GetDataService, private datePipe: DatePipe) {
    const hoy = new Date();
    const dia = hoy.getDate()
    const mes = hoy.getMonth();
    const anio = hoy.getFullYear();
    this.fecha_Rango = new Date(anio, mes, dia);
    this.fecha = new Date(anio, mes, dia);
    this.fecha.setDate(this.fecha.getDate() + 1)
  }

  ngOnInit(): void {
    this.uid = this.route.snapshot.paramMap.get("uid") || '';
    this.service.getData('quectel', this.uid).subscribe(dataSensor => {
      dataSensor.map(sensor => {
        this.service.getTruckData(this.uid).subscribe(dataT => {
          dataT.map(camion => {
            this.truck = camion.payload.doc.data();
            this.tablaSensores = { docIdSensor: sensor.payload.doc.id, sensor: sensor.payload.doc.data(), camion: this.truck };
            this.baseNumber = this.truck.idBoards.indexOf(this.tablaSensores.sensor.idBoard) + 1;
            console.log("TABLA SENSORES",this.tablaSensores)
          });
        });
      });
    });
    
    /*this.service.getTruckData(this.uid).subscribe(dataT => {
      
      dataT.map(camion => {
        this.truck = camion.payload.doc.data();
        console.log("TRUCK", this.truck);
        this.service.getData('quectel', this.uid).subscribe(dataSensor => {
          dataSensor.map(sensor => {
            this.tablaSensores = { docIdSensor: sensor.payload.doc.id, sensor: sensor.payload.doc.data(), camion: this.truck };
            console.log(this.tablaSensores)
          });
        });
      })
    });*/
  }

  getTempBgColor() {
    return this.tablaSensores?.sensor?.a2 >= 0 ? 'bg-success' : this.tablaSensores > 30 ? 'bg-danger' : 'bg-danger';
  }
  getPressBgColor() {
    return this.tablaSensores?.sensor?.a1 >= 0 ? 'bg-warning' : this.tablaSensores >= 3 ? 'bg-success' : 'bg-danger';
  }

  timestampToDate(fecha: any) {
    let data = new Date(fecha * 1000);
    return this.datePipe.transform(data, 'dd/MM/YY HH:mm:ss');
  }

  async generateReport() {
    let tbody = [[]];
    const reportHeader =
      [
        [null],
        [null],
        [null, `Fecha Inicio: ${this.reportForm.value.initDate}`, null, `Fecha Final: ${this.reportForm.value.finishDate}`],
        [null],
        [null],
        ['Registro', 'Día', 'Hora', 'RPM', 'FT/SEC', 'Indicador silo 1 abierto en modo manual', 'Indicador silo 2 abierto en modo manual', 'Indicador silo 3 abierto en modo manual',
      'Indicador bandas encendidas','Alerta mantenimento banda, horas cumplidas']
      ];

    const respReport = await this.service.generateReport(this.reportForm.value.initDate, this.reportForm.value.finishDate);
    respReport.forEach(dataReport => {
      for (let i = 0; i < dataReport.docs.length; i++) {
        const element = dataReport.docs[i].data() as {
          r_RPM: string,
          r_ftMin: string,
          r_manualSilo1: string,
          r_manualSilo2: string,
          r_manualSilo3: string,
          r_conveyorOn: string,
          r_alertMaintenance: string
          creacionRegistro: {
            nanoseconds: number,
            seconds: number
          }
        };
        
        console.log("Elemento", element)
        const date = new Date(element.creacionRegistro.seconds * 1000);

        const data = [
          `${date.getFullYear()}/${((date.getMonth() + 1) < 10) ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}/${(date.getDate() < 10) ? '0' + date.getDate() : date.getHours()} ${(date.getHours() < 10) ? '0' + date.getHours() : date.getHours()}:${(date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()}:${(date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds()}`,
          `${((date.getMonth() + 1) < 10) ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}/${(date.getDate() < 10) ? '0' + date.getDate() : date.getHours()}/${date.getFullYear()}`,
          `${(date.getHours() < 10) ? '0' + date.getHours() : date.getHours()}:${(date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()}:${(date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds()}`,
          element.r_RPM.toString(),
          element.r_ftMin.toString(),
          element.r_manualSilo1.toString(),
          element.r_manualSilo2.toString(),
          element.r_manualSilo3.toString(),
          element.r_conveyorOn.toString(),
          element.r_alertMaintenance.toString()
        ];

        tbody.push(data as [])
      }

      var wb = XLSX.utils.book_new();
      var ws = XLSX.utils.aoa_to_sheet([[]]);

      XLSX.utils.book_append_sheet(wb, ws, "KinnilCM-ReporteBase");
      XLSX.utils.sheet_add_aoa(ws, reportHeader, { origin: "A1" });
      XLSX.utils.sheet_add_aoa(ws, tbody, { origin: "A6" });

      /*if (!ws["!images"]) ws["!images"] = [];
      ws["!images"].push({
        "!link": "http://sheetjs.com/logo.png",
        '!pos': { x: 700, y: 300, w: 64, h: 64 },
        "!datatype": "remote"
      });*/

      if (!ws['!cols']) ws['!cols'] = [];
      ws['!cols'][0] = { width: 20 };
      ws['!cols'][1] = { width: 20 };
      ws['!cols'][2] = { width: 20 };
      ws['!cols'][3] = { width: 20 };
      ws['!cols'][4] = { width: 20 };
      ws['!cols'][5] = { width: 20 };

      XLSX.writeFile(wb, "KinnilCM-ReporteBase.xlsx", { bookSST: true, cellStyles: true, bookImages: true });
    });
  }

}
