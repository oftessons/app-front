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
  providedIn: 'root',
})
export class NotificacaoService {
  // Ajustado para usar a variável de ambiente, consistente com seu AuthService
  private apiUrl = `${environment.apiURLBase}/api/notificacoes`;

  // BehaviorSubject para o contador de não lidas (em tempo real)
  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.startPolling();
  }

  fetchUnreadCount(userId: number): Observable<Notificacao[]> {
    return this.http
      .get<Notificacao[]>(`${this.apiUrl}/nao-lidas/${userId}`)
      .pipe(
        // Atualiza o BehaviorSubject com a nova contagem
        tap((notificacoes) =>
          this.unreadCountSubject.next(notificacoes.length)
        ),
        catchError((err) => {
          console.error('Erro ao buscar notificações não lidas', err);
          return of([]);
        })
      );
  }

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

    return this.http.get<Page<Notificacao>>(`${this.apiUrl}/listar/${userId}`, {
      params,
    });
  }

  atualizarNotificacoes(): void {
    const userId = this.getAuthenticatedUserId();
    console.log(userId);
    if (userId) {
      this.fetchUnreadCount(userId).subscribe();
    }
  }

  startPolling(): void {
    timer(0, 60000)
      .pipe(
        switchMap(() => {
          const userId = this.getAuthenticatedUserId();
          if (userId) {
            return this.fetchUnreadCount(userId);
          }
          return of([]);
        })
      )
      .subscribe();
  }

  markAsRead(ids: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/marcar-como-lida`, { ids }).pipe(
      tap(() => {
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
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe({
      next: (usuario) => {
        if (usuario && usuario.id) {
          return usuario.id;
        } else {
          console.error('Perfil recuperado mas sem ID.');
          return null;
        }
      },
      error: (err) => {
        console.error('Erro ao buscar perfil do usuário:', err);
        return null;
      },
    });
    return null;
  }
}
