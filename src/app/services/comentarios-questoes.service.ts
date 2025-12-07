import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { environment } from "src/environments/environment";

export interface ComentarioAulaRequest {
    comentario: string;
}

export interface RespostaComentarioRequest {
    respostaComentario: string;
}

export interface ComentarioAulaResponse {
    id: number;
    texto: string;
    nomeAutor: string;
    dataComentario: string;
    permissaoAutor: 'ADMIN' | 'ALUNO' | 'PROFESSOR';
}

export interface RespostaComentarioResponse {
    id: number;
    texto: string;
    nomeAutor: string;
    dataComentario: string;
    permissaoAutor: 'ADMIN' | 'ALUNO' | 'PROFESSOR';
}

export interface CursorPageResponse<T> {
    items: T[];
    nextCursor: string | null;
    hasNext: boolean;
}

@Injectable({
    providedIn: 'root' 
})
export class ComentariosQuestoesService {

    private apiURL: string = environment.apiURLBase + '/api/questoes/comentarios';

    constructor(private http: HttpClient) { }

    obterComentariosQuestao(questaoId: number, cursor?: string, limit: number = 10): Observable<CursorPageResponse<ComentarioAulaResponse>> {
        let params = new HttpParams().set('limit', limit.toString());

        if (cursor) {
            params = params.set('cursor', cursor);
        }

        return this.http.get<CursorPageResponse<ComentarioAulaResponse>>(`${this.apiURL}/${questaoId}`, { params }).pipe(
            catchError(this.handleError)
        );
    }


    comentarQuestao(questaoId: number, request: ComentarioAulaRequest): Observable<ComentarioAulaResponse> {
        return this.http.post<ComentarioAulaResponse>(`${this.apiURL}/${questaoId}`, request).pipe(
            catchError(this.handleError)
        );
    }

    obterRespostasQuestao(aulaId: number, comentarioId: number, cursor?: string, limit: number = 5): Observable<RespostaComentarioResponse[]> {
        let params = new HttpParams().set('limit', limit.toString());

        if (cursor) {
            params = params.set('cursor', cursor);
        }

        return this.http.get<RespostaComentarioResponse[]>(`${this.apiURL}/${aulaId}/${comentarioId}/respostas`, { params }).pipe(
            catchError(this.handleError)
        );
    }


    responderComentarioQuestao(questaoId: number, comentarioId: number, request: RespostaComentarioRequest): Observable<void> {
        return this.http.post<void>(`${this.apiURL}/${questaoId}/${comentarioId}/respostas`, request).pipe(
            catchError(this.handleError)
        );
    }

    atualizarComentarioQuestao(questaoId: number, comentarioId: number, request: ComentarioAulaRequest): Observable<void> {
        return this.http.put<void>(`${this.apiURL}/${questaoId}/${comentarioId}`, request).pipe(
            catchError(this.handleError)
        );
    }


    deletarComentarioQuestao(aulaId: number, comentarioId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiURL}/${aulaId}/${comentarioId}`).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: any): Observable<never> {
        let errorMessage = 'Ocorreu um erro ao processar a solicitação.';

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Erro: ${error.error.message}`;
        } else if (error.status) {
            errorMessage = error.error?.message || `Erro no servidor: ${error.status}`;
        }

        console.error('ComentariosAulasService Error:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}