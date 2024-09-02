import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Importar a interface para o DTO Filtro
import { FiltroDTO } from '../sistema/filtroDTO';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FiltroService {


  apiURL: string = environment.apiURLBase + '/api/filtro';
  constructor(private http: HttpClient) { }


  // Método para cadastrar um novo filtro
  salvarFiltro(filtro: FiltroDTO): Observable<string> {
    return this.http.post<string>(`${this.apiURL}/cadastro`, filtro)
      .pipe(
        catchError(this.handleError<string>('salvarFiltro'))
      );
  }

  // Método para obter todos os filtros
  getFiltros(): Observable<FiltroDTO[]> {
    return this.http.get<FiltroDTO[]>(this.apiURL)
      .pipe(
        catchError(this.handleError<FiltroDTO[]>('getFiltros', []))
      );
  }

  // Método para obter um filtro por ID
  getFiltroById(id: number): Observable<FiltroDTO> {
    return this.http.get<FiltroDTO>(`${this.apiURL}/${id}`)
      .pipe(
        catchError(this.handleError<FiltroDTO>('getFiltroById'))
      );
  }

  // Método para deletar um filtro por ID
  deletarFiltro(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`)
      .pipe(
        catchError(this.handleError<void>('deletarFiltro'))
      );
  }

  // Método para editar um filtro existente
  editarFiltro(id: number, filtro: FiltroDTO): Observable<void> {
    return this.http.put<void>(`${this.apiURL}/${id}`, filtro)
      .pipe(
        catchError(this.handleError<void>('editarFiltro'))
      );
  }

  // Função para tratamento de erros
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
