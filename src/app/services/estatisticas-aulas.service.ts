import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { ProgressoAulasDtoResponse } from "../sistema/painel-de-aulas/progresso-aulas-dto-response";

@Injectable({
    providedIn: 'root'
})
export class EstatisticasAulasService {

    apiURL: string = environment.apiURLBase + '/api/estatisticas-aulas';

    constructor(private http: HttpClient) { }

    private handleError(error: any): Observable<never> {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Erro: ${error.error.message}`;
        } else {
            errorMessage = `Erro no servidor: ${error.status}, ${error.message}`;
        }
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }

    concluirAula(id: number): Observable<any> {
        const url = `${this.apiURL}/concluir/${id}`;
        return this.http.post(url, {}).pipe(
            catchError(error => this.handleError(error))
        );
    }

    removerStatusConclusaoAula(id: number): Observable<any> {
        const url = `${this.apiURL}/remover-conclusao/${id}`;
        return this.http.post(url, {}).pipe(
            catchError(error => this.handleError(error))
        );
    }

    obterProgressoAulas(): Observable<Map<string, number>> {
        const url = `${this.apiURL}/obter-progresso-aulas`;
        return this.http.get<{ result: ProgressoAulasDtoResponse[] }>(url).pipe(
            map((response) => {
                const progressoMap = new Map<string, number>();
                response.result.forEach(item => {
                    progressoMap.set(item.tema, item.progresso);
                });
                return progressoMap;
            }),
            catchError(error => this.handleError(error))
        );
    }

    obterMetricasAulasPorCategoria(categoria: String): Observable<any> {
        const url = `${this.apiURL}/obter-metricas-aulas/${categoria}`;
        return this.http.get<any>(url).pipe(
            catchError(error => this.handleError(error))
        );
    }

    salvarTempoAssistido(id: number, tempoAssistido: number): Observable<any> {
        const url = `${this.apiURL}/salvar-tempo-assistido/${id}`;
        return this.http.post(url, null, { params: { tempoAssistido: tempoAssistido.toString() } }).pipe(
            catchError(error => this.handleError(error))
        );
    }

    obterTempoAssistidoAula(id: number): Observable<number> {
        const url = `${this.apiURL}/obter-tempo-assistido/${id}`;
        return this.http.get<{ tempoAssistido: number }>(url).pipe(
            map(response => response.tempoAssistido),
            catchError(error => this.handleError(error))
        );
    }

    obterUltimaAulaAssistida(categoria: string): Observable<number> {
        const url = `${this.apiURL}/obter-ultima-aula-assistida/${categoria}`;
        return this.http.get<{ aulaId: number }>(url).pipe(
            map(response => response.aulaId),
            catchError(error => this.handleError(error))
        );
    }
}
