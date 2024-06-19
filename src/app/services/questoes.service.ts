import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Questao } from '../sistema/page-questoes/questao';
import { Ano } from '../sistema/page-questoes/enums/ano';

@Injectable({
  providedIn: 'root'
})
export class QuestoesService {

  apiURL: string = environment.apiURLBase + '/api/questoes';

  constructor(private http: HttpClient) { }

  filtrarQuestoes(filtros: any): Observable<Questao[]> {
    const url = `${this.apiURL}/filtro`;
    let params = new HttpParams();

    // Adicione os filtros como parâmetros de consulta
    for (const filtro in filtros) {
      if (filtros.hasOwnProperty(filtro) && filtros[filtro] !== null) {
        params = params.set(filtro, filtros[filtro]);
      }
    }

    return this.http.get<Questao[]>(url, { params: params });
  }
}
