import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Aula } from '../sistema/painel-de-aulas/aula';

@Injectable({
  providedIn: 'root'
})
export class AulasService {

  apiURL: string = environment.apiURLBase + '/api/aulas';
  constructor(private http: HttpClient) {}

  salvar(formData: FormData): Observable<any> {
    const headers = new HttpHeaders();

    return this.http
      .post<any>(`${this.apiURL}/cadastro`, formData, {
        headers,
        responseType: 'text' as 'json',
      })
      .pipe(
        map((response) => {
          try {
            const jsonResponse = JSON.parse(response);
            return jsonResponse || { message: 'Aula salva com sucesso!' };
          } catch (e) {
            return { message: 'Aula salva com sucesso!' };
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

  listarAulasPorCategoria(categoria: string): Observable<Aula[]> {
    return this.http.get<Aula[]>(`${this.apiURL}/${categoria}`).pipe(
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
}
