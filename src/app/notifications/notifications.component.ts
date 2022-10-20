import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Train30Service } from 'app/services/train30.service';
import * as echarts from 'echarts';
import { Chart } from 'chart.js';
import { Train40Service } from 'app/services/train40.service';
import { Train60Service } from 'app/services/train60.service';
declare var $: any;
type EChartsOption = echarts.EChartsOption


declare interface xAxisObj {
  xAxis : number
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
 export  class NotificationsComponent implements OnInit {
  allTrain30 : any = {} as any;
  allTrain40 : any = {} as any;
  allTrain60 : any = {} as any;

  trainId : string = '';
  train : any = {} as any;
  meteoKeys : any[] = ['isRain','co','no2','o3','pm10', 'pm2_5','so2'] as any [];
  meteoValues : any[] = [] as any [];

  minTime : number = 0 as number;
  maxTime : number = 0 as number;

  allTimes : number [] = [] as number [];
  trainType : number = 30;

  constructor(private train30Service : Train30Service, private train40Service : Train40Service,private train60Service : Train60Service, private route: ActivatedRoute) { }
  


  async ngOnInit(): Promise<void>  {

      this.trainId = this.route.snapshot.paramMap.get('id');
      await this.getTrain();

      this.train = this.allTrain30.filter(
        train => train._id === this.trainId);
      
      if(this.train.length == 0){
        this.trainType = 40
        this.train = this.allTrain40.filter(
          train => train._id === this.trainId);
      }
      if(this.train.length == 0){
        this.trainType = 60
        this.train = this.allTrain60.filter(
          train => train._id === this.trainId);
      }

      this.train = this.train[0]

      for (const key of this.meteoKeys) {

        this.meteoValues.push(this.train[key])
      }

      this.meteoKeys.push('Weather')
      this.meteoValues.push(this.train['meteo_json']['weather']['0']['description'])

      this.meteoKeys.push('Temperature')
      this.meteoValues.push(Math.round((this.train['meteo_json']['main']['temp'] - 273.16)*100) / 100)

      this.meteoKeys.push('Temperature feels like')
      this.meteoValues.push(Math.round((this.train['meteo_json']['main']['feels_like'] - 273.16)*100) / 100)

      this.meteoKeys.push('Pressure')
      this.meteoValues.push(this.train['meteo_json']['main']['pressure'])

      this.meteoKeys.push('Wind speed')
      this.meteoValues.push(this.train['meteo_json']['wind']['speed'])

      this.meteoKeys.push('Wind degree')
      this.meteoValues.push(this.train['meteo_json']['wind']['deg'])

      this.meteoKeys.push('Clouds')
      this.meteoValues.push(this.train['meteo_json']['clouds']['all'])

      var minTimes = [this.train.min_time_fh as number, this.train.min_time_fh_push as number, this.train.min_time_sh as number, this.train.min_time_sh_push as number]
      this.minTime = Math.min(...minTimes)
      
      var maxTimes = [this.train.max_time_fh as number, this.train.max_time_fh_push as number, this.train.max_time_sh as number, this.train.max_time_sh_push as number]
      this.maxTime = Math.max(...maxTimes)


      for (const time of this.train.measures) {
        this.allTimes.push(Number(time.time ))
      }

    this.allBpmChart();

      const labels = Array.from(Array(this.train.bpm.length).keys())

      var timesDom = document.getElementById('times')!;
      var timesChart = echarts.init(timesDom);
      var timesOption: EChartsOption;
      timesOption = {
              tooltip: {
                trigger: 'axis',
                position: function (pt) {
                  return [pt[0], '10%'];
                }
              },
              xAxis: {
                name : 'Sprint #',
                nameLocation: 'middle',
                type: 'category',
                data: Array.from(Array(this.allTimes.length).keys()).map(element => element+1)
              },
              yAxis: {
                type: 'value',
                min: Math.min(...this.allTimes) -0.5,
                max: Math.max(...this.allTimes) +0.5

              },
              series: [
                {
                  data: this.allTimes,
                  markArea: {
                    itemStyle: {
                      color: 'rgba(255, 173, 177, 0.4)'
                    },
                    data: [
                      [
                        {
                          name: 'First half Push phase',
                          xAxis: this.train.first_half_sprint
                        },
                        {
                          xAxis: this.train.first_half_sprint + this.train.first_half_sprint_push-1
                        }
                      ],
                      [
                        {
                          name: 'Second half Push phase',
                          xAxis: this.train.first_half_sprint + this.train.first_half_sprint_push + this.train.second_half_sprint
                        },
                        {
                          xAxis: this.train.first_half_sprint + this.train.first_half_sprint_push + this.train.second_half_sprint + this.train.second_half_sprint_push-1
                        }
                      ]
                    ]
                  },
                  type: 'line',
                  symbol: 'triangle',
                  symbolSize: 8,
                  lineStyle: {
                    color: '#5470C6',
                    width: 4,
                    type: 'dashed'
                  },
                  itemStyle: {
                    borderWidth: 2,
                    borderColor: '#EE6666',
                    color: 'yellow'
                  }
                }
              ]
            };
      
      timesOption && timesChart.setOption(timesOption);

      this.createComparisonChart();

      var integerList : number[] = [] as number[];
      for(const time of this.allTimes){
        integerList.push(~~time);
      }
      var timeCatLabels = integerList.filter((v, i, a) => a.indexOf(v) === i).sort((n1,n2) => n1 - n2);
      var timeDistibutionData = Array(timeCatLabels.length).fill(0);

      for(const time of this.allTimes){
        var integerPart  = ~~time;
        var i = 0
        for (const label of timeCatLabels) {
          if(integerPart == label){
            timeDistibutionData[i] += 1
          }
          i = i + 1
        }
      }

      var barDom = document.getElementById('pieTimes');
      var barChart = echarts.init(barDom);
      var barOption;

      barOption = {
        tooltip: {
          trigger: 'axis',
          position: function (pt) {
            return [pt[0], '10%'];
          }
        },
        xAxis: {
          type: 'category',
          name: 'Second',
          nameLocation:'middle',
          data: timeCatLabels,
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: timeDistibutionData,
            type: 'bar',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(180, 180, 180, 0.2)'
            }
          }
        ]
      };

