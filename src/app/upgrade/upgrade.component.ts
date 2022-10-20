import { Component, OnInit } from '@angular/core';
import { TimePredictionInputFeatures } from 'app/models/timePredictionInputFeatures';
import { PredictTimeService } from 'app/services/predict-time.service';

@Component({
  selector: 'app-upgrade',
  templateUrl: './upgrade.component.html',
  styleUrls: ['./upgrade.component.css']
})
export class UpgradeComponent implements OnInit {

  prediction : number = 0 ;
  X : TimePredictionInputFeatures = {} as TimePredictionInputFeatures;
  marks : number[] = [0,1,2,3,4,5,6,7,8,9,10]
  showSpinner : boolean = false;
  showPrediction : boolean = false;

  constructor(private predTimeService : PredictTimeService) { }

  async  ngOnInit(): Promise<void> {
    this.marks = [0,1,2,3,4,5,6,7,8,9,10];
    //await this.makePrediction();
    //console.log(this.prediction);
    
    
    // populating X
    
    this.X.sense                    = 0;
    this.X.starting_bpm             = 140;
    this.X.ending_bpm               = 160;
    this.X.max_bpm                  = 161;
    this.X.median_bpm               = 150.20;
    this.X.mean_bpm                 = 150.20;
    this.X.min_bpm                  = 140;
    this.X.delta_bpm                = 21;
    this.X.previous_mean_delta_bpm  = 18.2;
    this.X.variance_bpm             = 51.96;
    this.X.std_bpm                  = 7.21;
    this.X.previous_cronos_mean     = 11.76;
    this.X.previous_cronos_std      = 0.6;
    this.X.previous_cronos_variance = 0.36;
    this.X.previous_cronos_worst    = 17.38;
    this.X.previous_cronos_best     = 10.90;
    this.X.recovery_time            = 27.62
    this.X.phase                    = 2;
    this.X.total_previous_sprints   = 34;
    this.X.same_half_previous_sprints =34;
    this.X.previous_max_bpm_mean    = 161.20;
    this.X.previous_max_bpm_std     = 2.86;
    this.X.previous_max_bpm_variance= 8.2;
    this.X.previous_max_bpm_min     = 158.00;
    this.X.previous_max_bpm_max     = 165;
    this.X.previous_min_bpm_mean    = 143;
    this.X.previous_min_bpm_std     = 11.87;
    this.X.previous_min_bpm_variance= 141;
    this.X.previous_min_bpm_min     = 132;
    this.X.previous_min_bpm_max     = 156;
    this.X.previous_mean_bpm_mean   = 152.43;
    this.X.previous_mean_bpm_std    = 7.66;
    this.X.previous_mean_bpm_variance= 58.73;
    this.X.previous_mean_bpm_min    = 143.98;  
    this.X.previous_mean_bpm_max    = 160.75;  
    this.X.prev_time                = 12.38;
    this.X.prev_max_bpm             = 159;
    this.X.prev_min_bpm             = 132;
    this.X.prev_mean_bpm            = 143.98;
    this.X.humidity                 = 63;
    this.X.pressure                 = 1011;
    this.X.clouds                   = 0.1;
    this.X.wind_speed               = 0.57; 
    this.X.temperature              = 27.27;
    this.X.temperature_feels_like   = 28.68;
    this.X.co                       = 142;
    this.X.no2                      = 3.2; 
    this.X.o3                      = 97; 
    this.X.pm10                     = 13.6;
    this.X.pm2_5                    = 11.70;
    this.X.so2                      = 1.5;
    this.X.fatigue_before           = 0;
    this.X.fatigue_after            = 7;
    this.X.charge_before            = 0;


    await this.getWeatherData();
    await this.getAirPollutionData();

  }

