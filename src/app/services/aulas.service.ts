import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AulasService {

  apiURL: string = environment.apiURLBase + '/api/aulas';
  constructor(private http: HttpClient) {}
}
