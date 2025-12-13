import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Questao } from '../sistema/page-questoes/questao';
import { Resposta } from '../sistema/Resposta';
import { RespostaDTO } from '../sistema/RespostaDTO';
import { SugestaoQuestaoResponseDTO } from '../sistema/page-mentoria/SugestaoQuestaoIResponseDTO';
import { RespostaSalva } from '../sistema/page-questoes/respostas-salvas';

@Injectable({
  providedIn: 'root',
})
export class QuestoesService {
  apiURL: string = environment.apiURLBase + '/api/questoes';
  private readonly requestsCache: Map<string, Observable<Questao[]>> = new Map();
  private readonly listaDeIdsFiltrados = new BehaviorSubject<number[]>([]);
  listaDeIdsFiltrados$ = this.listaDeIdsFiltrados.asObservable();
  private estadoNavegacao: any = null;


  constructor(private http: HttpClient) { }

  public obterIds(): void {
    console.log(this.listaDeIdsFiltrados);
  }


  public setQuestoesFiltradas(questoes: any[]): void {
    const ids = questoes.map(q => q.id);
    this.listaDeIdsFiltrados.next(ids);
  }

  public getProximoId(idAtual: number): number | null {
    const ids = this.listaDeIdsFiltrados.getValue();
    const indiceAtual = ids.indexOf(idAtual);

    if (indiceAtual > -1 && indiceAtual < ids.length - 1) {
      return ids[indiceAtual + 1];
    }

    return null;
  }

  getAnteriorId(idAtual: number): number | null {
    const ids = this.listaDeIdsFiltrados.getValue();
    const indiceAtual = ids.indexOf(idAtual);

    if (indiceAtual > 0) {
      return ids[indiceAtual - 1];
    }

    return null;
  }

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
            errorMessage = `Erro: ${error.error.message}`;
          } else {
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

  obterSugestoesDeQuestoes(userId: number, groups: number, limit: number): Observable<SugestaoQuestaoResponseDTO[] | null> {
    const url = `${this.apiURL}/sugestoes`;
    const params = new HttpParams()
      .set('user_id', userId.toString())
      .set('groups', groups.toString())
      .set('limit', limit.toString());

    return this.http.get<SugestaoQuestaoResponseDTO[]>(url, { params, observe: 'response' }).pipe(
      map(response => {
        if (response.status === 204) {
          return null;
        }
        return response.body || null;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao obter sugestões de questões:', error);
        return throwError('Erro ao obter sugestões de questões.');
      })
    );
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
    size: number = 10,
    seed?: number
  ): Observable<any[]> {
    const url = `${this.apiURL}/filtro/${userId}`;
    let params = new HttpParams();

    for (const filtro in filtros) {
      if (filtros.hasOwnProperty(filtro) && filtros[filtro] !== null) {
        if (Array.isArray(filtros[filtro])) {
          filtros[filtro].forEach((value: string) => {
            params = params.append(filtro, value);
          });
        } else {
          params = params.set(filtro, filtros[filtro]);
        }
      }
    }


    params = params.set('page', page.toString());
    params = params.set('size', size.toString());

    if (seed) {
      params = params.set('seed', seed.toString());
    }

    const cacheKey = `${url}?${params.toString()}`;

    console.log('Cache Key:', cacheKey);

    if (this.requestsCache.has(cacheKey)) {
      return this.requestsCache.get(cacheKey)!;
    }

    const request = this.http.get<Questao[]>(url, { params }).pipe(
      shareReplay({ bufferSize: 1, refCount: false })
    );

    this.requestsCache.set(cacheKey, request);
    return request;
  }

  salvarEstadoNavegacao(estado: any): void {
    this.estadoNavegacao = estado;
  }

  obterEstadoNavegacao(): any {
    return this.estadoNavegacao;
  }

  limparEstadoNavegacao(): void {
    this.estadoNavegacao = null;
  }

  clearRequestsCache(): void {
    this.requestsCache.clear();
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

  getPaginatedQuestaoIds(page: number, size: number): Observable<any> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    const url = `${this.apiURL}/obter-ids`;
    return this.http.get<any>(url, { params });
  }

  atribuirComentador(formData: FormData): Observable<{ status: number; message: string }> {
    const url = `${this.apiURL}/atribuir-comentador`;

    return this.http.post<string>(url, formData, {
      responseType: 'text' as 'json'
    }).pipe(
      map((response: string) => {
        const message = response || 'Comentador atribuído com sucesso!';
        return { status: 200, message };
      }),

      catchError((error: any) => {
        console.log('Erro bruto recebido do HttpClient:', error);

        let status = 0;
        let message = 'Erro desconhecido ao atribuir comentador.';

        if (error instanceof HttpErrorResponse) {
          status = error.status ?? 0;

          if (typeof error.error === 'string' && error.error.trim().length > 0) {
            message = error.error.trim();
          }
          else if (error.error && typeof error.error === 'object' && 'message' in error.error) {
            message = (error.error as any).message || message;
          }
          else if (error.message) {
            message = error.message;
          }

          if (status) {
            message = `(${status}) ${message}`;
          }
        }
        else if (error && typeof error === 'object' && 'message' in error) {
          message = (error as any).message || message;
        }

        return throwError(() => ({ status, message }));
      })
    );
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
    questaoId: number,
    simuladoId?: number,
    filtroId?: number
  ): Observable<{
    opcaoSelecionada: string;
    correct: boolean;
    opcaoCorreta: string;
  } | null> {
    let url = `${this.apiURL}/respondido/${idUser}?questaoId=${questaoId}`;

    if (simuladoId && simuladoId !== 0) {
      url += `&simuladoId=${simuladoId}`;
    }
    if (filtroId && filtroId !== 0) {
      url += `&filtroId=${filtroId}`;
    }

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
        catchError(() => throwError('Erro ao verificar a resposta.'))
      );
  }

  buscarQuestaoPorId(
    usuarioId: number,
    questaoId: number
  ): Observable<Questao | null> {
    const url = `${this.apiURL}/buscar-questao/${usuarioId}?questaoId=${questaoId}`;

    return this.http.get<Questao>(url, { observe: 'response' }).pipe(
      map((response) => {
        if (response.status === 204) {
          return null;
        }
        return response.body || null;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Erro ao buscar questão:', error);
        return throwError(
          'Erro ao buscar questão. Por favor, tente novamente.'
        );
      })
    );
  }

  getRespostasSalvasParaFiltro(usuarioId: number, filtroId: number): Observable<RespostaSalva[]> {
    return this.http.get<RespostaSalva[]>(`${this.apiURL}/respostas/filtro/${filtroId}/usuario/${usuarioId}`);
  }

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

  getCuriosidades(idQuestao: number): Observable<any[]> {
    const url = `${this.apiURL}/curiosidades/${idQuestao}`;

    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        console.error('Erro ao buscar curiosidades:', error);
        return throwError('Erro ao buscar curiosidades dos subtemas.');
      })
    );
  }
}