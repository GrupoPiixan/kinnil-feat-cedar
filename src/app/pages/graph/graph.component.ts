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
  private timer: any;

  private preison: any[] = [];
  private teperatura: any[] = [];

  constructor(private service: GetDataService, private datePipe: DatePipe, private routeparam: ActivatedRoute) { }

  ngOnInit(): void {

    // * generate some random testing data:
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
          return 'RPM : ' + parseFloat(temp.value[1]).toFixed(2) + ' ' + temp.value[0]
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
        max: 10000,
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
        name: 'RPM',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        color: "rgb(166,206,58)",
        data:[]
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
          return 'FT/SEC : ' + parseFloat(temp.value[1]).toFixed(2) + ' ' + temp.value[0]
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
        max: 10000,
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
        name: 'FT/SEC',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        color: "rgb(236,8,39)",
        data:[]
      }
      ]
    };

    this.preison = [];
    this.teperatura = [];

    //* get init data Char
    this.service.getDataChart('quectel', idBomb?.toString() || '').subscribe(data => {
      data.forEach(item => {
        let temp: any = item.data()
        this.now = new Date(temp.creacionRegistro.seconds * 1000)

        let datoPresion = {
          name: this.now.toString(),
          value: [
            this.datePipe.transform(this.now, 'YYYY/MM/dd HH:mm:ss'),
            temp.bands_rpm
          ]
        };
        let datoTemperatura = {
          name: this.now.toString(),
          value: [
            this.datePipe.transform(this.now, 'YYYY/MM/dd HH:mm:ss'),
            temp.bands_ftmin
          ]
        };
        this.preison.push(datoPresion);
        this.teperatura.push(datoTemperatura);
      });
      this.updateDataChar(idBomb);
    }); 
  }

  // * Update series data:
  updateDataChar(bomb:string|null){
    this.service.getData('quectel', bomb?.toString() || '').subscribe(data => {
      data.map(item => {
        let temp: any = item.payload.doc.data();
        this.now = new Date(temp.creacionRegistro.seconds * 1000)
  
        let datoPresion = {
          name: this.now.toString(),
          value: [
            this.datePipe.transform(this.now, 'YYYY/MM/dd HH:mm:ss'),
            temp.r_RPM
          ]
        };
        let datoTemperatura = {
          name: this.now.toString(),
          value: [
            this.datePipe.transform(this.now, 'YYYY/MM/dd HH:mm:ss'),
            temp.r_ftMin
          ]
        };
        this.preison.unshift(datoPresion)
        this.teperatura.unshift(datoTemperatura)
        this.updateOptions = {
          series: [{
            name: 'RPM',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: [...this.preison]
          }]
        };
        this.updateOptions2 = {
          series: [{
            name: 'FT/SEC',
            type: 'line',
            showSymbol: false,
            hoverAnimation: false,
            data: [...this.teperatura]
          }]
        };
      })
    })
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}