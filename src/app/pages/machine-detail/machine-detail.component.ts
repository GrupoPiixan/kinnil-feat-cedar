import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { GetDataService } from 'src/app/services/get-data.service';

@Component({
  selector: 'app-machine-detail',
  templateUrl: './machine-detail.component.html',
  styleUrls: ['./machine-detail.component.css']
})
export class MachineDetailComponent implements OnInit {

  dataTable: any = {
    messageEmpty: 'Ningún dato disponible en esta tabla',
    showSearch: true,
    showData: [5, 10, 15, 20, 25],
    headerRow: [{
      text: '#',
      show: true
    }, {
      text: 'Fecha de cierre',
      show: true
    }, {
      text: 'Orden de trabajo',
      show: true
    }, {
      text: 'Mecánico',
      show: true
    }, {
      text: 'Conductor',
      show: true
    }, {
      text: 'Km',
      show: true
    },{
      text: 'Km',
      show: true
    },{
      text: 'Tipo de falla',
      show: true
    },{
      text: 'Detalles ',
      show: true
    }],
    buttons: {
      detail: {
        show: false,
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
  dataRows:Array<any>=[];

  
  camion:any

    // * Variable para guardar el uid del usuario y su nombre
    uid: string = '';

  constructor(private route: ActivatedRoute,  private service: GetDataService) { }

  ngOnInit(): void {
       // * Obtenemos el uid del usuario a consultar por la url
       this.uid = this.route.snapshot.paramMap.get("uid") || '';
       this.service.getTrucksData().doc(this.uid).snapshotChanges().subscribe(dataT => {
        this.camion = dataT.payload.data()
        console.log(this.camion)
        
      });
    }

  

}
