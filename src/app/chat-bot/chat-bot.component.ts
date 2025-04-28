import { Component, OnInit, ViewChild, AfterViewChecked, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
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

export class ChatBotComponent implements OnInit, AfterViewChecked, AfterViewInit, OnDestroy {
  isOpen: boolean = false;
  showButton: boolean = false;
  userMessage: string = '';
  botResponse: string = '';
  messages: Array<{ text: string, type: string }> = [];
  welcomeMessageSent: boolean = false;
  isNavigationBarActive = false;
  private navCheckInterval: any;

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

  sendWelcomeMessage(): void {
    const welcomeMsg = { 
      text: "Olá esse é o canal de suporte da Oftlessons, seja bem-vindo!", 
      type: 'bot' 
    };
    this.messages.push(welcomeMsg);
    this.chatBotStateService.addMessage(welcomeMsg);
    
    setTimeout(() => {
      const initialBotResponse = { 
        text: "Selecione um dos tópicos abaixo para iniciar o atendimento:", 
        type: 'bot' 
      };
      this.messages.push(initialBotResponse);
      this.chatBotStateService.addMessage(initialBotResponse);
    }, 2000);
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
      
      this.scrollToBottom();
      this.userMessage = '';
      
      this.chatBotStateService.sendMessageToBot(
        message,
        this.selectedTopic ? this.selectedTopic.name : null
      ).subscribe(
        response => {
          const botMessage = { text: response.response, type: 'bot' };
          this.messages.push(botMessage);
          this.chatBotStateService.addMessage(botMessage);

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
        }
      );
    }
  }

  handleBotAction(action: string, data: any): void {
    switch (action) {
      case 'RESET_PASSWORD':
        if(data && data.resetLink) {
          const resetMsg = {
            text: '🔗 Clique aqui para redefinir sua senha: ' + data.resetLink,
            type: 'bot'
          };
          this.messages.push(resetMsg);
          this.chatBotStateService.addMessage(resetMsg);
        }
        break;
      
      case 'PLAN_INFO':
        if(data && data.planInfo) {
          // Format the plan information in a readable way
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
        break;
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

  topics = [
    { name: 'Acesso', subtopics: ['Perdi o acesso', 'Não consigo acessar'] },
    { name: 'Pagamento', subtopics: ['Pagamento incorreto', 'Pagamento não processado', 'Não consigo pagar'] },
    { name: 'Dúvidas', subtopics: ['Questões', 'Plataforma'] },
    { name: 'Reclamações', subtopics: ['Questões', 'Plataforma'] },
    { name: 'Sugestões', subtopics: ['Questões', 'Plataforma'] },
    { name: 'Outros', subtopics: ['Entrar em contato via WhatsApp'] },
  ];
  conversationStep = 0; 
  selectedTopic: any = null;
  enableInput = false;

  selectMainTopic(topic: any): void {
    this.selectedTopic = topic;
    this.conversationStep = 1;
  }

  goBackMain(): void {
    this.selectedTopic = null;
    this.conversationStep = 0;
  }

  selectSubTopic(sub: string): void {
    const userMsg = { text: sub, type: 'user' };
    this.messages.push(userMsg);
    this.chatBotStateService.addMessage(userMsg);
    this.scrollToBottom();

    if(sub === 'Entrar em contato via WhatsApp') {
      const phoneNumber = '5511920909632';
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent('Olá! Preciso de suporte para a Oftlessons.')}`;
      window.open(whatsappUrl, '_blank');
      
      const botMsg = { 
        text: 'Redirecionando você para o WhatsApp do suporte...', 
        type: 'bot' 
      };
      this.messages.push(botMsg);
      this.chatBotStateService.addMessage(botMsg);
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
}
