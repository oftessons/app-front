import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment.prod";
import {HttpClient} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {Ofensiva} from "../sistema/Ofensiva";


@Injectable({
  providedIn: 'root'
})
export class OfensivaService {

  apiURL: string = environment.apiURLBase + '/usuario/ofensivas';
  constructor(private http: HttpClient) {}


  carregarOfensiva(): Observable<Ofensiva> {
    return this.http.get<Ofensiva>(`${this.apiURL}`);
  }
  darOfensivaDoDia(): Observable<Ofensiva> {
    return this.http.get<Ofensiva>(`${this.apiURL}/status`);
  }
}
