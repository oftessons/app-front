import { Component, OnInit, ViewChild, AfterViewChecked, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChatBotStateService } from '../services/chat-bot-state.service';

@Component({
  selector: 'chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css'],
  animations: [
    trigger('chatBotAnimation', [
      state('closed', style({
        transform: 'translateY(100%)',
        opacity: 0,
        display: 'none'
      })),
      state('open', style({
        transform: 'translateY(0)',
        opacity: 1,
      })),
      transition('closed <=> open', [
        animate('1000ms ease-in-out')
      ]), 
    ]),
  ]
})
export class ChatBotComponent implements OnInit, AfterViewChecked {
  isOpen: boolean = false;
  showButton: boolean = false;
  userMessage: string = '';
  botResponse: string = '';
  messages: Array<{ text: string, type: string }> = [];
  welcomeMessageSent: boolean = false;

  @ViewChild('chatBody') chatBody!: ElementRef;

  constructor(private chatBotStateService: ChatBotStateService) {}

  ngOnInit(): void {
    this.chatBotStateService.isChatOpen$.subscribe((isOpen) => {
      this.isOpen = isOpen;
      if (this.isOpen) {
        this.showButton = false;
        if (!this.welcomeMessageSent) {
          this.sendWelcomeMessage();
          this.welcomeMessageSent = true;
        }
      } else {
        setTimeout(() => {
          this.showButton = true;
        }, 2000);
      }
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendWelcomeMessage(): void {
    setTimeout(() => {
      this.messages.push({ text: "Olá esse é o canal de suporte da Oftlessons, seja bem-vindo!", type: 'bot' });
    }, 1000); 
  
    setTimeout(() => {
      this.messages.push({ text: "Insira seu email!", type: 'bot' });
    }, 2000); 
  }

  sendMessage(): void {
    if (this.userMessage.trim()) {
      this.messages.push({ text: this.userMessage, type: 'user' });
  
      this.chatBotStateService.sendMessageToBot(this.userMessage).subscribe(
        (response) => {
          this.messages.push({ text: response.response, type: 'bot' });
          this.userMessage = '';
        },
        (error) => {
          console.error('Erro ao enviar mensagem:', error);
          this.messages.push({ text: '⚠️ Erro ao conectar ao suporte. Tente novamente mais tarde.', type: 'bot' });
        }
      );
    }
  }
  
  toggleChat(): void {
    this.chatBotStateService.toggleChat();
  }

  scrollToBottom(): void {
    const chatBodyElement = this.chatBody.nativeElement;
    chatBodyElement.scrollTop = chatBodyElement.scrollHeight;
  }
}
