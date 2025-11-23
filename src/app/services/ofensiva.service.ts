import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { tap } from 'rxjs/operators';

// Interface para os dados da ofensiva (do DTO do back-end)
export interface OfensivaDados {
  ofensivaAtual: number;
  dataUltimaOfensiva: string; // (Vem como string ISO)
  diasDaSemana: string[]; // (O back-end precisa enviar os dias)
  ofensivaAtualizadaHoje: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class OfensivaService {
  // (Assumindo um novo Controller no back-end)
  private apiUrl = `${environment.apiURLBase}/api/ofensiva`;

  private dadosOfensivaSubject = new BehaviorSubject<OfensivaDados | null>(null);
  public dadosOfensiva$ = this.dadosOfensivaSubject.asObservable();

  constructor(private http: HttpClient) {}

  getDadosOfensiva(): Observable<OfensivaDados> {
    return this.http.get<OfensivaDados>(`${this.apiUrl}/dados`).pipe(
      tap(dados => {
        this.dadosOfensivaSubject.next(dados);
      })
    );
  }

  public getValorAtual(): OfensivaDados | null {
    return this.dadosOfensivaSubject.getValue();
  }
}
