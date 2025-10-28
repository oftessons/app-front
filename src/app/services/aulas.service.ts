import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Aula } from '../sistema/painel-de-aulas/aula';
import { AulaDTO } from '../sistema/cadastro-de-aulas/AulaDTO';


@Injectable({
  providedIn: 'root'
})
export class AulasService {

  apiURL: string = environment.apiURLBase + '/api/aulas';
  constructor(private http: HttpClient) { }

  salvar(formData: FormData): Observable<HttpEvent<Aula>> {
    const url = `${this.apiURL}/cadastro`;

    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true,
    });

    return this.http.request(req);
  }


  iniciarUpload(request: { aulaDTO: AulaDTO, fileName: string, contentType: string }): Observable<{ uploadId: string, key: string }> {
    const url = `${this.apiURL}/iniciar-upload`;
    return this.http.post<{ uploadId: string, key: string }>(url, request);
  }


  gerarUrlParte(key: string, uploadId: string, partNumber: number): Observable<{ presignedUrl: string }> {
    const url = `${this.apiURL}/gerar-url-parte`;
    const request = { key, uploadId, partNumber };
    return this.http.post<{ presignedUrl: string }>(url, request);
  }


  finalizarUpload(formData: FormData): Observable<Aula> {
    const url = `${this.apiURL}/finalizar-upload`;
    return this.http.post<Aula>(url, formData);
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

  buscarAulaPorId(id: number): Observable<Aula> {
    const url = `${this.apiURL}/${id}`;
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
    return this.http.delete(`${this.apiURL}/${id}`, { responseType: 'text' }).pipe(
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

  atualizar(id: number, formData: FormData): Observable<any> {
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
}
