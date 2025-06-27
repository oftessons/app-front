import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';

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

  sendMessageToBot(message: string, topic?: string): Observable<any> {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (data) => {
        this.user = data;
      }, (error) => {
        console.error('Erro ao obter perfil do usuário:', error);
      }
    )

    const payload = {
      message,
      topic,
      userContext: this.user ? {
        id: this.user.id,
        name: this.user.username,
        email: this.user.email,
        role: this.user.permissao,
      } : null,
    };

    return this.http.post<any>(this.apiURL, payload);
  }

  sendDuvidaToBot(message: string): Observable<any> {
  if (!message || message.trim() === '') {
    return of({
      response: "Por favor, digite uma mensagem para que eu possa ajudá-lo."
    });
  }

  const requestData = [
    {
      role: "user",
      text: message.trim()
    }
  ];

  return this.http.post<any>(`${this.apiURL}/tire-sua-duvida`, requestData)
    .pipe(
      map(response => {
        if (response && response.data && response.data.length > 0) {
          const assistantMessage = response.data.find((item: any) => 
            item.role === 'assistant'
          );
          return {
            response: assistantMessage?.content || "Desculpe, não consegui processar sua pergunta."
          };
        }
        return {
          response: "Desculpe, ocorreu um erro ao processar sua pergunta."
        };
      }),
      catchError(error => {
        console.error('Erro na requisição ao endpoint tire-sua-duvida:', error);

        return of({
          response: "Desculpe, não foi possível processar sua dúvida no momento. Nossa equipe está trabalhando para resolver este problema."
        });
      })
    );
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
}
