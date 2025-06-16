import { Component, OnInit, ViewChild, AfterViewChecked, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChatBotStateService } from '../services/chat-bot-state.service';
import { AuthService } from '../services/auth.service';
import { Usuario } from '../login/usuario';

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
  messages: Array<{ text: string, type: string }> = [];
  welcomeMessageSent: boolean = false;
  isNavigationBarActive = false;
  private navCheckInterval: any;
  usuario!: Usuario;
  conversationStep = -1; 
  selectedTopic: any = null;
  enableInput = false;
  initialStep = true;

  topics = [
    { name: 'Acesso', subtopics: ['Esqueci minha senha'] },
    { name: 'Pagamento', subtopics: ['Plano Atual'] },
    // { name: 'Reclamação', subtopics: ['Questão Atual', 'Plataforma'] },
    { name: 'Sugestão', subtopics: ['Questão Atual', 'Plataforma'] },
    { name: 'Contato via WhatsApp' },
  ];

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

  private checkNavigationBar(): void {
    const navElements = document.querySelectorAll('.navigation-fixed');
    this.isNavigationBarActive = navElements.length > 0 && 
      Array.from(navElements).some(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
  }

  private isMessageDuplicate(messageText: string): boolean {
  if (this.messages.length === 0) {
    return false;
  }
  
  const lastMessage = this.messages[this.messages.length - 1];
  return lastMessage.text === messageText && lastMessage.type === 'bot';
}

  sendWelcomeMessage(): void {
    const welcomeMsg = { 
      text: "Olá esse é o canal de suporte da Oftlessons, seja bem-vindo!", 
      type: 'bot' 
    };
    this.messages.push(welcomeMsg);
    this.chatBotStateService.addMessage(welcomeMsg);
    
    setTimeout(() => {
      const initialBotResponse = { 
        text: "Como posso te ajudar hoje?", 
        type: 'bot' 
      };
      this.messages.push(initialBotResponse);
      this.chatBotStateService.addMessage(initialBotResponse);
      this.initialStep = true;
      this.conversationStep = -1;
    }, 1000);
  }

  selectAIAssistance(): void {
    const userMsg = { text: "Gostaria de falar com o Victor", type: 'user' };
    this.messages.push(userMsg);
    this.chatBotStateService.addMessage(userMsg);

    setTimeout(() => {
      const botMsg = {
          text: "Olá! Sou o Victor, o assistente virtual da Oftlessons. Como posso te ajudar hoje?", 
          type: 'bot' 
      };
      this.messages.push(botMsg);
      this.chatBotStateService.addMessage(botMsg);
      this.scrollToBottom();
    }, 1000);

    this.initialStep = false;
    this.enableInput = true;
    this.conversationStep = 2;
  }

  selectSupport(): void {
    const userMsg = { text: "Gostaria de falar com o suporte.", type: 'user' };
    this.messages.push(userMsg);
    this.chatBotStateService.addMessage(userMsg);
    setTimeout(() => {
      const topicMsg = "Selecione um dos tópicos abaixo para que possamos te ajudar:";
      if(!this.isMessageDuplicate(topicMsg)) {
        const botMsg = { text: topicMsg, type: 'bot' };
        this.messages.push(botMsg);
        this.chatBotStateService.addMessage(botMsg);
      }
      this.scrollToBottom();
    }, 1000);
    this.initialStep = false;
    this.conversationStep = 0;
  }

  sendMessage(): void {
    if (!this.enableInput) {
      return;
    }

    const message = this.userMessage.trim();
    if (message) {
      const userMessage = { text: message, type: 'user' };
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
        this.selectedTopic ? this.selectedTopic.name : null,
      ).subscribe(
        response => {
          this.messages = this.messages.filter(msg => msg !== typingMsg);
          
          const botMessage = { text: response.response, type: 'bot' };
          this.messages.push(botMessage);
          this.chatBotStateService.addMessage(botMessage);

          if(response.action) {
            this.handleBotAction(response.action, response.data);
          }

          this.scrollToBottom();
        },
        error => {
          this.messages = this.messages.filter(msg => msg !== typingMsg);
          console.error('Erro ao enviar mensagem:', error);
          const errorMsg = { 
            text: '⚠️ Erro ao conectar com a assistente. Tente novamente mais tarde.', 
            type: 'bot' 
          };
          this.messages.push(errorMsg);
          this.chatBotStateService.addMessage(errorMsg);
          this.scrollToBottom();

          this.goBackMain();
        }
      );
    }
  }

  handleBotAction(action: string, data: any): void {
    switch (action) {
      case 'PLAN_INFO':
        if(data && data.planInfo) {
          const planInfo = data.planInfo;
          const planStatus = planInfo.status === 'active' ? 'ativo' : planInfo.status;
          
          let planText = `📋 *Informações do seu plano:*\n\n` +
                        `📝 Nome: ${planInfo.name}\n` +
                        `🔄 Intervalo de renovação: ${planInfo.intervaloRenovacao}\n` +
                        `📊 Status: ${planStatus}\n` +
                        `📅 Próxima renovação: ${this.formatDate(planInfo.proximaRenovacao)}\n` +
                        `⏱️ Válido até: ${this.formatDate(planInfo.validoAte)}`;
          
          const planMsg = {
            text: planText,
            type: 'bot'
          };
          this.messages.push(planMsg);
          this.chatBotStateService.addMessage(planMsg);
        }
        this.goBackMain();
        break;

      case 'RETURN_TO_MAIN_MENU':
        this.goBackMain();
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
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

  selectMainTopic(topic: any): void {
    if(topic.name === 'Contato via WhatsApp') {
      const phoneNumber = '5511920909632';
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent('Olá! Preciso de suporte para a Oftlessons.')}`;
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);
      const botMsg = { 
        text: 'Redirecionando você para o WhatsApp do suporte...', 
        type: 'bot' 
      };
      this.messages.push(botMsg);
      this.chatBotStateService.addMessage(botMsg);
      this.scrollToBottom();
      return;
    }

    this.selectedTopic = topic;
    this.conversationStep = 1;
  }

  goBackMain(): void {
    this.selectedTopic = null;
    this.conversationStep = -1;
    this.enableInput = false;
    this.initialStep = true;

    setTimeout(() => {
      const menuMsg = "Como posso te ajudar hoje?"
      if(!this.isMessageDuplicate(menuMsg)) {
        const menuBotMsg = { text: menuMsg, type: 'bot' };
        this.messages.push(menuBotMsg);
        this.chatBotStateService.addMessage(menuBotMsg);
      }
      this.scrollToBottom();
    }, 1000);
  }

  goBackToTopics(): void {
    this.selectedTopic = null;
    this.conversationStep = 0;
    this.enableInput = false;

    setTimeout(() => {
      const topicsMsg = "Selecione um dos tópicos abaixo para que possamos te ajudar:";
      if(!this.isMessageDuplicate(topicsMsg)) {
        const topicMsg = { text: topicsMsg, type: 'bot' };
        this.messages.push(topicMsg);
        this.chatBotStateService.addMessage(topicMsg);
      }
      this.scrollToBottom();
    }, 1000);
  }

  processForgotPassword(): void {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (data: Usuario) => {
        this.forgotEmail = data.email;
        console.log('Email do usuário:', this.forgotEmail);
        
        const userMsg = { text: this.forgotEmail, type: 'user' };
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
              type: 'bot' 
            };
            this.messages.push(successMsg);
            this.chatBotStateService.addMessage(successMsg);
            this.scrollToBottom();

            setTimeout(() => {
              this.goBackMain();
            }, 5000);
          },
          (error) => {
            this.messages = this.messages.filter(msg => msg !== typingMsg);
            
            let errorMessage = '❌ Não foi possível processar sua solicitação.';
            
            if (error.status === 400) {
              errorMessage = '❌ Email não encontrado ou inválido.';
            } else if (error.status === 500) {
              errorMessage = '❌ Erro ao enviar email de recuperação de senha. Por favor, tente novamente mais tarde.';
            }
            
            const errorMsg = { text: errorMessage, type: 'bot' };
            this.messages.push(errorMsg);
            this.chatBotStateService.addMessage(errorMsg);
            this.scrollToBottom();
            
            setTimeout(() => {
              this.goBackMain();
            }, 5000);
          }
        );
      },
      (error) => {
        console.error('Erro ao obter email do usuário:', error);
        const errorMsg = { 
          text: '❌ Não foi possível obter seu email. Tente novamente mais tarde.', 
          type: 'bot' 
        };
        this.messages.push(errorMsg);
        this.chatBotStateService.addMessage(errorMsg);
        this.scrollToBottom();
      }
    );


    
  }

  selectSubTopic(sub: string): void {
    const userMsg = { text: sub, type: 'user' };
    this.messages.push(userMsg);
    this.chatBotStateService.addMessage(userMsg);
    this.scrollToBottom();

    if(sub === 'Esqueci minha senha') {
      this.processForgotPassword();
      return;
    }

    this.chatBotStateService.sendMessageToBot(sub).subscribe(
      response => {
        const botMsg = { text: response.response, type: 'bot' };
        this.messages.push(botMsg);
        this.chatBotStateService.addMessage(botMsg);
        if(response.action) {
          this.handleBotAction(response.action, response.data);
        }
        this.scrollToBottom();
      },
      error => {
        console.error('Erro ao enviar mensagem:', error);
        const errorMsg = { 
          text: '⚠️ Erro ao conectar ao suporte. Tente novamente mais tarde.', 
          type: 'bot' 
        };
        this.messages.push(errorMsg);
        this.chatBotStateService.addMessage(errorMsg);
        this.scrollToBottom();
        this.goBackMain();
      }
    );
    this.enableInput = true;
    this.conversationStep = 2;
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}


