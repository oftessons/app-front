import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ChatBotStateService {
  private chatState = new BehaviorSubject<boolean>(false); 
  isChatOpen$ = this.chatState.asObservable();

  private messageHistory: Array<{ text: string, type: string }> = [];
  private conversationId: string | null = null;

  private apiUrl = 'http://localhost:5000/chat'; 

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
    const user = this.authService.getUsuarioAutenticado();

    const payload = {
      message,
      conversationId: this.conversationId,
      topic,
      userContext: user ? {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.permissao,
      } : null,
    };

    return this.http.post<any>(this.apiUrl, { message });
  }

  requestPasswordRecovery(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/password-recovery`, { email });
  }

  getPlanInformation(): Observable<any> {
    const user = this.authService.getUsuarioAutenticado();
    if (!user || !user.id) {
      return new Observable(observer => {
        observer.error('User not authenticated');
      });
    }
    
    return this.http.get<any>(`${this.apiUrl}/plan-info/${user.id}`);
  }
}
