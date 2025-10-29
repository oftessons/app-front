import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Importar a interface para o DTO Filtro
import { FiltroDTO } from '../sistema/filtroDTO';
import { environment } from 'src/environments/environment';
import { RespostasFiltroSessaoDTO } from '../sistema/page-questoes/RespostasFiltroSessaoDTO';
import { Questao } from '../sistema/page-questoes/questao';

@Injectable({
  providedIn: 'root',
})
export class FiltroService {
  apiURL: string = environment.apiURLBase + '/api/filtro';
  constructor(private http: HttpClient) { }

  // Método para cadastrar um novo filtro
  salvarFiltro(filtro: FiltroDTO, userId: number): Observable<any> {
    return this.http
      .post<any>(`${this.apiURL}/${userId}`, filtro)
      .pipe(catchError(this.handleError<any>('salvarFiltro')));
  }

  carregarQuestoesSalvas(questoesIds: number[]): Observable<Questao[]> {
    return this.http
      .post<Questao[]>(`${this.apiURL}/carregar-questoes-salvas`, questoesIds)
      .pipe(catchError(this.handleError<Questao[]>('carregarQuestoesSalvar')));
  }
  

  // Método para obter todos os filtros
  getFiltros(userId: number): Observable<FiltroDTO[]> {
    return this.http
      .get<FiltroDTO[]>(`${this.apiURL}/user/${userId}`)
      .pipe(catchError(this.handleError<FiltroDTO[]>('getFiltros', [])));
  }

  // Método para obter um filtro por ID
  getFiltroById(id: number): Observable<FiltroDTO> {
    return this.http
      .get<FiltroDTO>(`${this.apiURL}/${id}`)
      .pipe(catchError(this.handleError<FiltroDTO>('getFiltroById')));
  }

  // Método para deletar um filtro por ID
  deletarFiltro(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiURL}/${id}`)
      .pipe(catchError(this.handleError<void>('deletarFiltro')));
  }

  // Método para editar um filtro existente
  editarFiltro(id: number, filtro: FiltroDTO): Observable<void> {
    return this.http
      .put<void>(`${this.apiURL}/${id}`, filtro)
      .pipe(catchError(this.handleError<void>('editarFiltro')));
  }

  salvarQuestoesEmSessao(salvarRespostasFiltroDTO: RespostasFiltroSessaoDTO): Observable<string> {
    return this.http
      .post<string>(`${this.apiURL}/salvarQuestoesEmSessao`, salvarRespostasFiltroDTO)
      .pipe(catchError(this.handleError<string>('salvarQuestoesEmSessao')));
  }

  // Função para tratamento de erros
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
