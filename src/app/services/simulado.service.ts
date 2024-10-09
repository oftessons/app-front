import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Simulado } from '../sistema/simulado';

@Injectable({
  providedIn: 'root',
})
export class SimuladoService {
  apiURL: string = environment.apiURLBase + '/api/simulado';
  constructor(private http: HttpClient) {}

  
  finalizarSimulado(idUser: number, respostas: any[]) {
    return this.http.post<any>(`${this.apiURL}/finalizar/${idUser}`, respostas);
  }

  // Método para cadastrar um novo simulado
  cadastrarSimulado(idUser: number, simulado: Simulado): Observable<string> {
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

  // Método para editar um simulado
  editarSimulado(id: number, simulado: Simulado): Observable<void> {
    return this.http.put<void>(`${this.apiURL}/${id}`, simulado);
  }

  // Método para deletar um simulado
  deletarSimulado(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiURL}/${id}`);
  }
}
