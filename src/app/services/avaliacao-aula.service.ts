import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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

  avaliarAula(avaliacao: AvaliacaoAula): Observable<AvaliacaoAula> {
    return this.http.post<AvaliacaoAula>(
      `${this.apiUrl}`,
      avaliacao,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Erro ao avaliar aula:', error);
        
        if (this.useLocalStorage) {
          this.salvarAvaliacaoLocal(avaliacao);
          return of(avaliacao);
        }
        
        throw error;
      })
    );
  }

  private salvarAvaliacaoLocal(avaliacao: AvaliacaoAula): void {
    const avaliacoes = this.obterAvaliacoesLocais();
    const index = avaliacoes.findIndex(a => a.idAula === avaliacao.idAula);
    
    if (index > -1) {
      avaliacoes[index] = { ...avaliacao, dataAvaliacao: new Date() };
    } else {
      avaliacoes.push({ ...avaliacao, dataAvaliacao: new Date() });
    }
    
    localStorage.setItem(this.localStorageKey, JSON.stringify(avaliacoes));
  }

  private obterAvaliacoesLocais(): AvaliacaoAula[] {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data) : [];
  }

  obterAvaliacaoUsuario(idAula: number): Observable<AvaliacaoAula | null> {
    return this.http.get<AvaliacaoAula>(
      `${this.apiUrl}/aula/${idAula}/usuario`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => response || null),
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        
        if (this.useLocalStorage) {
          const avaliacoes = this.obterAvaliacoesLocais();
          const avaliacao = avaliacoes.find(a => a.idAula === idAula);
          return of(avaliacao || null);
        }
        
        console.error('Erro ao obter avaliação:', error);
        return of(null);
      })
    );
  }

  obterMediaAvaliacoes(idAula: number): Observable<{ media: number; total: number }> {
    return this.http.get<{ media: number; total: number }>(
      `${this.apiUrl}/aula/${idAula}/media`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Erro ao obter média de avaliações:', error);
        
        if (this.useLocalStorage) {
          const avaliacoes = this.obterAvaliacoesLocais();
          const avaliacoesAula = avaliacoes.filter(a => a.idAula === idAula);
          
          if (avaliacoesAula.length > 0) {
            const soma = avaliacoesAula.reduce((acc, a) => acc + a.nota, 0);
            const media = soma / avaliacoesAula.length;
            return of({ media, total: avaliacoesAula.length });
          }
        }
        
        return of({ media: 0, total: 0 });
      })
    );
  }
}
