import { Component, OnInit, ViewChild, AfterViewChecked, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChatBotStateService } from '../services/chat-bot-state.service';
import { QuestoesStateService } from '../services/questao-state.service';
import { VendasService } from '../services/vendas.service';
import { AuthService } from '../services/auth.service';
import { Usuario } from '../login/usuario';
import { ApiChatRequestResponse } from './api-chat-request-dto';
import { convertPropertyBinding } from '@angular/compiler/src/compiler_util/expression_converter';
import { Questao } from '../sistema/page-questoes/questao';

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
  citarQuestao: Questao = new Questao();
  isCitarQuestao: boolean = false;
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
    private authService: AuthService,
    private questoesStateService: QuestoesStateService,
    private vendasService: VendasService
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

  citarQuestaoAtual(message: string): void {
    if (this.isCitarQuestao) {
      this.isCitarQuestao = false;
      this.citarQuestao = new Questao();
      return;
    }
    this.isCitarQuestao = true;
    const questaoAtual = this.questoesStateService.getQuestaoAtual();
    if (questaoAtual) {
      this.citarQuestao = questaoAtual;
    } else {
      this.isCitarQuestao = false;
    }
  }

  temQuestaoParaCitar(): boolean {
    return this.questoesStateService.getQuestaoAtual() !== null;
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
      let fullMessage = message;

      const userMessage = { 
        text: message, 
        type: 'user',
        avatar: this.usuario?.fotoUrl || null,
        username: this.usuario?.nome || 'Usuário',
        timestamp: new Date()
      };
      this.messages.push(userMessage);
      this.chatBotStateService.addMessage(userMessage);

      if(this.isCitarQuestao) {
        fullMessage = `Questão id ${this.citarQuestao.id} Enunciado:${this.citarQuestao.enunciadoDaQuestao} \n\n${message}`;
        console.log('Citando questão:', fullMessage);
      }

      const typingMsg = { text: "Digitando...", type: 'typing' };
      this.messages.push(typingMsg);
      this.scrollToBottom();
      this.userMessage = '';
      setTimeout(() => {
        this.userMessage = '';
      }, 0);
      
      this.chatBotStateService.sendMessageToBot(
        fullMessage,
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
          this.isCitarQuestao = false;
          this.citarQuestao = new Questao();

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
          this.isCitarQuestao = false;
          this.citarQuestao = new Questao();
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
  
  async enviarParaSuporte(): Promise<void> {
    try {
      const dadosUsuario = this.usuario ? 
        `Nome: ${this.usuario.nome}
Email: ${this.usuario.email}
Telefone: ${this.usuario.telefone || 'Não informado'}
Cidade: ${this.usuario.cidade || 'Não informada'}
Estado: ${this.usuario.estado || 'Não informado'}` : 'Usuário não autenticado';
      
      let dadosPlano = 'Informações do plano não disponíveis';
      if (this.usuario && this.usuario.id) {
        try {
          const planInfo = await this.vendasService.obterDadosAssinaturaPorUsuario(this.usuario.id).toPromise();
          if (planInfo) {
            dadosPlano = `Plano: ${planInfo.name || 'Não disponível'}
            Status: ${planInfo.status || 'Não disponível'}
            Próxima renovação: ${planInfo.proximaRenovacao || 'Não disponível'}`;
          }
        } catch (err) {
          console.error('Erro ao obter informações do plano:', err);
        }
      }
      
      let dadosQuestao = 'Nenhuma questão está sendo visualizada atualmente';
      const questaoAtual = this.questoesStateService.getQuestaoAtual();
      if (questaoAtual) {
        dadosQuestao = `ID da Questão: ${questaoAtual.id}`
      }
      
      const ultimasMensagens = this.messages
        .slice(-5) 
        .map(msg => `${msg.type === 'user' ? this.usuario?.nome || 'Usuário' : 'VictorIA'}: ${msg.text?.substring(0, 50)}...`)
        .join('\n\n');
      
      const mensagemCompleta = `*Suporte Oftlessons*
      
*DADOS DO USUÁRIO*
${dadosUsuario}

*INFORMAÇÕES DO PLANO*
${dadosPlano}

*QUESTÃO ATUAL*
${dadosQuestao}

*ÚLTIMAS INTERAÇÕES*
${ultimasMensagens}

*ESCREVA SUA MENSAGEM ABAIXO*
`;

      const numeroWhatsapp = '5511920909632';
      const whatsappUrl = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(mensagemCompleta)}`;
      
      // setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      // }, 2000);

      const botMessage = { 
        text: "✅ Estou abrindo o WhatsApp para você entrar em contato com nosso suporte. Suas informações serão enviadas para agilizar o atendimento.", 
        type: 'bot',
        avatar: this.botAvatar,
        username: 'VictorIA',
        timestamp: new Date()
      };
      this.messages.push(botMessage);
      this.chatBotStateService.addMessage(botMessage);
      this.scrollToBottom();
      
    } catch (error) {
      console.error('Erro ao processar solicitação de suporte:', error);
      const errorMsg = { 
        text: '❌ Não foi possível conectar ao suporte. Por favor, tente novamente mais tarde.', 
        type: 'bot',
        avatar: this.botAvatar,
        username: 'VictorIA',
        timestamp: new Date()
      };
      this.messages.push(errorMsg);
      this.chatBotStateService.addMessage(errorMsg);
      this.scrollToBottom();
    }
  }

  processForgotPassword(): void { //possivel uso para o bot ou criar um botao em outro lugar
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


