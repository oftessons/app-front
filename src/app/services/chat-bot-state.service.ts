import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatBotStateService {
  private chatState = new BehaviorSubject<boolean>(false); 
  isChatOpen$ = this.chatState.asObservable();

  private apiUrl = 'http://localhost:5000/chat'; 

  constructor(private http: HttpClient) {}

  toggleChat(): void {
    this.chatState.next(!this.chatState.value); 
  }

  sendMessageToBot(message: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { message });
  }
}
