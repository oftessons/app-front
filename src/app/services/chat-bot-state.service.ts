import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatBotStateService {
  private chatState = new BehaviorSubject<boolean>(false); // Estado inicial fechado
  isChatOpen$ = this.chatState.asObservable(); // Observável para o estado do chat

  toggleChat(): void {
    this.chatState.next(!this.chatState.value); // Alterna entre aberto e fechado
  }
}
