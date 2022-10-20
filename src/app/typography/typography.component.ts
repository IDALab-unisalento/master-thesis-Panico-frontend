import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SleepData } from 'app/models/sleepData';
import { SleepAnomalyService } from 'app/services/sleep-anomaly.service';
import { SleepService } from 'app/services/sleep.service';
import { Chart, registerables } from 'chart.js';
import * as Chartist from 'chartist';
Chart.register(...registerables);


@Component({
  selector: 'app-typography',
  templateUrl: './typography.component.html',
  styleUrls: ['./typography.component.css']
})
export class TypographyComponent implements OnInit {

  sleepDataBase : SleepData[] = [] as SleepData[];
  sleepData : SleepData[] = [] as SleepData[];
  sleepChart : Chart = {} as Chart;
  anomalyChartData : any[] = [] as any[];
  anomalyChart : Chart[] = [] as Chart[];

  showButtons : boolean[] = [] as boolean[];

  allSleep : any;
  allSleepAnomalies : any;
  allHRV: number[] = [] as number[];
  lastHRV  = 0;
  penultimateHRV = 0;

  maxIdxViewd : number = 0
  minIdxViewd : number = 0
  improvment = 0
  sleepDays : String[] = [] as String[];

  constructor(private sleepService : SleepService, private sleepAnomaliesService : SleepAnomalyService) { }

  async  ngOnInit(): Promise<void> {
    
    await this.getAllSleep();
    await this.getAllSleepAnomalies();

    this.showButtons = Array(this.allSleepAnomalies.length).fill(false);

    this.maxIdxViewd = this.sleepDataBase.length
    this.minIdxViewd = this.sleepDataBase.length - 7

    this.sleepData = this.sleepDataBase;
    this.createChart();

    this.lastHRV = this.allHRV[this.allHRV.length-1]
    this.penultimateHRV = this.allHRV[this.allHRV.length-2]

    this.improvment = Math.round((((this.lastHRV*100)/this.penultimateHRV)-100)* 10) / 10
    this.improvment = parseFloat(this.improvment.toFixed(1))

    const dataDailySalesChart: any = {
      labels: this.sleepDays.slice(-7),
      series: [this.allHRV.slice(-7)]
    };

    const optionsDailySalesChart: any = {
        lineSmooth: Chartist.Interpolation.cardinal({
            tension: 0
        }),

        low: 0,
        high: Math.max(...this.allHRV),
        chartPadding: { top: 0, right: 0, bottom: 0, left: 0},
    }

    var dailySalesChart = new Chartist.Line('#HRV', dataDailySalesChart, optionsDailySalesChart);

    this.startAnimationForLineChart(dailySalesChart);

    for (let id = 0; id < this.allSleepAnomalies.length; id++) {

      const data = {
        labels: this.allSleepAnomalies[id].radar_labels_75.concat(this.allSleepAnomalies[id].radar_labels_25),
        datasets: [{
          label: this.allSleepAnomalies[id].date + ' after the 75th percentile',
          data: this.allSleepAnomalies[id].radar_scores_75.concat(Array(this.allSleepAnomalies[id].radar_scores_25.length).fill(0)),
          fill: true,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          pointBackgroundColor: 'rgb(255, 99, 132)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(255, 99, 132)'
        }, {
          label: this.allSleepAnomalies[id].date + ' under the 25th percentile',
          data: (Array(this.allSleepAnomalies[id].radar_scores_75.length).fill(0)).concat(this.allSleepAnomalies[id].radar_scores_25),
          fill: true,
          backgroundColor: 'rgb(231, 249, 237)',
          borderColor: 'rgb(50, 205, 50)',
          pointBackgroundColor: 'rgb(50, 205, 50)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(50, 205, 50)'
        }
        ]}; 

        this.anomalyChartData.push(data)
        this.show(id);
    }
   }

