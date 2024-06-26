import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
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
   
  salvar(questao: any) {
    return this.http.post(`${this.apiURL}/cadastro`, questao)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Algo deu errado; por favor, tente novamente mais tarde.';
    if (error.error instanceof ErrorEvent) {
      // Erro no lado do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else if (error.error && error.error.message) {
      // Erro no lado do servidor
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Outros tipos de erro
      errorMessage = `Código de erro: ${error.status}\nMensagem: ${error.message}`;
    }
    return throwError(errorMessage);
  }
  

atualizar(formData: FormData, id: number): Observable<any> {
    return this.http.put<any>(`${this.apiURL}/cadastro/${id}`, formData)
        .pipe(
            catchError(this.handleError)
        );
}


  getQuestaoById(id: number): Observable<Questao> {
    return this.http.get<Questao>(`${this.apiURL}/questoes/${id}`);
  }


  obterTodasQuestoes(): Observable<Questao[]> {
    return this.http.get<Questao[]>(`${this.apiURL}/todas`).pipe(
      catchError(this.handleError)
    );
  }


  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  filtrarQuestoes(filtros: any, page: number = 0, size: number = 10): Observable<Questao[]> {
    const url = `${this.apiURL}/filtro`;
    let params = new HttpParams();

    // Adicione os filtros como parâmetros de consulta
    for (const filtro in filtros) {
      if (filtros.hasOwnProperty(filtro) && filtros[filtro] !== null) {
        params = params.set(filtro, filtros[filtro]);
      }
    }

    // Adicione os parâmetros de paginação
    params = params.set('page', page.toString());
    params = params.set('size', size.toString());

    return this.http.get<Questao[]>(url, { params }).pipe(
      catchError(error => throwError('Erro ao tentar obter as questões.'))
    );
  }
}
