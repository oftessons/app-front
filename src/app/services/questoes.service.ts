import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Questao } from '../sistema/page-questoes/questao';

@Injectable({
  providedIn: 'root'
})
export class QuestoesService {

  apiURL: string = environment.apiURLBase + '/api/questoes';
  apiURLperfil: string = environment.apiURLBase + '/api/usuarios';
  constructor(private http: HttpClient) { }

  getQuestoes(userId: string): Observable<Questao[]> {
    const url = `${this.apiURL}/todos/${userId}`; // Concatena "/todos" à URL base
    return this.http.get<Questao[]>(url);
  }

  filtrarQuestoes(filtros: any): Observable<Questao[]> {
    const url = `${this.apiURL}/filtro`;
    let params = new HttpParams();

    // Adicione os filtros como parâmetros de consulta
    for (const filtro in filtros) {
      if (filtros.hasOwnProperty(filtro)) {
        params = params.set(filtro, filtros[filtro]);
      }
    }

    return this.http.get<Questao[]>(url, { params: params });
  }
}
