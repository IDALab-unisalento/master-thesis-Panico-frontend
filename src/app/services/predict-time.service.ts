
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PredictTimeService {

  // Node/Express API
  predictionAPI: string = 'http://127.0.0.1:8000/?format=json';
  postPredictionAPI: string = 'http://127.0.0.1:8000/add/?format=json';

  //Http header
  httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private httpClient: HttpClient) { }

     makePrediction() {
      return this.httpClient.get(`${this.predictionAPI}`);
    }

    requestPrediction(data : any) {
      return this.httpClient.post(`${this.postPredictionAPI}`, data);
    }
}
