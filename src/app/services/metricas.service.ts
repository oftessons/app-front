import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// --- Interfaces / DTOs ---

export interface TopicStats {
  id: number;
  name: string;
  questionCount: number;
  frequencyPercentage: number;
  subTopics?: TopicStats[];
  expanded?: boolean;
}

export interface DashboardMetrics {
  totalQuestionsAnalyzed: number;
  mainThemeIdentified: string;
  mainThemeCount: number;
  mainThemePercentage: number;
  hardestSubtopic: string;
  hardestSubtopicAverage: number;
  topicStats: TopicStats[];
}

export interface DashboardOptions {
  anos: SelectOption[];
  tiposProva: SelectOption[];
  dificuldades: SelectOption[];
}

export interface SelectOption {
  label: string;
  value: string;
}

@Injectable({
  providedIn: 'root',
})
export class MetricasService {
  private apiUrl = `${environment.apiURLBase}/api/dashboard`;

  constructor(private http: HttpClient) {}

  getMetrics(
    anos?: string[], 
    tiposProva?: string[], 
    dificuldades?: string[]
  ): Observable<DashboardMetrics> {
    
    let params = new HttpParams();
    
    if (anos && anos.length > 0) {
      params = params.append('anos', anos.join(','));
    }

    if (tiposProva && tiposProva.length > 0) {
      params = params.append('tiposProva', tiposProva.join(','));
    }

    if (dificuldades && dificuldades.length > 0) {
      params = params.append('dificuldades', dificuldades.join(','));
    }

    return this.http.get<DashboardMetrics>(`${this.apiUrl}/metrics`, { params })
      .pipe(
        catchError((err) => {
          console.error('Erro ao buscar métricas', err);
          return throwError(() => err);
        })
      );
  }

  getFilterOptions(): Observable<DashboardOptions> {
    return this.http.get<DashboardOptions>(`${this.apiUrl}/options`).pipe(
      catchError((err) => {
        console.error('Erro ao buscar opções de filtro', err);
        return throwError(() => err);
      })
    );
  }
}
