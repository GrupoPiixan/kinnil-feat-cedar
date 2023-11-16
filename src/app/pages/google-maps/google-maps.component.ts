import { DatePipe } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

// * Declaramos la variable para tener acceso a la libreria de google maps
declare const google: any;

@Component({
  selector: 'app-google-maps',
  template: `
    <div #mapElement style="height: 100%; width: 100%;"></div>
  `,
  styleUrls: []
})
export class GoogleMapsComponent implements AfterViewInit {

  // * Variable que tendra los datos del arreglo de sensores
  @Input() objectData: any = {};
  @Input() contMap: number = 0;

  // * Variable que tendra el elemento del DOM donde se va a mostrar el mapa
  @ViewChild('mapElement') mapElement: any;

  // * Variables
  map: any;
  markers: any = [];

  constructor(private datePipe: DatePipe) {}

  ngAfterViewInit(): void {
    this.loadMap();
    this.fillMap();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.fillMap();
  }

  // * Funcion que carga el mapa
  private loadMap() {
    // * Se crea una instancia del mapa
    this.map = new google.maps.Map(this.mapElement.nativeElement, {
      center: { lat: 28.650011, lng: -106.070584 },
      zoom: 3.5,
      mapTypeId: 'roadmap',
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
    });
  }

  fillMap() {
    // * Verificamos si existen marcadarores para limpiarlos
    if (this.markers.length > 0) {
      this.markers.forEach((marker: any) => {
        // * Limpiamos los marcadores del mapa
        marker.setMap(null);
      });
      this.markers = [];
    }
    
    // * Ciclamos por cada elemento del objeto JSON y se crea un marcador en el mapa
    this.objectData.forEach((element: any, index: number) => {

      // * Se crea un marcador en el mapa
      var marker = new google.maps.Marker({
        position: {
          lat: parseFloat(element.sensor.ubi.lat),
          lng: parseFloat(element.sensor.ubi.lon),
        },
        // animation: google.maps.Animation.BOUNCE,
      });

      // * Agregamos el marcador al mapa
      this.markers.push(marker);
      marker.setMap(this.map);

      // * Se crea una ventana de información
      let infowindow: { open: (arg0: { anchor: any; map: any; shouldFocus: boolean; }) => void; };

      // * Verificamos que si tenga información del camion
      if (element.camion !== null) {
        // * Si tiene información del camion, se crea una ventana de información
        infowindow = new google.maps.InfoWindow({
          content:
          `
            <ul style="color: black">
              <li><b>ID Kinnil:</b> ${element.sensor.id}</li>
              <li><b>Nombre:</b> ${element.camion.Nombre}</li>
              <li><b>Marca:</b> ${element.camion.marca}</li>
              <li><b>Modelo:</b> ${element.camion.modelo}</li>
              <li><b>Placa:</b> ${element.camion.placa}</li>
              <li><b>Tipo:</b> ${element.camion.tipo}</li>
              <li><b>Última hora de reporte:</b> ${this.timestampToDate(element.sensor.creacionRegistro.seconds)}</li>
            </ul>
          `
        });
      } else {
        // * Si no tiene información del camion, se crea una ventana de información
        infowindow = new google.maps.InfoWindow({
          content:
          `
            <ul style="color: black">
              <li>Sin camión asignado</li>
            </ul>
          `
        });
      }

      // * Se agrega un evento al marcador para que se muestre la ventana de información
      marker.addListener("click", () => {
        infowindow.open({
          anchor: marker,
          map: this.map,
          shouldFocus: false,
        });
      });
    });
  }

  private timestampToDate(fecha:any){
    let data=new Date(fecha * 1000);
    return this.datePipe.transform(data , 'dd/MM/YY HH:mm:ss');
  } 

}
