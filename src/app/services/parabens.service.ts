import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment.prod";
import {HttpClient} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError, tap} from "rxjs/operators";
import {TempoAssinaturaAndNascimento} from "../sistema/TempoAssinaturaAndNascimento";


@Injectable({
  providedIn: 'root'
})
export class ParabensService {

  apiURL: string = environment.apiURLBase + '/parabens';
  constructor(private http: HttpClient) {}


  VerificarComemoracaoHj(): Observable<TempoAssinaturaAndNascimento[]> {
    return this.http.get<TempoAssinaturaAndNascimento[]>(`${this.apiURL}/comemoracao`).pipe(
      tap((response) => {
        console.log('Resposta da VerificarComemoracaoHj:', response);
        return response;
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

}