      barOption && barChart.setOption(barOption);

  var fhTimesCronos = this.allTimes.slice(0,this.train.first_half_sprint + this.train.first_half_sprint_push)
  var shTimesCronos = this.allTimes.slice(this.train.first_half_sprint + this.train.first_half_sprint_push)

var chartDom = document.getElementById('fhTimes')!;
var fhTimes = echarts.init(chartDom);
var optionfhTimes: EChartsOption;
      optionfhTimes = {
        tooltip: {
          trigger: 'axis',
          position: function (pt) {
            return [pt[0], '10%'];
          }
        },
        xAxis: {
          name : 'Sprint #',
          nameLocation: 'middle',
          type: 'category',
          data: Array.from(Array(fhTimesCronos.length).keys()).map(element => element+1)
        },
        yAxis: {
          type: 'value',
          min: Math.min(...fhTimesCronos) -0.5,
          max: Math.max(...fhTimesCronos) +0.5
        },
        series: [
          {
            data: fhTimesCronos,
            markArea: {
              itemStyle: {
                color: 'rgba(255, 173, 177, 0.4)'
              },
              data: [
                [
                  {
                    name: 'Push phase',
                    xAxis: this.train.first_half_sprint
                  },
                  {
                    xAxis: this.train.first_half_sprint + this.train.first_half_sprint_push
                  }
                ]
              ]
            },
            type: 'line',
            symbol: 'triangle',
            symbolSize: 8,
            lineStyle: {
              color: '#5470C6',
              width: 4,
              type: 'dashed'
            },
            itemStyle: {
              borderWidth: 2,
              borderColor: '#EE6666',
              color: 'yellow'
            }
          }
        ]
      };
      
      optionfhTimes && fhTimes.setOption(optionfhTimes);

