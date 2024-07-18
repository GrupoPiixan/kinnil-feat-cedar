import { DatePipe, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { environment } from '../../../environments/environment';

// * Service
import { GetDataService } from 'src/app/services/get-data.service';
import { UsersService } from '../../services/users.service';

// * Declaramos la variable para tener acceso a la librería de socketIO
declare const io: any;

// * Variable for SheetJS
declare const XLSX: any;

// * Jquery
declare var $: any;

@Component({
  selector: 'app-bomb-detail',
  templateUrl: './bomb-detail.component.html',
  styleUrls: ['./bomb-detail.component.css']
})
export class BombDetailComponent implements OnInit {
  sliderValue1: number = 0;
  sliderValue2: number = 0;
  sliderValue3: number = 0;
  numberSilo: number = 0;
  setSilo: number = 0;

  allUsersWithNotificationsEnabled: any[] = [];

  onInputChange1(event: any) {
    this.sliderValue1 = event.target.value;
  }
  onInputChange2(event: any) {
    this.sliderValue2 = event.target.value;
  }
  onInputChange3(event: any) {
    this.sliderValue3 = event.target.value;
  }
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

  timeTimeout: number = 10000;

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

  deshabilitarBotonS1: boolean = false;
  deshabilitarBotonS2: boolean = false;
  deshabilitarBotonS3: boolean = false;
  deshabilitarBotonC: boolean = false;

  deshabilitarBotonStopS1: boolean = false;
  deshabilitarBotonStopS2: boolean = false;
  deshabilitarBotonStopS3: boolean = false;
  deshabilitarBotonStopC: boolean = false;

  socket: any;

  mySetTimeout: any;

  userIP: any;
  user: any;

  constructor(
    private route: ActivatedRoute,
    private service: GetDataService,
    private datePipe: DatePipe,
    private usersService: UsersService
  ) {
    const hoy = new Date();
    const dia = hoy.getDate()
    const mes = hoy.getMonth();
    const anio = hoy.getFullYear();
    this.fecha_Rango = new Date(anio, mes, dia);
    this.fecha = new Date(anio, mes, dia);
    this.fecha.setDate(this.fecha.getDate() + 1);
  }

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem("Usuario") || '{}');
    this.uid = this.route.snapshot.paramMap.get("uid") || '';

    this.getAllUsersWithNotificationsEnabled();

    this.service.getData('quectel', this.uid).subscribe(dataSensor => {
      dataSensor.map(sensor => {
        this.service.getTruckData(this.uid).subscribe(dataT => {
          dataT.map(camion => {
            this.truck = camion.payload.doc.data();
            this.tablaSensores = { docIdSensor: sensor.payload.doc.id, sensor: sensor.payload.doc.data(), camion: this.truck };
            this.baseNumber = this.truck.idBoards.indexOf(this.tablaSensores.sensor.id) + 1;
            if (this.mySetTimeout !== undefined) {
              clearTimeout(this.mySetTimeout);
              this.mySetTimeout = undefined;
              this.unlockButtons();
            }
            this.selectSlider();
            this.lockButtons();
          });
        });
      });
    });

    this.initSocketIO();
  }

  selectSlider() {
    this.sliderValue1 = this.tablaSensores.sensor.p_s1;
    this.sliderValue2 = this.tablaSensores.sensor.p_s2;
    this.sliderValue3 = this.tablaSensores.sensor.p_s3;
  }

  openAlertConfirm(silo: number) {
    this.numberSilo = silo;
    $('#modalAlert').modal('show')
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
    if (this.reportForm.valid) {
      document.getElementById('fornDownloadReport')!.classList.add('d-none');
      document.getElementById('contenedor')!.classList.remove('d-none');
      let tbody = [[]];
      const reportHeader =
        [
          [null],
          [null],
          [null, `Fecha Inicio: ${this.reportForm.value.initDate}`, null, `Fecha Final: ${this.reportForm.value.finishDate}`],
          [null],
          [null],
          ['Registro', 'Día', 'Hora', 'RPM', 'FT/SEC', 'Indicador silo 1 abierto en modo manual', 'Indicador silo 2 abierto en modo manual', 'Indicador silo 3 abierto en modo manual',
            'Indicador bandas encendidas', 'Alerta mantenimento banda, horas cumplidas']
        ];

      const respReport = await this.service.generateReport(this.reportForm.value.initDate, this.reportForm.value.finishDate);
      respReport.forEach(dataReport => {
        for (let i = 0; i < dataReport.docs.length; i++) {
          const element = dataReport.docs[i].data() as {
            rpm: string,
            ftmin: string,
            st_s1: string,
            st_s2: string,
            st_s3: string,
            bands: string,
            mtto: string
            creacionRegistro: {
              nanoseconds: number,
              seconds: number
            }
          };

          const date = new Date(element.creacionRegistro.seconds * 1000);

          const data = [
            `${date.getFullYear()}/${((date.getMonth() + 1) < 10) ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}/${(date.getDate() < 10) ? '0' + date.getDate() : date.getHours()} ${(date.getHours() < 10) ? '0' + date.getHours() : date.getHours()}:${(date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()}:${(date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds()}`,
            `${((date.getMonth() + 1) < 10) ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)}/${(date.getDate() < 10) ? '0' + date.getDate() : date.getHours()}/${date.getFullYear()}`,
            `${(date.getHours() < 10) ? '0' + date.getHours() : date.getHours()}:${(date.getMinutes() < 10) ? '0' + date.getMinutes() : date.getMinutes()}:${(date.getSeconds() < 10) ? '0' + date.getSeconds() : date.getSeconds()}`,
            element?.rpm?.toString() || '',
            element?.ftmin?.toString() || '',
            element?.st_s1?.toString() || '',
            element?.st_s2?.toString() || '',
            element?.st_s3?.toString() || '',
            element?.bands?.toString() || '',
            element?.mtto?.toString() || ''
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
        document.getElementById('fornDownloadReport')!.classList.remove('d-none');
        document.getElementById('contenedor')!.classList.add('d-none');
      });

    } else {
      alert("Debes de seleccionar un rango de fechas para poder consultar el reporte");
    }

  }

  initSocketIO() {
    this.socket = io(environment.urlSocketIO);

    this.socket.on('connect', () => {
    });
  }

  // * Methods to run or stop a belt and to open or close a silo
  openSilo(silo: number) {
    // * Log is saved
    var equipment = '';
    var percentaje = 0;
    if (silo == 1) { equipment = 'Silo 1'; percentaje = this.sliderValue1 }
    if (silo == 2) { equipment = 'Silo 2'; percentaje = this.sliderValue2 }
    if (silo == 3) { equipment = 'Silo 3'; percentaje = this.sliderValue3 }
    this.createLog('Abrir silo', equipment, percentaje);

    // * Instructions to open silo
    this.socket.emit('web_to_server', {
      board_id: this.uid,
      type: 'write',
      silo: silo,
      value: "OPEN"
    });

    this.lockAllButtons();

    this.mySetTimeout = setTimeout(() => {
      this.unlockButtons();
      this.lockButtons();
    }, this.timeTimeout);

    this.selectSlider();

    $('#modalAlert').modal('hide')

  }

  closedSilo(silo: number) {
    // * Log is saved
    var equipment = '';
    var percentaje = 0;
    if (silo == 1) { equipment = 'Silo 1'; percentaje = this.sliderValue1 }
    if (silo == 2) { equipment = 'Silo 2'; percentaje = this.sliderValue2 }
    if (silo == 3) { equipment = 'Silo 3'; percentaje = this.sliderValue3 }
    this.createLog('Cerrar silo', equipment, percentaje);

    this.socket.emit('web_to_server', {
      board_id: this.uid,
      type: 'write',
      silo: silo,
      value: "CLOSE"
    });

    this.lockAllButtons();

    this.mySetTimeout = setTimeout(() => {
      this.unlockButtons();
      this.lockButtons();
    }, this.timeTimeout);

  }

  updatePercentage() {
    let valueSlider = 0;

    switch (this.setSilo) {
      case 1:
        valueSlider = this.sliderValue1;
        break;
      case 2:
        valueSlider = this.sliderValue2;
        break;
      case 3:
        valueSlider = this.sliderValue3;
        break;
    }

    // * Log is saved
    var equipment = '';
    if (this.setSilo == 1) { equipment = 'Silo 1'; }
    if (this.setSilo == 2) { equipment = 'Silo 2'; }
    if (this.setSilo == 3) { equipment = 'Silo 3'; }
    this.createLog('Actualizar porcentaje de apertura', equipment, valueSlider);

    this.socket.emit('web_to_server', {
      board_id: this.uid,
      type: "write",
      silo_pos: this.setSilo,
      value: valueSlider
    });

    switch (this.setSilo) {
      case 1:
        document.getElementById('contenedor1')!.classList.remove('d-none');
        document.getElementById('sliderText1')!.classList.add('d-none');
        document.getElementById('sliderButton1')!.classList.add('d-none');
        document.getElementById('myRange1')!.classList.add('d-none');
        break;
      case 2:
        document.getElementById('contenedor2')!.classList.remove('d-none');
        document.getElementById('sliderText2')!.classList.add('d-none');
        document.getElementById('sliderButton2')!.classList.add('d-none');
        document.getElementById('myRange2')!.classList.add('d-none');
        break;
      case 3:
        document.getElementById('contenedor3')!.classList.remove('d-none');
        document.getElementById('sliderText3')!.classList.add('d-none');
        document.getElementById('sliderButton3')!.classList.add('d-none');
        document.getElementById('myRange3')!.classList.add('d-none');
        break;
    }

    $('#modalUpdate').modal('hide')
    this.lockAllButtons();

    setTimeout(() => {
      switch (this.setSilo) {
        case 1:
          document.getElementById('contenedor1')!.classList.add('d-none');
          document.getElementById('sliderText1')!.classList.remove('d-none');
          document.getElementById('sliderButton1')!.classList.remove('d-none');
          document.getElementById('myRange1')!.classList.remove('d-none');
          break;
        case 2:
          document.getElementById('contenedor2')!.classList.add('d-none');
          document.getElementById('sliderText2')!.classList.remove('d-none');
          document.getElementById('sliderButton2')!.classList.remove('d-none');
          document.getElementById('myRange2')!.classList.remove('d-none');
          break;
        case 3:
          document.getElementById('contenedor3')!.classList.add('d-none');
          document.getElementById('sliderText3')!.classList.remove('d-none');
          document.getElementById('sliderButton3')!.classList.remove('d-none');
          document.getElementById('myRange3')!.classList.remove('d-none');
          break;
      }
      this.unlockButtons();
      this.lockButtons();
      this.selectSlider();
      this.updateNotDone();
    }, this.timeTimeout);

  }

  // * Methods to run or stop band

  stoppedBand() {
    // * Log is saved
    this.createLog('Detener banda', 'Banda', 'N/A');

    this.socket.emit('web_to_server', {
      board_id: this.uid,
      type: "write",
      bands: "stop"
    });

    this.lockAllButtons();

    this.mySetTimeout = setTimeout(() => {
      this.unlockButtons();
      this.lockButtons();
    }, this.timeTimeout);
  }

  runBand() {
    // * Log is saved
    this.createLog('Correr banda', 'Banda', 'N/A');

    this.socket.emit('web_to_server', {
      board_id: this.uid,
      type: "write",
      bands: "run"
    });

    this.lockAllButtons();

    this.mySetTimeout = setTimeout(() => {
      this.unlockButtons();
      this.lockButtons();
    }, this.timeTimeout);
  }

  // *Methods to obtain IP location information

  getIP = async () => {
    return await fetch('https://api.ipify.org?format=json', {
      method: 'GET'
    })
      .then(response =>
        response.json()).catch((e) => {
          console.log("erros", e);
        });
  }

  getInfo = async (ip: string) => {
    return await fetch('https://ipwhois.app/json/' + ip + '?lang=es', {
      method: 'GET'
    })
      .then(response =>
        response.json()).catch((e) => {
          console.log("erros", e);
        });
  }

  // * Method to create logs
  async createLog(action: string, equipment: string, percentage: any) {
    this.userIP = (await this.getIP()).ip;

    const infoUser = await this.getInfo(this.userIP);

    const logs = {
      uidUser: this.user.uid,
      role: this.user.role,
      userName: this.user.userName,
      email: this.user.email,
      ip: this.userIP,
      city: infoUser.city,
      region: infoUser.region,
      latitud: infoUser.latitude,
      longitud: infoUser.longitude,
      country: infoUser.country,
      country_code: infoUser.country_code,
      oraganization: infoUser.org,
      dateRegister: new Date().toISOString().split('T')[0],
      hourRegister: this.getCurrentTime(),
      action: action,
      equipment: equipment,
      percentage: percentage
    };

    // * Save log in database
    await this.service.createLog(logs);

    let restOfTheMessage = '';

    // * Message to send to all users by email, sms and/or telegram
    switch (action) {
      case 'Abrir silo':
        restOfTheMessage = `El usuario ${logs.userName} ha abierto el ${logs.equipment} al ${logs.percentage}% en ${this.tablaSensores?.camion?.Nombre} - Base ${this.baseNumber} en el sistema Kinnil Maxxim`;
        break;
      case 'Cerrar silo':
        restOfTheMessage = `El usuario ${logs.userName} ha cerrado el ${logs.equipment} en ${this.tablaSensores?.camion?.Nombre} - Base ${this.baseNumber} en el sistema Kinnil Maxxim`;
        break;
      case 'Actualizar porcentaje de apertura':
        restOfTheMessage = `El usuario ${logs.userName} ha actualizado el porcentaje de apertura del ${logs.equipment} al ${logs.percentage}% en ${this.tablaSensores?.camion?.Nombre} - Base ${this.baseNumber} en el sistema Kinnil Maxxim`;
        break;
      case 'Detener banda':
        restOfTheMessage = `El usuario ${logs.userName} ha detenido la banda en ${this.tablaSensores?.camion?.Nombre} - Base ${this.baseNumber} en el sistema Kinnil Maxxim`;
        break;
      case 'Correr banda':
        restOfTheMessage = `El usuario ${logs.userName} ha encendido la banda en ${this.tablaSensores?.camion?.Nombre} - Base ${this.baseNumber} en el sistema Kinnil Maxxim`;
        break;
    }

    // * Send notification to all users by email, sms and/or telegram
    this.allUsersWithNotificationsEnabled.map(async (user) => {
      await this.service.generateNotification({
          telegram: user.telegramNotify,
          telegramChatId: user.telegramChatID,
          telegramMessage: restOfTheMessage,
      
          sms: user.smsNotify,
          smsNumber: Number(user.telephone),
          smsMessage: restOfTheMessage,
      
          email: user.emailNotify,
          emailTo: user.email,
          emailSubject: "Kinnil Maxxim - Notification System",
          emailMessage: restOfTheMessage
      });
    });
  }

  // * Locks all buttons when opening or closing a silo or running or stopping the conveyor
  lockAllButtons() {
    this.deshabilitarBotonS1 = true;
    this.deshabilitarBotonS2 = true;
    this.deshabilitarBotonS3 = true;
    this.deshabilitarBotonC = true;

    this.deshabilitarBotonStopS1 = true;
    this.deshabilitarBotonStopS2 = true;
    this.deshabilitarBotonStopS3 = true;
    this.deshabilitarBotonStopC = true;

  }

  // * Return the buttons to the original state
  unlockButtons() {
    this.deshabilitarBotonStopS1 = false;
    this.deshabilitarBotonStopS2 = false;
    this.deshabilitarBotonStopS3 = false;
    this.deshabilitarBotonS1 = false;
    this.deshabilitarBotonS2 = false;
    this.deshabilitarBotonS3 = false;
    this.deshabilitarBotonC = false;
    this.deshabilitarBotonStopC = false;
  }

  // * Blocks the buttons according to the status they have in the database
  lockButtons() {
    if (this.tablaSensores.sensor.st_s1 === 'OPEN') {
      this.deshabilitarBotonS2 = true;
      this.deshabilitarBotonS3 = true;
      return;
    } else if (this.tablaSensores.sensor.st_s1 === 'CLOSED') {
      this.deshabilitarBotonS2 = false;
      this.deshabilitarBotonS3 = false;
    }

    if (this.tablaSensores.sensor.st_s2 === 'OPEN') {
      this.deshabilitarBotonS1 = true;
      this.deshabilitarBotonS3 = true;
      return;
    } else if (this.tablaSensores.sensor.st_s2 === 'CLOSED') {
      this.deshabilitarBotonS1 = false;
      this.deshabilitarBotonS3 = false;
    }

    if (this.tablaSensores.sensor.st_s3 === 'OPEN') {
      this.deshabilitarBotonS1 = true;
      this.deshabilitarBotonS2 = true;
      return;
    } else if (this.tablaSensores.sensor.st_s3 === 'CLOSED') {
      this.deshabilitarBotonS1 = false;
      this.deshabilitarBotonS2 = false;
    }
  }

  setNumberSilo(silo: number) {
    this.setSilo = silo;
  }

  updateNotDone() {
    if (this.sliderValue1 === this.tablaSensores.sensor.p_s1) {
      document.getElementById('alertNoUpdate')!.classList.remove('d-none');
    }
    if (this.sliderValue2 === this.tablaSensores.sensor.p_s2) {
      document.getElementById('alertNoUpdate')!.classList.remove('d-none');
    }
    if (this.sliderValue3 === this.tablaSensores.sensor.p_s3) {
      document.getElementById('alertNoUpdate')!.classList.remove('d-none');
    }
  }

  getCurrentTime = () => {
    const ahora = new Date();
    const hora = ahora.getHours();
    const minutos = ahora.getMinutes();
    const segundos = ahora.getSeconds();

    // Formateamos la hora para asegurarnos de que tenga dos dígitos
    const horaFormateada = hora < 10 ? '0' + hora : hora;
    const minutosFormateados = minutos < 10 ? '0' + minutos : minutos;
    const segundosFormateados = segundos < 10 ? '0' + segundos : segundos;

    // Devolvemos la hora en formato HH:MM:SS
    return `${horaFormateada}:${minutosFormateados}:${segundosFormateados}`;
  }

  getAllUsersWithNotificationsEnabled() {
    this.usersService.getAllUsersWithNotificationsEnabled().subscribe(data => {
      data.docs.map(user => {
        this.allUsersWithNotificationsEnabled.push(user.data());
      });
    });
  }
}
