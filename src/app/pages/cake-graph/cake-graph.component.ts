import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cake-graph',
  templateUrl: './cake-graph.component.html',
  styleUrls: ['./cake-graph.component.css']
})
export class CakeGraphComponent implements OnInit {

  options: any;
  
  constructor() { 

  }

  

  ngOnInit(): void {
    this.options = {
      title: {
        text: 'OEE',
        textStyle: {
        color: '#FFFFFF',
          fontSize: 30,
        },
        // subtext: 'Mocking Data',
        x: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        x: 'center',
        y: 'bottom',
        data: ['rose1', 'rose2', 'rose3', 'rose4', 'rose5', 'rose6', 'rose7', 'rose8'],
        textStyle: {
          color: '#FFFFFF'
        }, 
      },
      calculable: true,
      series: [
        {   
          name: 'area',
          type: 'pie',
          radius: [30, 110],
          roseType: 'area',
          data: [
            { value: 10, name: 'rose1', label:{color: '#FFFFFF'} },
            { value: 5, name: 'rose2', label:{color: '#FFFFFF'}  },
            { value: 15, name: 'rose3', label:{color: '#FFFFFF'}  },
            { value: 25, name: 'rose4', label:{color: '#FFFFFF'}  },
            { value: 20, name: 'rose5', label:{color: '#FFFFFF'}  },
            { value: 35, name: 'rose6', label:{color: '#FFFFFF'}  },
            { value: 30, name: 'rose7', label:{color: '#FFFFFF'}  },
            { value: 40, name: 'rose8', label:{color: '#FFFFFF'}  }
          ]
        }
      ]
    };
  }

}


