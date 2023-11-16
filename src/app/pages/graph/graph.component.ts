import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// * Services
import { DatePipe } from '@angular/common';
import { GetDataService } from '../../services/get-data.service';

declare var $: any;

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit {
  
  options: any;
  options2: any;
  updateOptions: any;
  updateOptions2: any;

  private oneDay = 24 * 3600 * 1000;
  private now: Date = new Date();
  private value: number = 0;
  private data: any[] = [];
  private data2: any[] = [];
  private timer: any;

  private preison: any[] = [];
  private teperatura: any[] = [];

  constructor(private service: GetDataService, private datePipe: DatePipe, private routeparam: ActivatedRoute) { }

  ngOnInit(): void {
    // * generate some random testing data:
    this.data = [];
    this.data2 = [];
    this.now = new Date();
    this.value = Math.random() * 1000;

    this.routeparam.snapshot.paramMap.get('type')

    const idBomb = this.routeparam.snapshot.paramMap.get('uid');

    // * initialize chart options:
    this.options = {
      title: {
        text: ''
      },
      textStyle: {
        color: '#FFFFFF'
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let temp = params[0]
          return 'Presión : ' + parseFloat(temp.value[1]).toFixed(2) + ' ' + temp.value[0]
        },
        axisPointer: {
          animation: false
        }
      },
      xAxis: {
        type: 'time',
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
        max: 1500,
        splitLine: {
          show: false
        }
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          filterMode: 'empty',
        }
      ],
      series: [{
        name: 'Presión',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        color: "rgb(166,206,58)",
        data: this.data
      }
      ]
    };
    this.options2 = {
      title: {
        text: ''
      },
      textStyle: {
        color: '#FFFFFF'
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let temp = params[0]
          return 'Temperatura : ' + parseFloat(temp.value[1]).toFixed(2) + ' ' + temp.value[0]
        },
        axisPointer: {
          animation: false
        }
      },
      xAxis: {
        type: 'time',
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '100%'],
        max: 100,
        splitLine: {
          show: false
        }
      },
      dataZoom: [
        {
          type: 'slider',
          xAxisIndex: 0,
          filterMode: 'empty',
        }
      ],
      series: [{
        name: 'Temperatura',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        color: "rgb(236,8,39)",
        data: this.data2
      }
      ]
    };

    this.preison = [];
    this.teperatura = [];

    this.service.getDataChart('quectel', idBomb?.toString() || '').subscribe(data => {
      data.map(item => {
        let temp: any = item.payload.doc.data();
        this.now = new Date(temp.creacionRegistro.seconds * 1000)
        //TODO preison = temp.a1;
        //TODO teperatura = temp.a2;
        let datoPresion = {
          name: this.now.toString(),
          value: [
            this.datePipe.transform(this.now, 'YYYY/MM/dd HH:mm:ss'),
            temp.a1
          ]
        };
        let datoTemperatura = {
          name: this.now.toString(),
          value: [
            this.datePipe.transform(this.now, 'YYYY/MM/dd HH:mm:ss'),
            temp.a2
          ]
        };
        this.preison.unshift(datoPresion);
        this.teperatura.unshift(datoTemperatura);

        // * Update series data:
        this.updateOptions = {
          series: [{
            name: 'Presión',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: this.preison
          }]
        };
        this.updateOptions2 = {
          series: [{
            name: 'Temperatura',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: this.teperatura
          }]
        };
      });
    });
  }

  timestampToDate(fecha: any) {
    let data = new Date(fecha * 1000);
    return this.datePipe.transform(data, 'dd/MM/YY HH:mm:ss');
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  randomData() {
    this.now = new Date(this.now.getTime() + this.oneDay);
    this.value = Math.random() * (80 - 20) + 20;
    return {
      name: this.now.toString(),
      value: [
        [this.now.getFullYear(), this.now.getMonth() + 1, this.now.getDate()].join('/'),
        Math.round(this.value)
      ]
    };
  }

  randomData2() {
    this.now = new Date(this.now.getTime() + this.oneDay);
    this.value = Math.random() * (300 - 1) + 1;
    return {
      name: this.now.toString(),
      value: [
        this.datePipe.transform(this.now, 'dd/MM/YY HH:mm:ss'),
        Math.round(this.value)
      ]
    };
  }
}
