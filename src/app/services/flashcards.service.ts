import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ContadorFlashcardsTemaDTO {
  tema: string;
  qtdFlashcards: number;
  total: number;
}

export interface SubtemaStatsDTO {
  subtema: string;
  totalFlashcards: number;
  flashcardsEstudados: number;
}

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private apiUrl = `${environment.apiURLBase}/api/flashcard`;
  constructor(private http: HttpClient) { }

  getFlashcardsContador(): Observable<ContadorFlashcardsTemaDTO[]> {
    return this.http.get<ContadorFlashcardsTemaDTO[]>(`${this.apiUrl}/contar-por-tema-e-geral`);
  }

  getStatsPorTema(tema: string): Observable<SubtemaStatsDTO[]> {
    return this.http.get<SubtemaStatsDTO[]>(`${this.apiUrl}/${tema}/subtemas-e-estudados`);
  }
}