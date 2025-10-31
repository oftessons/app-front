import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

export interface Flashcard {
  id: number;
  tema: string;
  subtema: string;
  pergunta: string;
  resposta: string;
  dificuldade: string;
  relevancia: number;
}

@Injectable({
  providedIn: 'root',
})
export class FlashcardService {
  private apiUrl = `${environment.apiURLBase}/api/flashcard`;
  constructor(private http: HttpClient) {}

  getFlashcardsContador(): Observable<ContadorFlashcardsTemaDTO[]> {
    return this.http.get<ContadorFlashcardsTemaDTO[]>(
      `${this.apiUrl}/contar-por-tema-e-geral`
    );
  }

  getStatsPorTema(tema: string): Observable<SubtemaStatsDTO[]> {
    return this.http.get<SubtemaStatsDTO[]>(
      `${this.apiUrl}/${tema.toUpperCase()}/subtemas-e-estudados`
    );
  }

  getFlashcardsParaEstudar(
    tema: string,
    subtema?: string,
    dificuldade?: string
  ): Observable<Flashcard[]> {
    let params = new HttpParams();

    params = params.set('tema', tema.toUpperCase());

    if (subtema) {
      params = params.set('subtema', subtema.toUpperCase());
    }

    if (dificuldade) {
      params = params.set('dificuldade', dificuldade);
    }

    return this.http.get<Flashcard[]>(
      `${this.apiUrl}/buscar-flashcards-filtro`,
      { params }
    );
  }

  deleteFlashcard(id: number): Observable<string>{
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text'})
  }
}
