import { Component, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-sockets',
  templateUrl: './sockets.component.html',
  styleUrls: ['./sockets.component.scss']
})
export class SocketsComponent implements OnInit {
  @ViewChild('lineChart') private chartRef;
  chart: any;
  status: Number;
  tabIndex = 1;
  statusMessage = '';
  unconfirmedTransactions = {};
  valuesBTC = [];
  satoshiToBTC = 100000;
  valuesArray = [];
  labels = [];
  values = [];
  search: any = '';
  results = [];
  constructor() { 
    this.initializeSocket();
  }

  ngOnInit() {
    this.initializeSocket();
  }

  changeIndex(index) {
    this.tabIndex = index;
    this.plotChart() ;
  }

  initializeSocket() {
    /* 
     0 : connecting.
     1 : connected.
     3:  closed OR disconnected
    */
    const socket = new WebSocket('wss://ws.blockchain.info/inv');
    socket.onopen = (event => {
      this.status = socket.readyState;
      this.getStatus();
      socket.send('{"op":"unconfirmed_sub"}');
      
    })

    socket.onmessage = event => {
      const valuesDetails = {};
      const unconfirmedTransactions = JSON.parse(event.data);
      const val = unconfirmedTransactions['x']['out'][0].value / this.satoshiToBTC;
      const time = new Date(unconfirmedTransactions['x']['time']);
      if (val  > 1) {
        valuesDetails['t'] = time;
        valuesDetails['y'] = val
        if (this.valuesArray.length < 10) {
          this.valuesArray.push(valuesDetails);
          this.labels.push(time);
          this.values.push(val);
        } else if (this.valuesArray.length >= 10) {
          this.values.splice(0,1,val);
          this.labels.splice(0,1,time);
        }
      }
    }

    socket.onclose = event => {
      this.status = socket.readyState;
    }
  }

  getStatus() {
    this.statusMessage = '';
    if ( this.status === 0) {
      this.statusMessage = 'Connecting';
    } else if (this.status === 1) {
      this.statusMessage = 'Connected';
    } else if (this.status === 3) {
      this.statusMessage = 'Closed';
    }
  }

  plotChart() {
    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [
          {
           data: this.values,
            borderColor: '#00AEFF',
            fill: false
          }
        ]
        
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            display: true
          }],
          yAxes: [{
            display: true
          }],
        }
      }
    });
  }

  // Tab2: Search starts
  handleSearchChange(searchedString) {
    const difference = [];
    this.values.forEach(el => {
      difference.push(Math.abs(el - parseInt(searchedString, 10)));
    }) 

    difference
    .sort((a, b) => a - b)
    .splice(3,10);
    this.results = [...difference];
    

  }
}
