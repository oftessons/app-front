import { HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';

import { Injectable } from '@angular/core';

import { environment } from 'src/environments/environment.prod';

import { catchError, map, tap } from 'rxjs/operators';

import { Observable, throwError } from 'rxjs';

import { Aula } from '../sistema/painel-de-aulas/aula';

import { CadastroAulaResponse } from '../sistema/cadastro-de-aulas/cadastro-aulas-response';



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



  uploadVideoS3(

    presignedUrl: string,

    videoFile: File,

    contentType: string

  ): Observable<HttpEvent<any>> {



    return new Observable(subscriber => {



      const xhr = new XMLHttpRequest();



      xhr.open('PUT', presignedUrl, true);



      xhr.setRequestHeader('Content-Type', contentType);



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

          subscriber.error(new Error(`Falha no upload S3: ${xhr.statusText}`));

        }

      };



      xhr.onerror = () => {

        subscriber.error(new Error('Falha de rede no upload para o S3.'));

      };



      xhr.onabort = () => {

        subscriber.complete();

      };



      xhr.send(videoFile);



      return () => {

        xhr.abort();

      };

    });

  }



  obterUrlDeVideo(aulaId: number): Observable<{ presignedGetUrl: string }> {

    const url = `${this.apiURL}/${aulaId}/play`;



    return this.http.get<{ presignedGetUrl: string }>(url);

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