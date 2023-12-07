import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { GetDataService } from 'src/app/services/get-data.service';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

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

  idsForm = new FormGroup({
    idBoard1: new FormControl('', [Validators.required]),
    idBoard2: new FormControl('', [Validators.required]),
    idBoard3: new FormControl('', [Validators.required]),
    idBoard4: new FormControl('', [Validators.required]),
  });

  camion:any

    // * Variable para guardar el uid del usuario y su nombre
    uid: string = '';

  constructor(private route: ActivatedRoute,  private service: GetDataService) { }

  ngOnInit(): void {
       // * Obtenemos el uid del usuario a consultar por la url
       this.uid = this.route.snapshot.paramMap.get("uid") || '';
       this.service.getTrucksData().doc(this.uid).snapshotChanges().subscribe(dataT => {
        this.camion = dataT.payload.data();
        this.idsForm.get('idBoard1')?.setValue(this.camion.idBoards[0]);
        this.idsForm.get('idBoard2')?.setValue(this.camion.idBoards[1]);
        this.idsForm.get('idBoard3')?.setValue(this.camion.idBoards[2]);
        this.idsForm.get('idBoard4')?.setValue(this.camion.idBoards[3]);
        let noBases = parseInt(this.camion.noBases)
        console.log("CAMION",this.uid);
        this.blockBases(noBases);
      });
    }

    // 
    blockBases(nobases: number){
      switch (nobases) {
        case 1:
          document.getElementById('b1')!.classList.remove('col-sm-3');
          document.getElementById('b1')!.classList.add('col-sm-12');

          document.getElementById("b2")!.style.display = "none";
          document.getElementById("b3")!.style.display = "none";
          document.getElementById("b4")!.style.display = "none";
          break
        case 2:
          document.getElementById('b1')!.classList.remove('col-sm-3');
          document.getElementById('b1')!.classList.add('col-sm-6');
          document.getElementById('b2')!.classList.remove('col-sm-3');
          document.getElementById('b2')!.classList.add('col-sm-6');

          document.getElementById("b3")!.style.display = "none";
          document.getElementById("b4")!.style.display = "none";
          break
        case 3:
          document.getElementById('b1')!.classList.remove('col-sm-3');
          document.getElementById('b1')!.classList.add('col-sm-4');
          document.getElementById('b2')!.classList.remove('col-sm-3');
          document.getElementById('b2')!.classList.add('col-sm-4');
          document.getElementById('b3')!.classList.remove('col-sm-3');
          document.getElementById('b3')!.classList.add('col-sm-4');

          document.getElementById("b4")!.style.display = "none";
      }
      console.log("base", nobases);
    }

    saveIdSensor(base: number, idBoard: string){
      console.log("LOCACIÓN",this.camion);

      if (!this.idsForm.get(idBoard)?.valid) {
        return alert("Es necesario llenar el campo de id");
      }
      this.camion.idBoards[base] = this.idsForm.get(idBoard)?.value;

      console.log(this.camion, this.camion);
      this.service.updateTruckData(this.uid, this.camion).then(() => {
        alert('Id actualizado con exito');
      }).catch((e) => alert('Error' + e))


    }

}
