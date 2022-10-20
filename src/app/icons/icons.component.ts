import { Component, OnInit } from '@angular/core';
import { Train30Service } from 'app/services/train30.service';
import { Train40Service } from 'app/services/train40.service';
import { Train60Service } from 'app/services/train60.service';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-icons',
  templateUrl: './icons.component.html',
  styleUrls: ['./icons.component.css']
})
export class IconsComponent implements OnInit {
  trainingChartsData30 : any[] = [] as any[];
  trainingChartsData40 : any[] = [] as any[];
  trainingChartsData60 : any[] = [] as any[];

  allTrain30 : any = {} as any;
  allTrain40 : any = {} as any;
  allTrain60 : any = {} as any;

  constructor(private train30Service : Train30Service, private train40Service : Train40Service, private train60Service : Train60Service) { }
  


  async ngOnInit(): Promise<void>  {

      await this.get30Train();
      await this.get40Train();    
      await this.get60Train();    

      for (let id = 0; id < this.allTrain30.length; id++) {

        const labels = Array.from(Array(this.allTrain30[id].bpm.length).keys())
        const data = {
          labels: labels,
          datasets: [{
            label: 'BPM of ' + this.allTrain30[id].date +' train',
            data: this.allTrain30[id].bpm,
            fill: true,
            backgroundColor:'#edbbc1',
            borderColor: 'rgb(223, 71, 89)',
            pointBorderColor: 'rgb(223, 71, 89)',
            tension: 1,
            borderWidth: 2,
            pointBorderWidth: 0.1,
            pointRadius: 0.1,

          }],
        };
        this.trainingChartsData30.push(data)
        this.show(id,'30');
      }

      for (let id = 0; id < this.allTrain40.length; id++) {

        const labels = Array.from(Array(this.allTrain40[id].bpm.length).keys())
        const data = {
          labels: labels,
          datasets: [{
            label: 'BPM of ' + this.allTrain40[id].date +' train',
            data: this.allTrain40[id].bpm,
            fill: true,
            backgroundColor:'rgb(255, 218, 150)',
            borderColor: 'rgb(255,165,0)',
            pointBorderColor: 'rgb(255,165,0)',
            tension: 1,
            borderWidth: 2,
            pointBorderWidth: 0.1,
            pointRadius: 0.1,

          }],
        };
        this.trainingChartsData40.push(data)
        this.show(id,'40');
      }

      for (let id = 0; id < this.allTrain60.length; id++) {

        const labels = Array.from(Array(this.allTrain60[id].bpm.length).keys())
        const data = {
          labels: labels,
          datasets: [{
            label: 'BPM of ' + this.allTrain60[id].date +' train',
            data: this.allTrain60[id].bpm,
            fill: true,
            backgroundColor:'rgb(172, 250, 198)',
            borderColor: 'rgb(59, 217, 111)',
            pointBorderColor: 'rgb(59, 217, 111)',
            tension: 1,
            borderWidth: 2,
            pointBorderWidth: 0.1,
            pointRadius: 0.1,

          }],
        };
        this.trainingChartsData60.push(data)
        this.show(id,'60');
            }
  }


  async get30Train(){
    await new Promise<void> ((resolve, reject) => {
      this.train30Service.GetAllTrain30().subscribe(res =>{
        this.allTrain30 = res;
        resolve();
    })
  });
  }

  async get40Train(){
    await new Promise<void> ((resolve, reject) => {
      this.train40Service.GetAllTrain40().subscribe(res =>{
        this.allTrain40 = res;
        resolve();
    })
  });
  }

  async get60Train(){
    await new Promise<void> ((resolve, reject) => {
      this.train60Service.GetAllTrain60().subscribe(res =>{
        this.allTrain60 = res;
        resolve();
    })
  });
  }

  async show(id : number, type : string){
      await new Promise(f => setTimeout(f, 10));
      this.createChartTrain(id, type);
  }


  createChartTrain(id: number, type : string){

    var chartData = {} as any;

    if(type == '30'){
      chartData =  this.trainingChartsData30[id] 
    }
    if(type == '40'){
      chartData =  this.trainingChartsData40[id] 
    }
    if(type == '60'){
      chartData =  this.trainingChartsData60[id] 
    }
    let chartStatus = Chart.getChart('trainChart'+type+String(id)); // <canvas> id
    if (chartStatus != undefined) {
  
      var canvas = <HTMLCanvasElement> document.getElementById('trainChart'+type+String(id))
      var ctx = canvas.getContext('2d');
      chartStatus.destroy();
  
      var chart = new Chart('trainChart'+type+String(id), {
        type: 'line',
        data: chartData,

      });
      
    }
    else{
      var chart = new Chart('trainChart'+type+String(id), {
        type: 'line',
        data: chartData,
        options: {
          scales: {x: { title: { display: true, text: 'Seconds [s]' }}}
        }
      });  }
  
  
  }
}