   startAnimationForLineChart(chart){
    let seq: any, delays: any, durations: any;
    seq = 0;
    delays = 80;
    durations = 500;

    chart.on('draw', function(data) {
      if(data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if(data.type === 'point') {
            seq++;
            data.element.animate({
              opacity: {
                begin: seq * delays,
                dur: durations,
                from: 0,
                to: 1,
                easing: 'ease'
              }
            });
        }
    });

    seq = 0;
};


   createChart(){

    const DATA_COUNT = 7;
    const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};
    let labels : string[] = [] as string[];
    labels = this.sleepDataBase.map(singleData => singleData.weekDayLetter);
  
    const canvas = document.getElementById('sleepChart') as HTMLCanvasElement | null;
    const ctx = canvas?.getContext('2d');
  
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'Awake time',
          data : this.sleepDataBase.map(singleData => singleData.awakeTime),
          backgroundColor: 'rgb(255, 99, 132)',
        },
        {
          label: 'Light time',
          data : this.sleepDataBase.map(singleData => singleData.lightTime),
          backgroundColor: 'rgb(54, 162, 235)',
        },
        {
          label: 'Deep time',
          data : this.sleepDataBase.map(singleData => singleData.deepTime),
          backgroundColor: 'rgb(255, 205, 86)'
        },
        {
          label: 'REM time',
          data : this.sleepDataBase.map(singleData => singleData.REMTime),
          backgroundColor: 'rgb(124,252,0)'
        },
      ]
    };
  
  
  
      this.sleepChart = new Chart("sleepChart", {
        type: 'bar',
        data: data,
        options: {
          layout: {
            padding : {
              right : 18,
              bottom : 30
            }
          },
  
          plugins: {
            title: {
              display: false,
              text: 'SLEEP DATA'
            },
          },
          responsive: true,
          scales: {
            x: {
              min : this.sleepData.length - 7,
              max : this.sleepData.length,
              title: {
                color: 'black',
                display: true,
                text: 'Day'
              },
              stacked: true,
            },
            y: {
              min: 0,
              max: Math.max(...this.sleepDataBase.map(singleData => singleData.lightTime + singleData.deepTime + singleData.REMTime)) +1,
              title: {
                color: 'black',
                display: true,
                text: 'sleep hours [h]'
              },
              stacked: true
            }
          }
        }
    
      });
    }
  
    refreshChart(action : string){
  
      if (action == 'latest'){
        this.sleepChart.options!.scales!['x']!.min  =  this.sleepChart.options!.scales!['x']!.min as number + 7;
        this.sleepChart.options!.scales!['x']!.max  =  this.sleepChart.options!.scales!['x']!.max as number + 7;
        this.maxIdxViewd = this.sleepChart.options!.scales!['x']!.max
        this.minIdxViewd = this.sleepChart.options!.scales!['x']!.min

        // if is overcome the max bound : set max-scroll
        if(this.sleepChart.options!.scales!['x']!.max >= this.sleepChart.data.datasets[0].data.length){
          
          this.sleepChart.options!.scales!['x']!.min  =  this.sleepChart.data.datasets[0].data.length - 7;
          this.sleepChart.options!.scales!['x']!.max  =  this.sleepChart.data.datasets[0].data.length ;

          this.maxIdxViewd = this.sleepChart.options!.scales!['x']!.max
          this.minIdxViewd = this.sleepChart.options!.scales!['x']!.min
        }
        this.sleepChart.update();
      }
  
      if (action == 'older'){
        this.sleepChart.options!.scales!['x']!.min  =  this.sleepChart.options!.scales!['x']!.min as number - 7;
        this.sleepChart.options!.scales!['x']!.max  =  this.sleepChart.options!.scales!['x']!.max as number - 7;

        this.maxIdxViewd = this.sleepChart.options!.scales!['x']!.max
        this.minIdxViewd = this.sleepChart.options!.scales!['x']!.min
        // if is overcome the max bound : set max-scroll
        if(this.sleepChart.options!.scales!['x']!.max <= 6){
          
          this.sleepChart.options!.scales!['x']!.min  =  0;
          this.sleepChart.options!.scales!['x']!.max  =  6 ;

          this.maxIdxViewd = 6
          this.minIdxViewd = 0
          
        }
        this.sleepChart.update();
      }
    }
    
    async getAllSleep(){
      await new Promise<void> ((resolve, reject) => {
        this.sleepService.GetAllSleep().subscribe(res =>{
          this.allSleep = res;
          for (const sleepDay of this.allSleep) {
            let newSleepData : SleepData = {} as SleepData;
            newSleepData.awakeTime = Math.floor(sleepDay.awake/3600) + (sleepDay.awake/3600 - Math.floor(sleepDay.awake/3600))*0.6;
            newSleepData.deepTime = Math.floor(sleepDay.deep/3600) +  (sleepDay.deep/3600 - Math.floor(sleepDay.deep/3600))*0.6;
            newSleepData.lightTime = Math.floor(sleepDay.light/3600) +  (sleepDay.light/3600 - Math.floor(sleepDay.light/3600))*0.6;
            newSleepData.REMTime = Math.floor(sleepDay.rem/3600) +  (sleepDay.rem/3600 - Math.floor(sleepDay.rem/3600))*0.6;
            newSleepData.totalDuration = Math.floor(sleepDay.total/3600) +  (sleepDay.total/3600 - Math.floor(sleepDay.total/3600))*0.6;
            newSleepData.date = sleepDay.summary_date;
            newSleepData.score = sleepDay.score;
            let dateObj = new Date(newSleepData.date);
            //Date obj example : Fri Aug 05 2022 02:00:00 GMT+0200 (Ora legale dell’Europa centrale), so just take the first letter
            newSleepData.weekDayLetter = String(dateObj)[0]; 
            this.sleepDataBase.push(newSleepData);

            let HRV : number = Math.max( ...sleepDay.rmssd_5min );
            this.allHRV.push(HRV)
            this.sleepDays.push(sleepDay.summary_date);

           }
          resolve();
      })
    });
    }

    async getAllSleepAnomalies(){
      await new Promise<void> ((resolve, reject) => {
        this.sleepAnomaliesService.getAllSleepAnomalies().subscribe(res =>{
          this.allSleepAnomalies = res;
          resolve();
      })
    });
    }
  
  async show(id : number){


  this.showButtons[id] = !this.showButtons[id]

  if(this.showButtons[id]){
    await new Promise(f => setTimeout(f, 10));
    this.createChartAnomaly(id);}

}

createChartAnomaly(id: number){


  let chartStatus = Chart.getChart('anomalyChart'+String(id)); // <canvas> id
  if (chartStatus != undefined) {

    var canvas = <HTMLCanvasElement> document.getElementById('anomalyChart'+String(id))
    var ctx = canvas.getContext('2d');
    chartStatus.destroy();

    var chart = new Chart(ctx, {
      type: 'radar',
      data: this.anomalyChartData[id],
      options: {
        elements: {
          line: {
            borderWidth: 3
          }
        }
      },
    });
    
  }
  else{

    var chart = new Chart('anomalyChart'+String(id), {
      type: 'radar',
      data: this.anomalyChartData[id],
      options: {
        elements: {
          line: {
            borderWidth: 3
          }
        }
      },
    });  }


}
}

