import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Plano } from '../sistema/page-meu-perfil/plano';
@Injectable({
  providedIn: 'root',
})
export class StripeService {
  apiURL: string = environment.apiURLBase + '/api/assinatura';

  constructor(private http: HttpClient) {}

  createCheckoutSession(planoSelecionado: String) {
    const url = `${this.apiURL}/create-checkout-session?plano=${planoSelecionado}`;

    return this.http.post<Plano>(url, planoSelecionado);
  }

  createPortalSession() {
    const url = `${this.apiURL}/create-portal-session`;

    return this.http.post<Plano>(url, {});
  }

  getPlanInformation(): Observable<any>{ 
    const url = `${this.apiURL}/get-plan-information`;

    return this.http.post(url, {});

  }

}
