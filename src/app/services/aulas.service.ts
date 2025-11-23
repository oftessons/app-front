import { HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Aula } from '../sistema/painel-de-aulas/aula';
import { CadastroAulaResponse } from '../sistema/cadastro-de-aulas/cadastro-aulas-response';
import { VideoUrlResponse } from '../sistema/modulo-de-aulas/video-url-response';

@Injectable({

  providedIn: 'root'

})

export class AulasService {

  apiURL: string = environment.apiURLBase + '/api/aulas';

  constructor(private http: HttpClient) { }

  cadastrarAula(formData: FormData): Observable<HttpEvent<CadastroAulaResponse>> {
    const url = `${this.apiURL}/cadastro`;

    const req = new HttpRequest('POST', url, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request<CadastroAulaResponse>(req);
  }


  uploadVideoVdoCipher(
    clientPayload: CadastroAulaResponse['clientPayload'],
    videoFile: File
  ): Observable<HttpEvent<any>> {

    return new Observable(subscriber => {
      const xhr = new XMLHttpRequest();

      // uploadLink vem do clientPayload
      xhr.open('POST', clientPayload.uploadLink, true);

      xhr.upload.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable) {
          subscriber.next({
            type: HttpEventType.UploadProgress,
            loaded: event.loaded,
            total: event.total
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          subscriber.next(new HttpResponse({
            status: xhr.status,
            body: xhr.responseText
          }));
          subscriber.complete();
        } else {
          subscriber.error(new Error(`Falha no upload VdoCipher: ${xhr.status} - ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        subscriber.error(new Error('Falha de rede no upload para VdoCipher.'));
      };

      xhr.onabort = () => subscriber.complete();

      const formData = new FormData();
      formData.append('policy', clientPayload.policy);
      formData.append('key', clientPayload.key);
      formData.append('x-amz-signature', clientPayload['x-amz-signature']);
      formData.append('x-amz-algorithm', clientPayload['x-amz-algorithm']);
      formData.append('x-amz-date', clientPayload['x-amz-date']);
      formData.append('x-amz-credential', clientPayload['x-amz-credential']);
      formData.append('success_action_status', '201');
      formData.append('success_action_redirect', '');
      formData.append('file', videoFile);

      xhr.send(formData);

      return () => xhr.abort();
    });
  }


  obterUrlDeVideo(aulaId: number): Observable<VideoUrlResponse> {
    const url = `${this.apiURL}/${aulaId}/play`;

    return this.http.get<VideoUrlResponse>(url, {
      withCredentials: true
    });
  }

  listarAulasPorCategoria(categoria: string): Observable<Aula[]> {
    const url = `${this.apiURL}/categoria/${categoria}`;
    console.log('URL da solicitação:', url);
    return this.http.get<Aula[]>(url, { observe: 'response' }).pipe(
      map((response) => {
        if (response.status === 204) {
          console.log('Nenhuma aula encontrada para a categoria:', categoria);
          return [];
        }
        console.log('Resposta das aulas por categoria:', response.body);
        return response.body || [];
      }),
      catchError((error) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Erro: ${error.error.message}`;
        } else {
          errorMessage = `Erro no servidor: ${error.status}, ${error.message}`;
        }
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
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