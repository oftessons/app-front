import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { ApiChatRequestResponse } from '../chat-bot/api-chat-request-dto';
import { ApiResponse } from '../chat-bot/api-response';

@Injectable({
  providedIn: 'root',
})
export class ChatBotStateService {
  user: any = null;
  private chatState = new BehaviorSubject<boolean>(false); 
  isChatOpen$ = this.chatState.asObservable();

  private messageHistory: Array<{ text: string, type: string }> = [];
  private conversationId: string | null = null;

  apiURL: string = environment.apiURLBase + "/chat"; 

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  toggleChat(): void {
    this.chatState.next(!this.chatState.value); 
  }

  addMessage(message: {text: string, type: string}): void {
    this.messageHistory.push(message);
  }

  getMessageHistory(): Array<{text: string, type: string}> {
    return this.messageHistory;
  }

  clearMessageHistory(): void {
    this.messageHistory = [];
    this.conversationId = null;
  }

  // sendMessageToBot(message: string, topic?: string): Observable<any> {
  //   this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
  //     (data) => {
  //       this.user = data;
  //     }, (error) => {
  //       console.error('Erro ao obter perfil do usuário:', error);
  //     }
  //   )

  //   const payload = {
  //     message,
  //     topic,
  //     userContext: this.user ? {
  //       id: this.user.id,
  //       name: this.user.username,
  //       email: this.user.email,
  //       role: this.user.permissao,
  //     } : null,
  //   };

  //   return this.http.post<any>(this.apiURL, payload);
  // }

  sendMessageToBot(
    message: string,
    topic: string | null = null // caso precise usar tópicos no futuro
  ): Observable<{ response: string, action?: string, data?: any }> {
    const payload: ApiChatRequestResponse[] = [
      { text: message, role: 'user' }
    ];

    return new Observable(observer => {
      this.http.post<ApiResponse<ApiChatRequestResponse[]>>(`${this.apiURL}/tire-sua-duvida`, payload).subscribe({
        next: (res) => {
          const respostaBot = res?.data?.[0]?.text || '❓ Nenhuma resposta recebida.';
          observer.next({ response: respostaBot });
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }


  getPlanInformation(): Observable<any> {
    const user = this.authService.getUsuarioAutenticado();
    if (!user || !user.id) {
      return new Observable(observer => {
        observer.error('User not authenticated');
      });
    }
    
    return this.http.get<any>(`${this.apiURL}/plan-info/${user.id}`);
  }

  tireSuaDuvidaVictorIA(
    mensagens: ApiChatRequestResponse[]
  ): Observable<ApiResponse<ApiChatRequestResponse[]>> {
    return this.http.post<ApiResponse<ApiChatRequestResponse[]>>(
      `${this.apiURL}/tire-sua-duvida`,
      mensagens
    );
  }
}
