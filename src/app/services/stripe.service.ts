import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { catchError, map, tap } from 'rxjs/operators';
import { UsuarioDadosAssinatura } from '../login/usuario-dados-assinatura';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StripeService {
  apiURL: string = environment.apiURLBase + '/api/assinatura';

  constructor(private http: HttpClient) {}

  createCheckoutSession(planoSelecionado: String): Observable<any> {
    const url = `${this.apiURL}/create-checkout-session?plano=${planoSelecionado}`;

    return this.http.post(url, planoSelecionado);
  }

  createPortalSession(): Observable<any> {
    const url = `${this.apiURL}/create-portal-session`;

    return this.http.post(url, {});
  }

  getPlanInformation(): Observable<any>{ 
    const url = `${this.apiURL}/get-plan-information`;

    return this.http.post(url, {});

  }

  iniciarPeriodoTeste(): Observable<any> {
    return this.http.post<any>(`${this.apiURL}/iniciar-teste`, {})
      .pipe(
        catchError((error: any) => {
          return throwError(
            'Erro ao iniciar período de teste. Por favor, tente novamente.'
          );
        })
      );
  }

}
