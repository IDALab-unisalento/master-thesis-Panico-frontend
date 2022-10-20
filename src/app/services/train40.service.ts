import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Train40Service {

  // Node/Express API
  getAllREST_API: string = 'http://localhost:8080/train40/getAll';
  getByIdREST_API: string = 'http://localhost:8080/train40/get-train40';

  //Http header
  httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private httpClient: HttpClient) { }

     // Get all objects
     GetAllTrain40() {
      return this.httpClient.get(`${this.getAllREST_API}`);
    }
   
    getById(id:string) :Observable<any>{
      return this.httpClient.get<any>(this.getByIdREST_API+'/'+id);
    }

    // Error 
    handleError(error: HttpErrorResponse) {
      let errorMessage = '';
      if (error.error instanceof ErrorEvent) {
        // Handle client error
        errorMessage = error.error.message;
      } else {
        // Handle server error
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
      console.log(errorMessage);
      return throwError(errorMessage);
    }
    
}
