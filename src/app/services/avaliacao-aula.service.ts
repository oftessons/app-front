import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AvaliacaoAula } from '../sistema/modulo-de-aulas/avaliacao-aula';

@Injectable({
  providedIn: 'root'
})
export class AvaliacaoAulaService {
  private apiUrl = `${environment.apiURLBase}/avaliacoes`;
  private localStorageKey = 'avaliacoes-aulas';
  private useLocalStorage = true;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private obterAvaliacoesLocais(): AvaliacaoAula[] {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data) : [];
  }

}
