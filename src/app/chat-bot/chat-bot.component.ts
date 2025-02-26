import { Component, OnInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChatBotStateService } from '../services/chat-bot-state.service';

@Component({
  selector: 'chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css'],
  animations: [
    trigger('chatBotAnimation', [
      state('closed', style({
        transform: 'translateY(100%)',  // Fora da tela quando fechado
        opacity: 0,
      })),
      state('open', style({
        transform: 'translateY(0)',  // Posição normal quando aberto
        opacity: 1,
      })),
      transition('closed <=> open', [
        animate('1000ms ease-in-out')  // Animação mais lenta de 1000ms
      ]),
    ])
  ]
})
export class ChatBotComponent implements OnInit {
  isOpen: boolean = false;
  showButton: boolean = false;  // Variável para controlar a visibilidade do botão

  constructor(private chatBotStateService: ChatBotStateService) {}

  ngOnInit(): void {

    // Subscribing to the state of the chat
    this.chatBotStateService.isChatOpen$.subscribe((isOpen) => {
      this.isOpen = isOpen;
    });
  }

  toggleChat(): void {
    // Se o chat estiver aberto, fecha imediatamente
    if (this.isOpen) {
      this.chatBotStateService.toggleChat();  // Fecha o chat imediatamente
    } else {
      this.chatBotStateService.toggleChat();  // Abre o chat
    }
  }
}
