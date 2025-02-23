import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Aula } from '../sistema/painel-de-aulas/aula';

@Injectable({
  providedIn: 'root'
})
export class AulasService {

  apiURL: string = environment.apiURLBase + '/api/aulas';
  constructor(private http: HttpClient) {}

  salvar(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiURL}/cadastro`, formData, {
      responseType: 'text'
    }).pipe(
      map((response) => ({ message: response })),
      catchError((error) => {
        let errorMessage = 'Erro ao salvar a aula.';
  
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Erro: ${error.error.message}`;
        } else if (error.status) {
          errorMessage = `Erro no servidor: ${error.status} - ${error.message}`;
        }
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  atualizar(formData: FormData, id: number): Observable<any> {
    return this.http.put(`${this.apiURL}/${id}`, formData, {
      responseType: 'text'
    }).pipe(
      map((response) => ({ message: response })),
      catchError((error) => {
        let errorMessage = 'Erro ao atualizar a aula.';
  
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Erro: ${error.error.message}`;
        } else if (error.status) {
          errorMessage = `Erro no servidor: ${error.status} - ${error.message}`;
        }
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  

  listarAulasPorCategoria(categoria: string): Observable<Aula[]> {
    const url = `${this.apiURL}/${categoria}`;
    console.log('URL da solicitação:', url);
    return this.http.get<Aula[]>(`${this.apiURL}/categoria/${categoria}`).pipe(
      tap((response) => {
        console.log('Resposta das aulas por categoria:', response);
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

  listarTodasAulas(): Observable<Aula[]> {
    return this.http.get<Aula[]>(this.apiURL).pipe(
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

  buscarAulaPorId(idUser: number, aulaId: number): Observable<Aula> {
    const url = `${this.apiURL}/${aulaId}`;
    console.log('URL da solicitação:', url);
    return this.http.get<Aula>(url).pipe(
      tap((response) => {
        console.log('Resposta da aula por ID:', response);
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

  deletar(id: number): Observable<any> {
    return this.http.delete(`${this.apiURL}/${id}`).pipe(
      map((response) => ({ message: response })),
      catchError((error) => {
        let errorMessage = 'Erro ao deletar a aula.';
  
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Erro: ${error.error.message}`;
        } else if (error.status) {
          errorMessage = `Erro no servidor: ${error.status} - ${error.message}`;
        }
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
