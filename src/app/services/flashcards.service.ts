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
  dificuldade: string | null;
  relevancia: number | null;
}

export interface ReqSalvarFlashcardDTO {
  pergunta: string;
  resposta: string;
  tema: string;
  subtema: string;
  dificuldade: string;
  relevancia?: number | null;
  createdBy?: number;
}

export interface ReqAtualizarFlashcardDTO {
  pergunta: string;
  resposta: string;
  tema: string;
  subtema: string;
  dificuldade: string;
  relevancia: number;
}

export interface TotalEstudadosDTO {
  totalEstudados: number;
}

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private apiUrl = `${environment.apiURLBase}/api/flashcard`;

  constructor(private http: HttpClient) {}

  getFlashcardsContador(): Observable<ContadorFlashcardsTemaDTO[]> {
    return this.http.get<ContadorFlashcardsTemaDTO[]>(`${this.apiUrl}/contar-por-tema-e-geral`);
  }

  getStatsPorTema(tema: string): Observable<SubtemaStatsDTO[]> {
    return this.http.get<SubtemaStatsDTO[]>(`${this.apiUrl}/${tema.toUpperCase()}/subtemas-e-estudados`);
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

    return this.http.get<Flashcard[]>(`${this.apiUrl}/buscar-flashcards-filtro`, { params });
  }

  deleteFlashcard(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  salvarFlashcard(dto: ReqSalvarFlashcardDTO): Observable<string> {
    return this.http.post(`${this.apiUrl}/cadastrar`, dto, {
      responseType: 'text'
    });
  }

  atualizarFlashcard(id: number, dto: ReqAtualizarFlashcardDTO): Observable<string> {
    return this.http.put(`${this.apiUrl}/atualizarFlashcard/${id}`, dto, {
      responseType: 'text'
    });
  }

  getTotalEstudados(): Observable<TotalEstudadosDTO> {
    return this.http.get<TotalEstudadosDTO>(`${this.apiUrl}/total-estudados`);
  }

  buscarFlashcards(
    tema?: string,
    subtema?: string,
    dificuldade?: string,
    relevancia?: number,
    pergunta?: string
  ): Observable<Flashcard[]> {
    let params = new HttpParams();
    if (tema) {
      params = params.set('tema', tema.toUpperCase());
    }
    if (subtema) {
      params = params.set('subtema', subtema.toUpperCase());
    }
    if (dificuldade) {
      params = params.set('dificuldade', dificuldade);
    }
    if (relevancia !== undefined && relevancia !== null) {
      params = params.set('relevancia', String(relevancia));
    }
    if (pergunta) {
      params = params.set('pergunta', pergunta);
    }
    return this.http.get<Flashcard[]>(`${this.apiUrl}/buscar-flashcards-filtro`, { params });
  }

  importarFlashcardsCsv(tema: string, csv: File): Observable<any> {
    const formData = new FormData();
    formData.append('tema', tema.toUpperCase());
    formData.append('csv', csv, csv.name);
    return this.http.post(`${this.apiUrl}/cadastrar-csv`, formData);
  }
}
