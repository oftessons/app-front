import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Simulado } from '../sistema/simulado';
import { MetricaSubtema, MetricaTema } from '../sistema/metricas-detalhadas/metrica-interface';

@Injectable({
  providedIn: 'root',
})
export class SimuladoService {
  apiURL: string = environment.apiURLBase + '/api/simulado';
  constructor(private http: HttpClient) { }

  private simuladoAtivoSubject = new BehaviorSubject<boolean>(false);
  simuladoAtivo$ = this.simuladoAtivoSubject.asObservable();

  simuladoIniciado() {
    this.simuladoAtivoSubject.next(true);
  }

  simuladoFinalizado() {
    this.simuladoAtivoSubject.next(false);
  }

  atualizarTempoSimulado(simuladoId: number, tempoEmSegundos: number): Observable<any> {
    const url = `${this.apiURL}/${simuladoId}/tempo`;

    return this.http.put(url, tempoEmSegundos);
  }

  iniciarSimulado(idSimulado: number) {
    return this.http.post<any>(`${this.apiURL}/iniciar/${idSimulado}`, null);

  }

  finalizarSimulado(idUser: number, idSimulado: number, respostasEnviadas: any[]) {
    return this.http.post<any>(`${this.apiURL}/finalizar/${idUser}/${idSimulado}`, respostasEnviadas);
  }

  // Método para cadastrar um novo simulado
  cadastrarSimulado(idUser: number, simulado: Simulado): Observable<any> {
    return this.http.post<string>(`${this.apiURL}/${idUser}`, simulado);
  }

  // Método para obter todos os simulados
  obterSimulados(idUser: number): Observable<Simulado[]> {
    return this.http.get<Simulado[]>(`${this.apiURL}/user/${idUser}`);
  }

  // Método para obter um simulado por ID
  obterSimuladoPorId(id: number): Observable<Simulado> {
    return this.http.get<Simulado>(`${this.apiURL}/${id}`);
  }

  buscarMetricasAgrupadasPorTema(simuladoId: number): Observable<{ response: MetricaTema[] } > {
    return this.http.get<{ response: MetricaTema[] }>(`${this.apiURL}/obter-metricas-tema/${simuladoId}`);
  }

  buscarMetricasDetalhadas(simuladoId: number): Observable<{ response: MetricaSubtema[] } > {
    return this.http.get<{ response: MetricaSubtema[] }>(`${this.apiURL}/obter-metricas-subtema/${simuladoId}`);
  }

  // Método para editar um simulado
  editarSimulado(id: number, simulado: Simulado): Observable<void> {
    return this.http.put<void>(`${this.apiURL}/${id}`, simulado);
  }

  // Método para deletar um simulado
  deletarSimulado(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}
