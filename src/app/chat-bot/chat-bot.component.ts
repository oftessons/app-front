import { Component, OnInit, ViewChild, AfterViewChecked, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChatBotStateService } from '../services/chat-bot-state.service';
import { AuthService } from '../services/auth.service';
import { Usuario } from '../login/usuario';
import { ApiChatRequestResponse } from './api-chat-request-dto';
import { convertPropertyBinding } from '@angular/compiler/src/compiler_util/expression_converter';

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

export class ChatBotComponent implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy {
  isOpen: boolean = false;
  showButton: boolean = false;
  userMessage: string = '';
  botResponse: string = '';
  forgotEmail: string = '';
  errors: string[] = [];
  messages: Array<{ 
    text: string, 
    type: string,
    avatar?: string,
    username?: string,
    timestamp?: Date
  }> = [];
  welcomeMessageSent: boolean = false;
  isNavigationBarActive = false;
  private navCheckInterval: any;
  usuario!: Usuario;
  chatHistory: ApiChatRequestResponse[] = [];
  botAvatar: string = 'assets/Icons/logo-OFT.png';

  @ViewChild('chatBody') chatBody!: ElementRef;

  constructor(
    private chatBotStateService: ChatBotStateService,
    private authService: AuthService
  ) {}

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
        }, 1000);
      }
    });

    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (usuario: Usuario) => {
        this.usuario = usuario;
      }
    );
  }

  ngAfterViewChecked(): void {
  }

  ngAfterViewInit(): void {
    this.navCheckInterval = setInterval(() => {
      this.checkNavigationBar();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.navCheckInterval) {
      clearInterval(this.navCheckInterval);
    }
  }

  enviarMensagem(): void {
    if (!this.userMessage.trim()) return;

    const userInput: ApiChatRequestResponse = {
      text: this.userMessage,
      role: 'user'
    };

    console.log([userInput]);
    
    this.chatHistory.push(userInput);

    this.chatBotStateService.tireSuaDuvidaVictorIA([userInput]).subscribe({
      next: (res) => {
        if (res.data && res.data.length) {
          this.chatHistory.push(...res.data); 
        }
        this.userMessage = ''; 
      },
      error: (err) => {
        console.error('Erro ao enviar mensagem:', err);
      }
    });
  }

  private checkNavigationBar(): void {
    const navElements = document.querySelectorAll('.navigation-fixed');
    this.isNavigationBarActive = navElements.length > 0 && 
      Array.from(navElements).some(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
  }

  sendWelcomeMessage(): void {
    const welcomeMsg = { 
      text: "Seja bem-vindo! Sou a VictorIA, sua Inteligência Artificial do Oftlessons. Em que posso te ajudar?", 
      type: 'bot',
      avatar: this.botAvatar,
      username: 'VictorIA',
      timestamp: new Date()
    };
    this.messages.push(welcomeMsg);
    this.chatBotStateService.addMessage(welcomeMsg);
  }

  sendMessage(): void {
    const message = this.userMessage.trim();
    if (message) {
      const userMessage = { 
        text: message, 
        type: 'user',
        avatar: this.usuario?.fotoUrl || 'assets/Icons/avatar.png',
        username: this.usuario?.nome || 'Usuário',
        timestamp: new Date()
      };
      this.messages.push(userMessage);
      this.chatBotStateService.addMessage(userMessage);

      const typingMsg = { text: "Digitando...", type: 'typing' };
      this.messages.push(typingMsg);
      this.scrollToBottom();
      this.userMessage = '';
      setTimeout(() => {
        this.userMessage = '';
      }, 0);
      
      this.chatBotStateService.sendMessageToBot(
        message,
        null,
      ).subscribe(
        response => {
          this.messages = this.messages.filter(msg => msg !== typingMsg);
          
          const botMessage = { 
            text: response.response, 
            type: 'bot',
            avatar: this.botAvatar,
            username: 'VictorIA',
            timestamp: new Date()
          };
          this.messages.push(botMessage);
          this.chatBotStateService.addMessage(botMessage);

          this.scrollToBottom();
        },
        error => {
          this.messages = this.messages.filter(msg => msg !== typingMsg);
          console.error('Erro ao enviar mensagem:', error);
          const errorMsg = { 
            text: '⚠️ Erro ao conectar com a assistente. Tente novamente mais tarde.', 
            type: 'bot',
            avatar: this.botAvatar,
            username: 'VictorIA',
            timestamp: new Date() 
          };
          this.messages.push(errorMsg);
          this.chatBotStateService.addMessage(errorMsg);
          this.scrollToBottom();
        }
      );
    }
  }

  toggleChat(): void {
    this.chatBotStateService.toggleChat();
  }

  scrollToBottom(): void {
    const chatBodyElement = this.chatBody.nativeElement;
    setTimeout(() => {
      chatBodyElement.scrollTop = chatBodyElement.scrollHeight;
    }, 100);
  }

  processForgotPassword(): void {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (data: Usuario) => {
        this.forgotEmail = data.email;
        console.log('Email do usuário:', this.forgotEmail);
        
        const userMsg = { 
          text: this.forgotEmail, 
          type: 'user',
          avatar: this.usuario.fotoUrl || 'assets/Icons/avatar.png',
          username: this.usuario?.nome || 'Usuário',
          timestamp: new Date()
        };
        this.messages.push(userMsg);
        this.chatBotStateService.addMessage(userMsg);
        
        const typingMsg = { text: "Processando...", type: 'typing' };
        this.messages.push(typingMsg);
        this.scrollToBottom();
        this.userMessage = '';

        this.authService.forgotPassword(this.forgotEmail).subscribe(
          (response: any) => {
            this.messages = this.messages.filter(msg => msg !== typingMsg);
            
            const successMsg = { 
              text: `✅ Um email com instruções para recuperação de senha foi enviado para ${this.forgotEmail}. Por favor, verifique sua caixa de entrada.`, 
              type: 'bot',
              avatar: this.botAvatar,
              username: 'VictorIA',
              timestamp: new Date()
            };
            this.messages.push(successMsg);
            this.chatBotStateService.addMessage(successMsg);
            this.scrollToBottom();
          },
          (error) => {
            this.messages = this.messages.filter(msg => msg !== typingMsg);
            
            let errorMessage = '❌ Não foi possível processar sua solicitação.';
            
            if (error.status === 400) {
              errorMessage = '❌ Email não encontrado ou inválido.';
            } else if (error.status === 500) {
              errorMessage = '❌ Erro ao enviar email de recuperação de senha. Por favor, tente novamente mais tarde.';
            }
            
            const errorMsg = { 
              text: errorMessage, 
              type: 'bot',
              avatar: this.botAvatar,
              username: 'VictorIA',
              timestamp: new Date()
            };
            this.messages.push(errorMsg);
            this.chatBotStateService.addMessage(errorMsg);
            this.scrollToBottom();
          }
        );
      },
      (error) => {
        console.error('Erro ao obter email do usuário:', error);
        const errorMsg = { 
          text: '❌ Não foi possível obter seu email. Tente novamente mais tarde.', 
          type: 'bot',
          avatar: this.botAvatar,
          username: 'VictorIA',
          timestamp: new Date()
        };
        this.messages.push(errorMsg);
        this.chatBotStateService.addMessage(errorMsg);
        this.scrollToBottom();
      }
    );
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  isTyping(message: any): boolean {
    return message.type === 'typing';
  }
}


