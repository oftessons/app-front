import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Filtro } from '../sistema/filtro';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FiltroService {

 
  apiURL: string = environment.apiURLBase + '/api/questoes';

  constructor(private http: HttpClient) { }

  salvarFiltro(filtro: Filtro): Observable<any> {
    return this.http.post<any>(`${this.apiURL}`, filtro)
      .pipe(
        catchError(error => {
          console.error('Erro ao salvar filtro:', error);
          return throwError(error);
        })
      );
  }

  getFiltros(): Observable<Filtro[]> {
    return this.http.get<Filtro[]>(`${this.apiURL}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter filtros:', error);
          return throwError(error);
        })
      );
  }

  deletarFiltro(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiURL}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao deletar filtro:', error);
          return throwError(error);
        })
      );
  }
}
