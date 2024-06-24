import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
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
  
  salvar( questao: Questao ) : Observable<Questao> {
    return this.http.post<Questao>( `${this.apiURL}`, questao);
  }

  atualizar(questao: Questao): Observable<any> {
    return this.http.put<Questao>(`${this.apiURL}/${questao.id}`, questao).pipe(
      catchError(error => throwError(error))
    );
  }

  getQuestaoById(id: number): Observable<Questao> {
    return this.http.get<Questao>(`${this.apiURL}/${id}`).pipe(
      catchError(error => throwError(error))
    );
  }

  deletar(questao: Questao): Observable<any> {
    return this.http.delete<any>(`${this.apiURL}/${questao.id}`).pipe(
      catchError(error => throwError(error))
    );
  }

  getQuestoesByAno(ano: Ano): Observable<Questao[]> {
    return this.http.get<Questao[]>(`${this.apiURL}/ano/${ano}`).pipe(
      catchError(error => throwError(error))
    );
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

    return this.http.get<Questao[]>(url, { params }).pipe(
      catchError(error => throwError('Erro ao tentar obter as questões.'))
    );
  }
}
