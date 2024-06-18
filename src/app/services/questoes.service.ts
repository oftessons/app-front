import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Questao } from '../sistema/page-questoes/questao';
import { Ano } from '../sistema/page-questoes/enums/ano';

@Injectable({
  providedIn: 'root'
})
export class QuestoesService {

  apiURL: string = environment.apiURLBase + '/api/questoes';

  constructor(private http: HttpClient) { }

  getQuestoesByAno(ano: Ano): Observable<Questao[]> {
    return this.http.get<Questao[]>(`${this.apiURL}/ano/${ano}`);
  }

  filtrarQuestoes(filtros: any): Observable<Questao[]> {
    const url = `${this.apiURL}/filtro`;
    let params = new HttpParams();

    // Adicione os filtros como parâmetros de consulta
    for (const filtro in filtros) {
      if (filtros.hasOwnProperty(filtro) && filtros[filtro] !== null) {
        params = params.set(filtro, filtros[filtro]);
      }
    }

    return this.http.get(url, { params: params, observe: 'response' })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 200) {
            return response.body as Questao[];
          } else {
            throw new Error('Erro na requisição.');
          }
        }),
        catchError((error: any) => {
          console.error('Ocorreu um erro:', error);
          return throwError('Erro ao tentar obter as questões.');
        })
      );
  }
}
