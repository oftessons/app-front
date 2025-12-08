import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

// Interface do DTO da Notificação
export interface Notificacao {
  id: number;
  mensagem: string;
  dataCriacao: string;
  referenciaId: number;
  lida: boolean;
  tipo?: string; // Adicionado para facilitar o redirecionamento
}

// Interface auxiliar para a resposta paginada do Spring Boot (Page<T>)
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {
  
  // Ajustado para usar a variável de ambiente, consistente com seu AuthService
  private apiUrl = `${environment.apiURLBase}/api/notificacoes`; 
  
  // BehaviorSubject para o contador de não lidas (em tempo real)
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private authService: AuthService
  ) {
    this.startPolling();
  }

  /**
   * Busca apenas as notificações não lidas para atualizar o contador (ícone do sino).
   */
  fetchUnreadCount(userId: number): Observable<Notificacao[]> {
    return this.http.get<Notificacao[]>(`${this.apiUrl}/nao-lidas/${userId}`).pipe(
      // Atualiza o BehaviorSubject com a nova contagem
      tap(notificacoes => this.unreadCountSubject.next(notificacoes.length)),
      catchError(err => {
        console.error('Erro ao buscar notificações não lidas', err);
        return of([]);
      })
    );
  }

  /**
   * NOVO: Lista notificações de forma paginada para a tela de listagem.
   * Suporta filtro para trazer todas ou apenas as não lidas.
   */
  listarNotificacoes(
    userId: number, 
    page: number = 0, 
    size: number = 10, 
    somenteNaoLidas: boolean = false
  ): Observable<Page<Notificacao>> {
    
    // Configura os parâmetros da URL para o Spring Pageable
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('somenteNaoLidas', somenteNaoLidas.toString());

    return this.http.get<Page<Notificacao>>(`${this.apiUrl}/listar/${userId}`, { params });
  }

  atualizarNotificacoes(): void {
    const userId = this.getAuthenticatedUserId();
    if (userId) {
      this.fetchUnreadCount(userId).subscribe();
    }
  }

  /**
   * Inicia o polling para verificar novas notificações a cada 60 segundos.
   */
  startPolling(): void {
    timer(0, 60000).pipe(
      switchMap(() => {
        const userId = this.getAuthenticatedUserId();
        if (userId) {
          return this.fetchUnreadCount(userId);
        }
        return of([]);
      })
    ).subscribe();
  }

  /**
   * Marca uma lista de notificações como lidas.
   */
  markAsRead(ids: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/marcar-como-lida`, { ids }).pipe(
      // Ao marcar como lida, zera o contador localmente ou força uma nova busca
      tap(() => {
        // Opção 1: Zerar imediatamente (UX mais rápida)
        this.unreadCountSubject.next(0);
        
        // Opção 2 (Recomendada): Atualizar o contador real buscando do servidor
        const userId = this.getAuthenticatedUserId();
        if (userId) {
            this.fetchUnreadCount(userId).subscribe();
        }
      })
    );
  }

  /**
   * Método auxiliar para extrair o ID do usuário do Token JWT via AuthService.
   */
  private getAuthenticatedUserId(): number | null {
    // Usa o método existente no seu AuthService
    const userIdStr = this.authService.getUserIdFromToken();
    
    if (userIdStr) {
      // Converte a string do token para number (pois o backend espera Long/Integer)
      const id = parseInt(userIdStr, 10);
      return isNaN(id) ? null : id;
    }
    
    return null;
  }
}