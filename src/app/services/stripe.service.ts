import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Usuario } from '../login/usuario';


@Injectable({
    providedIn: 'root'
})

export class StripeService {

    apiURL: string = environment.apiURLBase + '/api/assinatura';
    
    constructor(private http: HttpClient) {}

    createCheckoutSession(planoSelecionado: String) {
        const url = `${this.apiURL}/create-checkout-session?plano=${planoSelecionado}`;

        return this.http.get<Usuario>(url);

    } 
}