      var chartDom2 = document.getElementById('shTimes')!;
      var shTimes = echarts.init(chartDom2);
      var optionshTimes: EChartsOption;
            optionshTimes = {
              tooltip: {
                trigger: 'axis',
                position: function (pt) {
                  return [pt[0], '10%'];
                }
              },
              xAxis: {
                name : 'Sprint #',
                nameLocation: 'middle',
                type: 'category',
                data: Array.from(Array(shTimesCronos.length).keys()).map(element => element+1)
              },
              yAxis: {
                type: 'value',
                min: Math.min(...shTimesCronos) -0.5,
                max: Math.max(...shTimesCronos) +0.5

              },
              series: [
                {
                  data: shTimesCronos,
                  markArea: {
                    itemStyle: {
                      color: 'rgba(255, 173, 177, 0.4)'
                    },
                    data: [
                      [
                        {
                          name: 'Push phase',
                          xAxis: this.train.second_half_sprint
                        },
                        {
                          xAxis: this.train.second_half_sprint + this.train.second_half_sprint_push
                        }
                      ]
                    ]
                  },
                  type: 'line',
                  symbol: 'triangle',
                  symbolSize: 8,
                  lineStyle: {
                    color: '#5470C6',
                    width: 4,
                    type: 'dashed'
                  },
                  itemStyle: {
                    borderWidth: 2,
                    borderColor: '#EE6666',
                    color: 'yellow'
                  }
                }
              ]
            };
      
      optionshTimes && shTimes.setOption(optionshTimes);

  var fhbpmData = this.train.bpm.slice(0,(this.train.first_half_sprint + this.train.first_half_sprint_push)*this.trainType)
  var fhEtichets = []
  var counter = 0
  var minutes = 0
  for (let i = 0; i < Array.from(Array(fhbpmData.length).keys()).length; i++) {
    if(counter > 60){
      counter = 0;
      minutes += 1}
    var pad = ''
    if(counter <10)
      pad ='0'
    fhEtichets.push(String(minutes+':'+pad+String(counter)))
    counter +=1
  } 

  var fhbpmDom = document.getElementById('fhbpm')!;
  var fhbpm = echarts.init(fhbpmDom);
  var fhbpmoption: EChartsOption;
  var index : number[] = [] as number[]
  for (let i = 1; i <= ((this.train.first_half_sprint + this.train.first_half_sprint_push + 1)); i++) {
    index.push(i*60)
  }
  var obj: xAxisObj[] = [] as xAxisObj[]
  for (const idx of index) {
    var objex : xAxisObj = {} as xAxisObj;
    objex.xAxis = idx;
    obj.push(objex)
  }