  async getWeatherData(){
    //https://openweathermap.org/current cambiare con lat e lon
    await new Promise<void> ((resolve, reject) => {

    fetch('https://api.openweathermap.org/data/2.5/weather?q=ruffano&appid=ff1bc4683fc7325e9c57e586c20cc03e')
    .then(response=>response.json())
    .then(async data=>{ await this.setWeatherData(data);})
    resolve();
  })
    // let data = JSON.parse('{"coord":{"lon":72.85,"lat":19.01},"weather":[{"id":721,"main":"Haze","description":"haze","icon":"50n"}],"base":"stations","main":{"temp":297.15,"feels_like":297.4,"temp_min":297.15,"temp_max":297.15,"pressure":1013,"humidity":69},"visibility":3500,"wind":{"speed":3.6,"deg":300},"clouds":{"all":20},"dt":1580141589,"sys":{"type":1,"id":9052,"country":"IN","sunrise":1580089441,"sunset":1580129884},"timezone":19800,"id":1275339,"name":"Mumbai","cod":200}');
    // this.setWeatherData(data);
  }

  async getAirPollutionData(){
    //https://openweathermap.org/current cambiare con lat e lon
    await new Promise<void> ((resolve, reject) => {

    fetch('http://api.openweathermap.org/data/2.5/air_pollution?lat=39.98195&lon=18.24974&appid=ff1bc4683fc7325e9c57e586c20cc03e')
    .then(response=>response.json())
    .then(async data=>{ await this.setAirData(data);})
    resolve();
  })
    // let data = JSON.parse('{"coord":{"lon":72.85,"lat":19.01},"weather":[{"id":721,"main":"Haze","description":"haze","icon":"50n"}],"base":"stations","main":{"temp":297.15,"feels_like":297.4,"temp_min":297.15,"temp_max":297.15,"pressure":1013,"humidity":69},"visibility":3500,"wind":{"speed":3.6,"deg":300},"clouds":{"all":20},"dt":1580141589,"sys":{"type":1,"id":9052,"country":"IN","sunrise":1580089441,"sunset":1580129884},"timezone":19800,"id":1275339,"name":"Mumbai","cod":200}');
    // this.setWeatherData(data);
  }

  async setWeatherData(data: any){
  
    await new Promise<void> ((resolve, reject) => {

    
    // all METADATA to url: https://openweathermap.org/current
  
    this.X.temperature = Number((data.main.temp - 273.15).toFixed(1));
    this.X.temperature_feels_like = Number((data.main.feels_like - 273.15).toFixed(1));
    this.X.wind_speed = data.wind.speed; //Wind direction, degrees (meteorological)
    this.X.clouds = data.clouds.all;
    //this.WeatherData.rainLast1Hour = this.WeatherData.rainLast1Hour;
    //this.WeatherData.rainLast3Hour = this.WeatherData.rainLast3Hour;
    this.X.pressure = data.main.pressure;
    resolve();
  })
  }

  async setAirData(data: any){
  
    await new Promise<void> ((resolve, reject) => {

    
    // all METADATA to url: https://openweathermap.org/current
    this.X.co = data.list[0].components.co;
    this.X.no2 = data.list[0].components.no2;
    this.X.o3 = data.list[0].components.o3;
    this.X.pm2_5 = data.list[0].components.pm2_5;
    this.X.pm10 = data.list[0].components.pm10;
    this.X.so2 = data.list[0].components.so2;

    //console.log(this.X)
    resolve();
  })
  }

  async makePrediction(){
    await new Promise<void> ((resolve, reject) => {
      this.predTimeService.makePrediction().subscribe(res =>{
        
        this.prediction = res as number;

        resolve();
    })
  });
  }

  async reqPrediction(){
    console.log(this.X)
    await new Promise<void> ((resolve, reject) => {
      this.predTimeService.requestPrediction(this.X).subscribe(res =>{
        this.prediction = res as number;
        this.prediction = Math.round(this.prediction[0] * 100) / 100
        resolve();
    })
  });
  }

  async buttonPressed(){
    this.showSpinner = true;
    await this.reqPrediction();  
    await new Promise(f => setTimeout(f, 2000));
    this.showSpinner = false;
    this.showPrediction = true;
  }


}
