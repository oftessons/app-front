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

export interface SessaoEstudoDTO {
  listaFlashcards: Flashcard[];
  idFlaschardContinuar: number;
  idSessao: number;
}

export interface Flashcard {
  id: number;
  tema: string;
  subtema: string;
  pergunta: string;
  resposta: string;
  dificuldade: string | null;
  relevancia: number | null;
  fotoUrlPergunta?: string;
  fotoUrlResposta?: string;
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

export interface ReqAvaliarFlashcardDTO {
  id: number;
  nota: number;
  sessaoId?: number;
  tempoAtivoMilisegundo: number;
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
    const temaUpper = tema?.toUpperCase();
    return this.http.get<SubtemaStatsDTO[]>(
      `${this.apiUrl}/${temaUpper}/subtemas-e-estudados`
    );
  }

  getFlashcardsParaEstudar(
    tema?: string,
    subtema?: string,
    dificuldade?: string,
    incluirConcluidos: boolean = false
  ): Observable<SessaoEstudoDTO> {
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

    params = params.set('incluirConcluidos', String(incluirConcluidos));

    return this.http.get<SessaoEstudoDTO>(
      `${this.apiUrl}/buscar-flashcards-filtro`,
      { params }
    );
  }

  deleteFlashcard(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      responseType: 'text',
    });
  }

  salvarFlashcard(
    dto: ReqSalvarFlashcardDTO,
    fotoPergunta?: File,
    fotoResposta?: File
  ): Observable<string> {
    const formData = new FormData();

    formData.append('pergunta', dto.pergunta);
    formData.append('resposta', dto.resposta);
    formData.append('tema', dto.tema);

    if (dto.subtema) {
      formData.append('subtema', dto.subtema);
    }

    if (dto.dificuldade) {
      formData.append('dificuldade', dto.dificuldade);
    }

    if (dto.relevancia !== undefined && dto.relevancia !== null) {
      formData.append('relevancia', String(dto.relevancia));
    }

    if (dto.createdBy) {
      formData.append('createdBy', String(dto.createdBy));
    }

    if (fotoPergunta) {
      formData.append('fotoPergunta', fotoPergunta);
    }

    if (fotoResposta) {
      formData.append('fotoResposta', fotoResposta);
    }

    return this.http.post(`${this.apiUrl}/cadastrar`, formData, {
      responseType: 'text',
    });
  }

  atualizarFlashcard(
    id: number,
    dto: ReqAtualizarFlashcardDTO,
    fotoPergunta?: File,
    fotoResposta?: File,
    removerFotoPergunta: boolean = false,
    removerFotoResposta: boolean = false
  ): Observable<string> {
    const formData = new FormData();

    formData.append('pergunta', dto.pergunta);
    formData.append('resposta', dto.resposta);
    formData.append('tema', dto.tema);

    if (dto.subtema) {
      formData.append('subtema', dto.subtema);
    }

    if (dto.dificuldade) {
      formData.append('dificuldade', dto.dificuldade);
    }

    formData.append('relevancia', String(dto.relevancia));

    if (fotoPergunta) {
      formData.append('fotoPergunta', fotoPergunta);
    }

    if (fotoResposta) {
      formData.append('fotoResposta', fotoResposta);
    }

    formData.append('removerFotoPergunta', String(removerFotoPergunta));
    formData.append('removerFotoResposta', String(removerFotoResposta));

    return this.http.post(`${this.apiUrl}/atualizarFlashcard/${id}`, formData, {
      responseType: 'text',
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
    pergunta?: string,
    incluirConcluidos: boolean = false
  ): Observable<SessaoEstudoDTO> {
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

    params = params.set('incluirConcluidos', String(incluirConcluidos));

    return this.http.get<SessaoEstudoDTO>(
      `${this.apiUrl}/buscar-flashcards-filtro`,
      { params }
    );
  }

  importarFlashcardsCsv(
    tema: string,
    subtema: string,
    csv: File
  ): Observable<any> {
    const temaEnum = tema?.toString().toUpperCase();
    const subTemaEnum = subtema?.toString().toUpperCase();

    const formData = new FormData();
    formData.append('tema', temaEnum);

    if (subTemaEnum) {
      formData.append('subTema', subTemaEnum);
    }

    formData.append('csv', csv, csv.name);

    return this.http.post(`${this.apiUrl}/cadastrar-csv`, formData);
  }

  avaliarFlashcard(dto: ReqAvaliarFlashcardDTO): Observable<string> {
    return this.http.post(`${this.apiUrl}/avaliar`, dto, {
      responseType: 'text',
    });
  }

  finalizarSessao(sessaoId: number): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/finalizar-sessao/${sessaoId}`,
      {},
      {
        responseType: 'text',
      }
    );
  }
}
