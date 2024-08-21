import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Questao } from '../sistema/page-questoes/questao';
import { Ano } from '../sistema/page-questoes/enums/ano';
import { Resposta } from '../sistema/Resposta';
import { RespostaDTO } from '../sistema/RespostaDTO';

@Injectable({
  providedIn: 'root'
})
export class QuestoesService {

  apiURL: string = environment.apiURLBase + '/api/questoes';
  constructor(private http: HttpClient) { }

  getAcertosEErrosPorTipoDeProva(): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/acertos-erros`).pipe(
      catchError(error => throwError('Erro ao tentar obter acertos e erros.'))
    );
  }

  getAcertosEErrosPorMes(usuarioId: number): Observable<Map<string, Map<string, number>>> {
    return this.http.get<Map<string, Map<string, number>>>(`${this.apiURL}/acertos-erros-mes/${usuarioId}`).pipe(
      catchError(error => throwError('Erro ao tentar obter acertos e erros por mês.'))
    );
  }

  getQuestoesFeitasPorTema(usuarioId: number): Observable<Map<string, number>> {
    return this.http.get<Map<string, number>>(`${this.apiURL}/questoes-feitas-tema/${usuarioId}`).pipe(
      catchError(error => throwError('Erro ao tentar obter as questões feitas por tema.'))
    );
  }

  salvar(formData: FormData ): Observable<any> {
    const headers = new HttpHeaders();
    // Não defina o Content-Type, o navegador cuidará disso

    return this.http.post<any>(`${this.apiURL}/cadastro`, formData, { headers, responseType: 'text' as 'json' }).pipe(
      map(response => {
        // Sucesso
        try {
          const jsonResponse = JSON.parse(response);
          return jsonResponse || { message: 'Questão salva com sucesso!' };
        } catch (e) {
          return { message: 'Questão salva com sucesso!' };
        }
      }),
      catchError(error => {
        let errorMessage = '';

        if (error.error instanceof ErrorEvent) {
          // Erro no lado do cliente
          errorMessage = `Erro: ${error.error.message}`;
        } else {
          // Erro no lado do servidor
          errorMessage = `Erro no servidor: ${error.status}, ${error.message}`;
        }
        console.error(errorMessage);
        return throwError(errorMessage);
      })
    );
  }

  atualizar(formData: FormData, id: number): Observable<any> {
    return this.http.put<any>(`${this.apiURL}/cadastro/${id}`, formData);
  }

  getQuestaoById(id: number): Observable<Questao> {
    return this.http.get<Questao>(`${this.apiURL}/questoes/${id}`);
  }

  obterTodasQuestoes(): Observable<Questao[]> {
    return this.http.get<Questao[]>(`${this.apiURL}/todas`);
  }

  deletar(questao: Questao) : Observable<any> {
    return this.http.delete<any>(`${this.apiURL}/${questao.id}`);
  }

  filtrarQuestoes(filtros: any, page: number = 0, size: number = 10): Observable<any[]> {
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
  
    return this.http.get<Questao[]>(url, { params });
  }  

  consultarQuestao(filtros: any, page: number = 0, size: number = 10): Observable<Questao[]> {
    const url = `${this.apiURL}/consultarQuestao`;
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

  checkAnswer(id: number, userId: number, resposta: RespostaDTO): Observable<Resposta> {
    const url = `${this.apiURL}/${id}/check-questao/${userId}`;
    return this.http.post<Resposta>(url, resposta).pipe(
      catchError(error => throwError('Erro ao verificar a resposta.'))
    );
  }
}
