import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VendasService {
  apiURL: string = environment.apiURLBase + '/api/vendas';

  constructor(private http: HttpClient) {}


  obterDadosAssinatura(): Observable<any>{ 
    const url = `${this.apiURL}/obter-informacoes-plano`;

    return this.http.get(url, {});

  }

  obterDadosAssinaturaPorUsuario(userId: string): Observable<any> {
    const url = `${this.apiURL}/obter-informacoes-plano-usuario/${userId}`;

    return this.http.get(url, {});
  }

  obterPortalAcesso(): Observable<any>{
    const url = `${this.apiURL}/obter-portal-acesso`; 

    return this.http.get(url, {});

  }

}