  fhbpmoption = {
    tooltip: {
      trigger: 'axis',
      position: function (pt) {
        return [pt[0], '10%'];
      }
    },
    title: {
      left: 'center',
      text: 'First half bpm trend'
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        restore: {},
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: fhEtichets,
      axisLabel: {
      
      }
      
    },
    yAxis: {
      name : 'Bpm',
      nameLocation: 'middle',
      type: 'value',
      boundaryGap: [0, '100%'],
      min : Math.min(...fhbpmData) -5,
      max : Math.max(...fhbpmData) +5
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
    series:[ 
      {
        name: 'BPM',
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        markLine: {
          silent: true, // ignore mouse events
          symbol: ['none', 'none'],
          label: {                                 
            position: 'middle',
            show: true,
            formatter: function(d) {
              return String(Number(d.value)/60) + ':00 ';
            } },
          data: obj,
          lineStyle:{ 
            color:'rgb(105,105,105)'
          },
          
        },
        itemStyle: {
          color: '#d9534f'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: '#d9534f'
            },
            {
              offset: 1,
              color: 'rgb(252, 246, 240)'
            }
          ])
        },
        data: fhbpmData
      },{

        type: 'line',
       markLine: {
        silent: true, // ignore mouse events
        symbol: ['none', 'none'],
        label: {   
          color : '#d9534f',                            
          show : true, 
          position:'middle',
          formatter: function(d) {
            return 'Max bpm: '+d.value;
          } 
        },
        data: [{yAxis : Math.max(...fhbpmData)}],
        lineStyle:{ 
          color:'#d9534f'
        },
        
      },
    }
    ]
  };

      
  fhbpmoption && fhbpm.setOption(fhbpmoption);


  var start = (this.train.first_half_sprint + this.train.first_half_sprint_push)*this.trainType + this.train.interval_minutes*60 
  var end = start + (this.train.second_half_sprint + this.train.second_half_sprint_push)*this.trainType 
  var shbpmData = this.train.bpm.slice(start,end)
  var shEtichets = []
  var counter = 0
  var minutes = 0
  for (let i = 0; i < Array.from(Array(shbpmData.length).keys()).length; i++) {
    if(counter > 60){
      counter = 0;
      minutes += 1}
    var pad = ''
    if(counter <10)
      pad ='0'
    shEtichets.push(String(minutes+':'+pad+String(counter)))
    counter +=1
  } 

  var shbpmDom = document.getElementById('shbpm')!;
  var shbpm = echarts.init(shbpmDom);
  var shbpmoption: EChartsOption;
  var indexSh : number[] = [] as number[]
  for (let i = 1; i <= ((this.train.second_half_sprint + this.train.second_half_sprint_push + 1)); i++) {
    indexSh.push(i*60)
  }
  var objSh: xAxisObj[] = [] as xAxisObj[]
  for (const idx of indexSh) {
    var objex : xAxisObj = {} as xAxisObj;
    objex.xAxis = idx;
    objSh.push(objex)
  }

  shbpmoption = {
    tooltip: {
      trigger: 'axis',
      position: function (pt) {
        return [pt[0], '10%'];
      }
    },
    title: {
      left: 'center',
      text: 'Second half bpm trend'
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: 'none'
        },
        restore: {},
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: shEtichets,
      axisLabel: {
      
      }
      
    },
    yAxis: {
      name : 'Bpm',
      nameLocation: 'middle',
      type: 'value',
      boundaryGap: [0, '100%'],
      min : Math.min(...shbpmData) -5,
      max : Math.max(...shbpmData) +5
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        start: 0,
        end: 100
      }
    ],
    series:[ 
      {
        name: 'BPM',
        type: 'line',
        symbol: 'none',
        sampling: 'lttb',
        markLine: {
          silent: true, // ignore mouse events
          symbol: ['none', 'none'],
          label: {                                 
            position: 'middle',
            show: true,
            formatter: function(d) {
              return String(Number(d.value)/60) + ':00 ';
            } },
          data: objSh,
          lineStyle:{ 
            color:'rgb(105,105,105)'
          },
          
        },
        itemStyle: {
          color: '#d9534f'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: '#d9534f'
            },
            {
              offset: 1,
              color: 'rgb(252, 246, 240)'
            }
          ])
        },
        data: shbpmData
      },{

        type: 'line',
       markLine: {
        silent: true, // ignore mouse events
        symbol: ['none', 'none'],
        label: {   
          color : '#d9534f',                            
          show : true, 
          position:'middle',
          formatter: function(d) {
            return 'Max bpm: '+d.value;
          } 
        },
        data: [{yAxis : Math.max(...shbpmData)}],
        lineStyle:{ 
          color:'#d9534f'
        },
        
      },
    }
    ]
  };

      
  shbpmoption && shbpm.setOption(shbpmoption);

      
    }  

    async getTrain(){
      await new Promise<void> ((resolve, reject) => {
        this.train30Service.GetAllTrain30().subscribe(res =>{
            this.allTrain30 = res;
            resolve();
              })
    });
    await new Promise<void> ((resolve, reject) => {
      this.train40Service.GetAllTrain40().subscribe(res =>{
          this.allTrain40 = res;
          resolve();
    })
  });
  await new Promise<void> ((resolve, reject) => {
    this.train60Service.GetAllTrain60().subscribe(res =>{
        this.allTrain60 = res;
        resolve();
  })
});
    }
  



 /*  showNotification(from, align){
      const type = ['','info','success','warning','danger'];

      const color = Math.floor((Math.random() * 4) + 1);

      $.notify({
          icon: "notifications",
          message: "Welcome to <b>Material Dashboard</b> - a beautiful freebie for every web developer."

      },{
          type: type[color],
          timer: 4000,
          placement: {
              from: from,
              align: align
          },
          template: '<div data-notify="container" class="col-xl-4 col-lg-4 col-11 col-sm-4 col-md-4 alert alert-{0} alert-with-icon" role="alert">' +
            '<button mat-button  type="button" aria-hidden="true" class="close mat-button" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
            '<i class="material-icons" data-notify="icon">notifications</i> ' +
            '<span data-notify="title">{1}</span> ' +
            '<span data-notify="message">{2}</span>' +
            '<div class="progress" data-notify="progressbar">' +
              '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
            '</div>' +
            '<a href="{3}" target="{4}" data-notify="url"></a>' +
          '</div>'
      });
  } */


  allBpmChart(){

    var etichets = []
    var counter = 0
    var minutes = 0
    for (let i = 0; i < Array.from(Array(this.train.bpm.length).keys()).length; i++) {
      if(counter > 60){
        counter = 0;
        minutes += 1}
      var pad = ''
      if(counter <10)
        pad ='0'
      etichets.push(String(minutes+':'+pad+String(counter)))
      counter +=1
    } 

    var bpmDom = document.getElementById('bpm')!;
    var bpm = echarts.init(bpmDom);
    var bpmoption: EChartsOption;
    var index : number[] = [] as number[]
    for (let i = 1; i <= ((this.train.bpm.length/60 )); i++) {
      index.push(i*60)
    }
    var obj: xAxisObj[] = [] as xAxisObj[]
    for (const idx of index) {
      var objex : xAxisObj = {} as xAxisObj;
      objex.xAxis = idx;
      obj.push(objex)
    }
  
    bpmoption = {
      tooltip: {
        trigger: 'axis',
        position: function (pt) {
          return [pt[0], '10%'];
        }
      },
      title: {
        left: 'center',
        text: 'Train BPM trend'
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: etichets,
        axisLabel: {
        
        }
        
      },
      yAxis: {
        name : 'Bpm',
        nameLocation: 'middle',
        type: 'value',
        boundaryGap: [0, '100%'],
        min : Math.min(...this.train.bpm) -5,
        max : Math.max(...this.train.bpm) +5
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          start: 0,
          end: 100
        }
      ],
      series:[ 
        {
          name: 'BPM',
          type: 'line',
          symbol: 'none',
          sampling: 'lttb',
          markLine: {
            silent: true, // ignore mouse events
            symbol: ['none', 'none'],
            label: {                                 
              position: 'middle',
              show: true,
              formatter: function(d) {
                return String(Number(d.value)/60) + ':00 ';
              } },
            data: obj,
            lineStyle:{ 
              color:'rgb(105,105,105)'
            },
            
          },
          itemStyle: {
            color: '#d9534f'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: '#d9534f'
              },
              {
                offset: 1,
                color: 'rgb(252, 246, 240)'
              }
            ])
          },
          data: this.train.bpm
        },{
  
          type: 'line',
         markLine: {
          silent: true, // ignore mouse events
          symbol: ['none', 'none'],
          label: {   
            color : '#d9534f',                            
            show : true, 
            position:'middle',
            formatter: function(d) {
              return 'Max bpm: '+d.value;
            } 
          },
          data: [{yAxis : Math.max(...this.train.bpm)}],
          lineStyle:{ 
            color:'#d9534f'
          },
          
        },
      }
      ]
    };
    bpmoption && bpm.setOption(bpmoption);

  }

  createComparisonChart(){
    const labels = Array.from(Array(this.train.bpm.length).keys())
    var adaptedAllTimes : number [] = [] as number [];

    var d = 0
    for (const time of this.allTimes) {
      
      var iterations = 30
      if(d ==this.train.first_half_sprint+ this.train.first_half_sprint_push) {
        iterations = this.train.interval_minutes*60
          }
      
      for (let i = 0; i < iterations; i++) {
        adaptedAllTimes.push(time)
        
      }
      d = d + 1 
    }

    var etichets = []
    var counter = 0
    var minutes = 0
    for (let i = 0; i < Array.from(Array(this.train.bpm.length).keys()).length; i++) {
      if(counter > 60){
        counter = 0;
        minutes += 1}
      var pad = ''
      if(counter <10)
        pad ='0'
      etichets.push(String(minutes+':'+pad+String(counter)))
      counter +=1
    } 

    var bpmDom = document.getElementById('BPM-times')!;
    var bpm = echarts.init(bpmDom);
    var bpmoption: EChartsOption;
    var index : number[] = [] as number[]
    for (let i = 1; i <= ((this.train.bpm.length/60 )); i++) {
      index.push(i*60)
    }
    var obj: xAxisObj[] = [] as xAxisObj[]
    for (const idx of index) {
      var objex : xAxisObj = {} as xAxisObj;
      objex.xAxis = idx;
      obj.push(objex)
    }
  
    bpmoption = {
      tooltip: {
        trigger: 'axis',
        position: function (pt) {
          return [pt[0], '10%'];
        }
      },
      title: {
        left: 'center',
        text: 'Train BPM trend'
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          restore: {},
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: etichets,
        axisLabel: {
        
        }
        
      },
      yAxis: [{
        
        name : 'Bpm',
        nameLocation: 'middle',
        type: 'value',
        boundaryGap: [0, '100%'],
        min : Math.min(...this.train.bpm) -5,
        max : Math.max(...this.train.bpm) +5,
      },
      {
        
        name : 'Time [s]',
        nameLocation: 'middle',
        type: 'value',
        boundaryGap: [0, '100%'],
        min : Math.min(...adaptedAllTimes) -0.5,
        max : Math.max(...adaptedAllTimes) +0.5,
        id:'tempi'

      }
    ],
      
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          start: 0,
          end: 100
        }
      ],
      series:[
        {
          name: 'BPM',
          type: 'line',
          symbol: 'none',
          sampling: 'lttb',
          markLine: {
            silent: true, // ignore mouse events
            symbol: ['none', 'none'],
            label: {                                 
              position: 'middle',
              show: true,
              formatter: function(d) {
                return String(Number(d.value)/60) + ':00 ';
              } },
            data: obj,
            lineStyle:{ 
              color:'rgb(105,105,105)'
            },
            
          },
          itemStyle: {
            color: '#d9534f'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: '#d9534f'
              },
              {
                offset: 1,
                color: 'rgb(252, 246, 240)'
              }
            ])
          },
          data: this.train.bpm
        },{
  
          type: 'line',
         markLine: {
          silent: true, // ignore mouse events
          symbol: ['none', 'none'],
          label: {   
            color : '#d9534f',                            
            show : true, 
            position:'middle',
            formatter: function(d) {
              return 'Max bpm: '+d.value;
            } 
          },
          data: [{yAxis : Math.max(...this.train.bpm)}],
          lineStyle:{ 
            color:'#d9534f'
          },
          
        },
      },
      {
        name: 'Time',
        data: adaptedAllTimes,
        type: 'line',
        yAxisId:'tempi',
        lineStyle:{ 
          color:'#0000A3'
        },        
      } 
      ]
    };
    bpmoption && bpm.setOption(bpmoption);

    const BPMTimesdata = {
      labels: labels,
      datasets: [{
        label: 'BPM of ' + this.train.date +' train',
        data: this.train.bpm,
        backgroundColor:'#edbbc1',
        borderColor: 'rgb(223, 71, 89)',
        pointBorderColor: '	rgb(223, 71, 89)',
        tension: 0.1,
        borderWidth: 2,
        pointBorderWidth: 0.1,
        pointRadius: 0.1,
        yAxisID: 'y'


      },
      {
        label: 'Time',
        data: adaptedAllTimes,
        borderColor: 'rgb(54, 162, 235)',
        pointBorderColor: '	rgb(54, 162, 235)',
        pointRadius: 0.01,
        pointBorderWidth: 0.01,
        borderWidth: 3,
        yAxisID: 'y1'

      }],
    };

    
    var bpmTimeChart = new Chart('',{
      type: 'line',
      data: BPMTimesdata,
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          title: {
            display: true,
            text: 'Chart.js Line Chart - Multi Axis'
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
    
            // grid line settings
            grid: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
          },
        }
      },
    });
  }

}


