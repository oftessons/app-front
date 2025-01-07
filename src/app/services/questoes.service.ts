import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Questao } from '../sistema/page-questoes/questao';
import { Ano } from '../sistema/page-questoes/enums/ano';
import { Resposta } from '../sistema/Resposta';
import { RespostaDTO } from '../sistema/RespostaDTO';

@Injectable({
  providedIn: 'root',
})
export class QuestoesService {
  apiURL: string = environment.apiURLBase + '/api/questoes';
  constructor(private http: HttpClient) {}

  getAcertosEErrosPorTipoDeProva(usuarioId: number): Observable<any> {
    return this.http
      .get<any>(`${this.apiURL}/acertos-erros/${usuarioId}`)
      .pipe(
        catchError((error) =>
          throwError('Erro ao tentar obter acertos e erros.')
        )
      );
  }

  getAcertosEErrosPorMes(
    usuarioId: number
  ): Observable<Map<string, Map<string, number>>> {
    return this.http
      .get<Map<string, Map<string, number>>>(
        `${this.apiURL}/acertos-erros-mes/${usuarioId}`
      )
      .pipe(
        catchError((error) =>
          throwError('Erro ao tentar obter acertos e erros por mês.')
        )
      );
  }

  getQuestoesFeitasPorTema(usuarioId: number): Observable<Map<string, number>> {
    return this.http
      .get<Map<string, number>>(
        `${this.apiURL}/questoes-feitas-tema/${usuarioId}`
      )
      .pipe(
        catchError((error) =>
          throwError('Erro ao tentar obter as questões feitas por tema.')
        )
      );
  }

  getAcertosErrosPorTema(idUser: number): Observable<any> {
    return this.http.get(`${this.apiURL}/acertos-erros-tema/${idUser}`);
  }

  salvar(formData: FormData): Observable<any> {
    const headers = new HttpHeaders();

    return this.http
      .post<any>(`${this.apiURL}/cadastro`, formData, {
        headers,
        responseType: 'text' as 'json',
      })
      .pipe(
        map((response) => {
          // Sucesso
          try {
            const jsonResponse = JSON.parse(response);
            return jsonResponse || { message: 'Questão salva com sucesso!' };
          } catch (e) {
            return { message: 'Questão salva com sucesso!' };
          }
        }),
        catchError((error) => {
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

  atualizarQuestao(formData: FormData, id: number): Observable<any> {
    return this.http
      .put<any>(`${this.apiURL}/atualizarQuestao/${id}`, formData, {
        responseType: 'text' as 'json',
      })
      .pipe(
        map((response) =>
          this.handleResponse(response, 'Questão atualizada com sucesso!')
        ),
        catchError((error) => this.handleError(error))
      );
  }

  private handleResponse(response: any, defaultMessage: string): any {
    try {
      const jsonResponse = JSON.parse(response);
      return jsonResponse || { message: defaultMessage };
    } catch {
      return { message: defaultMessage };
    }
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      errorMessage = `Erro no servidor: ${error.status}, ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

  getQuestaoById(id: number): Observable<Questao> {
    return this.http.get<Questao>(`${this.apiURL}/${id}`);
  }

  obterTodasQuestoes(): Observable<Questao[]> {
    return this.http.get<Questao[]>(`${this.apiURL}/todas`);
  }

  deletar(questao: Questao): Observable<any> {
    return this.http.delete<any>(`${this.apiURL}/${questao.id}`);
  }

  filtrarQuestoes(
    userId: number,
    filtros: any,
    page: number = 0,
    size: number = 10
  ): Observable<any[]> {
    const url = `${this.apiURL}/filtro/${userId}`;
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

  filtrarSimulados(
    userId: number,
    filtros: any,
    page: number = 0,
    size: number = 10
  ): Observable<Questao[]> {
    const url = `${this.apiURL}/filtroSimulados/${userId}`;
    let params = new HttpParams();

    for (const filtro in filtros) {
      if (filtros.hasOwnProperty(filtro) && filtros[filtro] !== null) {
        params = params.set(filtro, filtros[filtro]);
      }
    }

    params = params.set('page', page.toString());
    params = params.set('size', size.toString());

    return this.http.get<Questao[]>(url, { params });
  }

  consultarQuestao(
    filtros: any,
    page: number = 0,
    size: number = 10
  ): Observable<Questao[]> {
    const url = `${this.apiURL}/consultar`;
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

    return this.http
      .get<Questao[]>(url, { params })
      .pipe(
        catchError((error) => throwError('Erro ao tentar obter as questões.'))
      );
  }

  checkAnswer(
    id: number,
    userId: number,
    resposta: RespostaDTO
  ): Observable<Resposta> {
    const url = `${this.apiURL}/${id}/check-questao/${userId}`;
    return this.http
      .post<Resposta>(url, resposta)
      .pipe(catchError((error) => throwError('Erro ao verificar a resposta.')));
  }

  questaoRespondida(
    idUser: number,
    questaoId: number
  ): Observable<{
    opcaoSelecionada: string;
    correct: boolean;
    opcaoCorreta: string;
  } | null> {
    const url = `${this.apiURL}/respondido/${idUser}?questaoId=${questaoId}`;
    return this.http
      .get<{
        opcaoSelecionada: string;
        correct: boolean;
        opcaoCorreta: string;
      }>(url, { observe: 'response' })
      .pipe(
        map((response) => {
          if (response.status === 204) {
            return null;
          }
          return response.body;
        }),
        catchError((error) => throwError('Erro ao verificar a resposta.'))
      );
  }

  // Método correto para buscar questão por ID
  buscarQuestaoPorId(
    usuarioId: number,
    questaoId: number
  ): Observable<Questao | null> {
    const url = `${this.apiURL}/buscar-questao/${usuarioId}?questaoId=${questaoId}`;

    return this.http.get<Questao>(url, { observe: 'response' }).pipe(
      map((response) => {
        if (response.status === 204) {
          return null; // Retorna null se não houver questão encontrada
        }
        return response.body || null; // Retorna a questão se for encontrada
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao buscar questão:', error);
        return throwError(
          'Erro ao buscar questão. Por favor, tente novamente.'
        );
      })
    );
  }

  // Método para obter acertos e erros de uma questão por ID
  getAcertosErrosQuestao(idQuestao: number): Observable<Map<string, string>> {
    const url = `${this.apiURL}/acertos-erros-questao/${idQuestao}`;

    return this.http.get<Map<string, string>>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao recuperar acertos e erros da questão:', error);
        return throwError(
          'Erro ao recuperar acertos e erros da questão. Por favor, tente novamente.'
        );
      })
    );
  }

  buscarAulaPorId(idUser: number, aulaId: number): Observable<any> {
    return this.http.get<any>(`/api/aulas/${idUser}/${aulaId}`);
  }
  
}
