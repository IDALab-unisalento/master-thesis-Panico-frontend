import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConconiService } from 'app/services/conconi.service';
import * as echarts from 'echarts';


type EChartsOption = echarts.EChartsOption

declare interface xAxisObj {
    xAxis : number
  }

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnInit {

  trainId : any = 0
  allConconiTests : any = {};
  conconiTest : any = {};
  maxPoints = [];
    
  constructor(private conconiService : ConconiService ,private route: ActivatedRoute) { }

  async ngOnInit() {

    this.trainId = this.route.snapshot.paramMap.get('id');
    await this.getConconi();
    
    this.conconiTest = this.allConconiTests.filter(
        train => train._id === this.trainId);
    this.conconiTest = this.conconiTest[0]
    console.log(this.conconiTest)

    this.maxPoints = [];
    for (let i = 0; i < this.conconiTest.speeds.length; i++) {
        var prov  = [];
        prov.push(this.conconiTest.time_anchors[i]);
        prov.push(this.conconiTest.bpm_at_the_end_of_step[i])
        this.maxPoints.push(prov);
        
    }

    this.createAreaCHart();
    this.conconiChart();


  }

  async getConconi(){
    await new Promise<void> ((resolve, reject) => {
      this.conconiService.GetAll().subscribe(res =>{
          this.allConconiTests = res;
          resolve();
            })
  });
  }

  async createAreaCHart(){
    await new Promise(f => setTimeout(f, 10));



    var etichets = []
    var counter = 0
    var minutes = 0
    for (let i = 0; i < Array.from(Array(this.conconiTest.bpm.length).keys()).length; i++) {
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
    for (let i = 1; i <= ((this.conconiTest.bpm.length/60 )); i++) {
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
        min : Math.min(...this.conconiTest.bpm) -5,
        max : Math.max(...this.conconiTest.bpm) +5
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
          data: this.conconiTest.bpm
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
          data: [{yAxis : Math.max(...this.conconiTest.bpm)}],
          lineStyle:{ 
            color:'#d9534f'
          },
          
        },
      },
      {
        type: 'line',
       markLine: {
        silent: true, // ignore mouse events
        symbol: ['none', 'none'],
        label: {   
          color : '#d9534f',                            
          show : true, 
          position:'middle',
          formatter: function(d) {
            return 'Anaerobic threshold: '+d.value;
          } 
        },
        data: [{yAxis : this.conconiTest.anaerobic_threshold}],
        lineStyle:{ 
          color:'#d9534f'
        },
        
      },
    },
      {
        type: 'scatter',
        data: this.maxPoints,
        color : 'rgb(0, 71, 171)'

      }
      ]
    };
    bpmoption && bpm.setOption(bpmoption);
  }

  async conconiChart(){
    await new Promise(f => setTimeout(f, 10));

    var conconiDom = document.getElementById('conconi')!;
    var conconi = echarts.init(conconiDom);
    var option: EChartsOption;
    option = {
      xAxis: {
        type: 'category',
        data: this.conconiTest.speeds,
        name : 'Speed [km/h]',
        nameLocation: 'middle',
      },
      yAxis: {
        type: 'value',
        name : 'Bpm',
        nameLocation: 'middle',
        min : Math.min(...this.conconiTest.bpm_at_the_end_of_step) -5,
        max : Math.max(...this.conconiTest.bpm_at_the_end_of_step) +5
      },
      series: [
        {
          data: this.conconiTest.bpm_at_the_end_of_step,
          type: 'line',
          symbol: 'image://https://apollohealthlib.blob.core.windows.net/health-library/2021/06/shutterstock_1236631984-scaled.jpg',
          symbolSize: 50,
          lineStyle: {
            color: '#5470C6',
            width: 4,
            type: 'dashed'
          },
          itemStyle: {
            borderWidth: 3,
            borderColor: '#EE6666',
            color: 'yellow'
          }
        },
        {
          type: 'line',
         markLine: {
          silent: true, // ignore mouse events
          symbol: ['none', 'none'],
          label: {   
            color : '#d9534f',                            
            show : true, 
            position:'middle',
            formatter: function(d) {
              return 'Anaerobic threshold: '+d.value;
            } 
          },
          data: [{yAxis : this.conconiTest.anaerobic_threshold}],
          lineStyle:{ 
            color:'#d9534f'
          },
          
        },
      }
      ]
    };
    
      option && conconi.setOption(option);

}
}
