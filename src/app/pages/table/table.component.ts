import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

// * Utils
import { ArraysService } from '../../utils/arrays.service';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnChanges {

  // * Variable that will contain the information of the table
  // ? If no data is entered, data will be displayed by default
  @Input() dataTable: any = {
    messageEmpty: 'No data to display',
    showSearch: true,
    showData: [5, 10, 15, 20, 25],
    headerRow: [{
      text: '#',
      show: true
    }, {
      text: 'First name',
      show: true
    }, {
      text: 'Last name',
      show: true
    }, {
      text: 'Date of birth',
      show: true
    }, {
      text: '# pets',
      show: true
    }, {
      text: 'Cell phone',
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
  @Input() dataRows: Array<any> = [
    ['1', 'Jacqueline', 'Reig', '28/03/1997', '2', '+34 (408) 102-1436'],
    ['2', 'Cecilia', 'Llorens', '25/02/1978', '1', '+25 (417) 229-4972'],
    ['3', 'Vasile ', 'Miralles', '21/10/1978', '0', '+73 (072) 834-7778'],
    ['4', 'Delfina ', 'Morillo', '18/09/1987', '4', '+25 (488) 312-5052'],
    ['5', 'Lucia ', 'Orozco', '18/08/1980', '8', '+90 (193) 680-3262'],
    ['6', 'Narciso ', 'Galindo', '19/01/1995', '3', '+91 (017) 115-0953'],
    ['7', 'Dario ', 'Ripoll', '04/05/1997', '6', '+28 (956) 729-5251'],
    ['8', 'Juan ', 'Garcia', '12/06/1996', '5', '+34 (908) 829-5251'],
  ]

  //* Button functionality events
  @Output() eventDelete = new EventEmitter<object>();
  @Output() eventDetail = new EventEmitter<object>();
  @Output() eventEdit = new EventEmitter<object>();

  // * Table variables
  show: number = (this.dataTable.showData !== undefined) ? this.dataTable.showData[0] : this.dataRows.length;
  search: string = '';
  indexTable: number = 1;
  arrayData: any = null;

  constructor() {
    this.initTable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.initTable();
  }

  // * Initialize the table showing by the selected number and searching for the entered text
  initTable(): void {
    this.arrayData = this.chunkArray(this.searchArrayObject(this.dataRows, this.search), this.show);
    this.indexTable = 1;
  }

  // * Check the buttons to show the information or not
  verifyButtonsShow(): boolean {
    return this.dataTable.buttons.edit.show || this.dataTable.buttons.delete.show || this.dataTable.buttons.detail.show;
  }

  //* Button functionality events
  onDelete(data: any) {
    this.eventDelete.emit(this.formateDataJsonDataTable(data));
  }
  onEdit(data: any) {
    this.eventEdit.emit(this.formateDataJsonDataTable(data));
  }
  onDetail(data: any) {
    this.eventDetail.emit(this.formateDataJsonDataTable(data));
  }

  // * Generate a json dynamically with the table headers and the row data
  private formateDataJsonDataTable(dataEvent: any): any {
    let table = this.dataTable.headerRow;
    let dataResp: any = {};
    for (let i = 0; i < table.length; i++) {
      dataResp[this.removeAccents(table[i].text).replace(/\s+/g, '')] = dataEvent[i];
    }
    return dataResp;
  }

  private removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  // * Method that separates an array into an array with n number of subarrays
  private chunkArray(arr: any, size: number) {
    var results = [];
    while (arr.length) {
      results.push(arr.splice(0, size));
    }
    return results;
  }

  // * Method that matches an array of objects
  private searchArrayObject(arr: any, value: string): any[] {
    var results: any[] = [];
    for (let i = 0; i < arr.length; i++) {
      const temp1 = arr[i];
      for (let j = 0; j < temp1.length; j++) {
        const temp2 = temp1[j] + '';
        if (temp2.toLocaleLowerCase().includes(value)) {
          results.push(temp1);
          break;
        }
      }
    }

    return results;
  }

  // * Colorize a column
  getColumnBgColor(header: any, value: any) {
    const tolerancePercentage = 0;
    
    if (header.text === "Estatus") {
      return value[2] === 'Activo' ? 'bg-success' : value[2] === "Apagado" ? 'bg-danger' : 'bg-warning';
    }

    if (header.text === "Presión") {
      const pressure = parseFloat(value[7].split(" ")[0]);
      const minPressure = parseFloat(value[5]);
      const maxPressure = parseFloat(value[6]);

      console.log(pressure, minPressure, maxPressure);

      if (value[2] === 'Apagado') return '';
      if (value[2] === 'Inactivo' || value[2] === 'En Pausa') return 'bg-warning';
      if (pressure < (minPressure - (minPressure * (tolerancePercentage / 100)))) return 'bg-danger';
      if (pressure > (maxPressure + (maxPressure * (tolerancePercentage / 100)))) return 'bg-danger';
      return 'bg-success';
    }

    if (header.text === "Temperatura") {
      const temperature = parseFloat(value[8].split(" ")[0]);
      const minTemp = parseFloat(value[10]);
      const maxTemp = parseFloat(value[11]);

      if (value[2] === 'Apagado') return '';
      if (value[2] === 'Inactivo' || value[2] === 'En Pausa') return 'bg-warning';
      if (temperature < (minTemp - (minTemp * (tolerancePercentage / 100)))) return 'bg-danger';
      if (temperature > (maxTemp + (maxTemp * (tolerancePercentage / 100)))) return 'bg-danger';
      return 'bg-success';
    }
    
    return '';
  }
}
