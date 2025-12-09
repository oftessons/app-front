import { Component, OnInit, ViewChild, AfterViewChecked, ElementRef, AfterViewInit, OnDestroy, HostBinding, Renderer2 } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ChatBotStateService } from '../services/chat-bot-state.service';
import { QuestoesStateService } from '../services/questao-state.service';
import { VendasService } from '../services/vendas.service';
import { AuthService } from '../services/auth.service';
import { Usuario } from '../login/usuario';
import { ApiChatRequestResponse } from './api-chat-request-dto';
import { Questao } from '../sistema/page-questoes/questao';
import { SimuladoService } from '../services/simulado.service';

@Component({
  selector: 'chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css'],
  animations: [
    trigger('chatBotAnimation', [
      state('closed', style({
        opacity: 0,
        display: 'none'
      })),
      state('open', style({ 
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
  chatAtivo: boolean = true;
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
  showPromptSuggestions: boolean = false;

  promptSuggestions: string[] = [
    'Explique detalhadamente esta questão',
    'Elabore 5 questões deste tópico',
    'Faça um resumo sobre o tema deste tópico',
    'Mnemônicos deste tópico',
    'Reescreva de forma mais didática',
    'Elabore uma história engraçada',
    'Cite referências atualizadas sobre este tópico'
  ];

  isDragging: boolean = false;
  dragOffset = { x: 0, y: 0 };
  currentPosition = 'bottom-right';
  isTransitioning: boolean = false;

  isResizing: boolean = false;
  resizeStartPos = { x: 0, y: 0 };
  initialSize = { width: 400, height: 470 };
  currentSize = { width: 400, height: 470 };
  minSize = { width: 300, height: 500 };
  maxSize = { width: 900, height: 900 };

  @ViewChild('chatBody') chatBody!: ElementRef;

  @HostBinding('class.dragging') get isDraggingClass() { return this.isDragging; }
  @HostBinding('class.transitioning') get isTransitioningClass() { return this.isTransitioning; }
  @HostBinding('class.top-left') get isTopLeft() { return this.currentPosition === 'top-left'; }
  @HostBinding('class.top-right') get isTopRight() { return this.currentPosition === 'top-right'; }
  @HostBinding('class.bottom-left') get isBottomLeft() { return this.currentPosition === 'bottom-left'; }
  @HostBinding('class.bottom-right') get isBottomRight() { return this.currentPosition === 'bottom-right'; }
  @HostBinding('class.nav-active') get isNavActive() { return this.isNavigationBarActive; }

  constructor(
    private chatBotStateService: ChatBotStateService,
    private authService: AuthService,
    private questoesStateService: QuestoesStateService,
    private vendasService: VendasService,
    private simuladoService: SimuladoService,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private router: Router
  ) {}

  ngOnInit(): void {
    const savedPosition = localStorage.getItem('chatbot-position');
    if (savedPosition && ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(savedPosition)) {
      this.currentPosition = savedPosition;
    }

    this.updateMaxHeight();

    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.prompt-toggle-btn') && !target.closest('.prompt-suggestions-dropdown')) {
        this.showPromptSuggestions = false;
      }
    });

    const savedSize = localStorage.getItem('chatbot-size');
    if (savedSize) {
      try {
        const size = JSON.parse(savedSize);
        
        size.height = Math.min(size.height, this.maxSize.height);
        size.width = Math.min(size.width, this.maxSize.width);
        this.currentSize = size;
        this.initialSize = size;
      } catch (e) {
        console.error('Erro ao carregar tamanho salvo:', e);
      }
    }

    this.simuladoService.simuladoAtivo$.subscribe((simuladoAtivo => {
      this.chatAtivo = !simuladoAtivo;
    }))

    this.questoesStateService.questaoAtual$.subscribe((questaoAtual) => {
      if (!questaoAtual && this.isCitarQuestao) {
        this.isCitarQuestao = false;
        this.citarQuestao = new Questao();
      }
    });

    // Monitora mudanças de navegação para limpar o estado da questão
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(e => {
      // Se o usuário saiu das páginas de questões, limpar o estado
      if (!e.urlAfterRedirects.includes('/questoes') &&
          !e.urlAfterRedirects.includes('/cadastro-questao/')) {
        const questaoAtual = this.questoesStateService.getQuestaoAtual();
        if (questaoAtual || this.isCitarQuestao) {
          this.isCitarQuestao = false;
          this.citarQuestao = new Questao();
          this.questoesStateService.setQuestaoAtual(null);
        }
      }
    });

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

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  ngAfterViewChecked(): void {
    this.temQuestaoParaCitar();
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
    window.removeEventListener('resize', this.onWindowResize.bind(this));
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
      this.isCitarQuestao = true;
      this.citarQuestao = questaoAtual;
    } else {
      this.isCitarQuestao = false;
      this.citarQuestao = new Questao();
    }
  }

  temQuestaoParaCitar(): boolean {
    const questaoAtual = this.questoesStateService.getQuestaoAtual();
  
    // Se não há questão atual e o botão estava ativo, desativa
    if (!questaoAtual && this.isCitarQuestao) {
      this.isCitarQuestao = false;
      this.citarQuestao = new Questao();
      return false;
    }
    
    // Se não há questão atual, garantir que o estado local também está limpo
    if (!questaoAtual) {
      this.isCitarQuestao = false;
      this.citarQuestao = new Questao();
      return false;
    }
    
    return questaoAtual !== null;
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

  iniciarNovaConversa(): void {
    this.messages = [];
    this.chatHistory = [];
    
    this.chatBotStateService.clearMessages();
    
    this.isCitarQuestao = false;
    this.citarQuestao = new Questao();
    this.userMessage = '';
    
    this.sendWelcomeMessage();
  }

  togglePromptSuggestions(): void {
    this.showPromptSuggestions = !this.showPromptSuggestions;
  }

  selectPrompt(prompt: string): void {
    this.showPromptSuggestions = false;
    
    const questaoAtual = this.questoesStateService.getQuestaoAtual();
    if (questaoAtual) {
      this.isCitarQuestao = true;
      this.citarQuestao = questaoAtual;
    }
    
    this.userMessage = `<prompt>${prompt}</prompt>`;
    this.sendMessage();
  }

  hasUserMessages(): boolean {
    return this.messages.some(msg => msg.type === 'user');
  }

  closePromptSuggestions(): void {
    this.showPromptSuggestions = false;
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

      const typingMsg = { text: '', type: 'typing' };
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

          this.scrollToBotMessage();
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
          this.scrollToBotMessage();
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

  scrollToBotMessage(): void {
    const chatBodyElement = this.chatBody.nativeElement;
    setTimeout(() => {
      
      const botMessages = chatBodyElement.querySelectorAll('.bot-message');
      if (botMessages.length > 0) {
        const lastBotMessage = botMessages[botMessages.length - 1] as HTMLElement;
        
        lastBotMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 200); 
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

      const numeroWhatsapp = '551152418213';
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

  onDragStart(event: MouseEvent): void {
    if (this.isTransitioning) return;
    
    this.isDragging = true;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.dragOffset.x = event.clientX - rect.left;
    this.dragOffset.y = event.clientY - rect.top;
    
    // Adicionar event listeners globais
    document.addEventListener('mousemove', this.onDragMove.bind(this));
    document.addEventListener('mouseup', this.onDragEnd.bind(this));
    
    event.preventDefault();
  }

  onTouchStart(event: TouchEvent): void {
    if (this.isTransitioning) return;
    
    this.isDragging = true;
    const touch = event.touches[0];
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.dragOffset.x = touch.clientX - rect.left;
    this.dragOffset.y = touch.clientY - rect.top;
    
    // Adicionar event listeners globais para touch
    document.addEventListener('touchmove', this.onTouchMove.bind(this));
    document.addEventListener('touchend', this.onTouchEnd.bind(this));
    
    event.preventDefault();
  }

  onDragMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    // Calcular nova posição baseada no mouse
    const newX = event.clientX - this.dragOffset.x;
    const newY = event.clientY - this.dragOffset.y;
    
    // Aplicar posição temporária durante o drag
    this.renderer.setStyle(this.elementRef.nativeElement, 'left', `${newX}px`);
    this.renderer.setStyle(this.elementRef.nativeElement, 'top', `${newY}px`);
    this.renderer.setStyle(this.elementRef.nativeElement, 'right', 'auto');
    this.renderer.setStyle(this.elementRef.nativeElement, 'bottom', 'auto');
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    
    const touch = event.touches[0];
    // Calcular nova posição baseada no touch
    const newX = touch.clientX - this.dragOffset.x;
    const newY = touch.clientY - this.dragOffset.y;
    
    // Aplicar posição temporária durante o drag
    this.renderer.setStyle(this.elementRef.nativeElement, 'left', `${newX}px`);
    this.renderer.setStyle(this.elementRef.nativeElement, 'top', `${newY}px`);
    this.renderer.setStyle(this.elementRef.nativeElement, 'right', 'auto');
    this.renderer.setStyle(this.elementRef.nativeElement, 'bottom', 'auto');
  }

  onDragEnd(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.isTransitioning = true;
    
    // Remover event listeners globais
    document.removeEventListener('mousemove', this.onDragMove.bind(this));
    document.removeEventListener('mouseup', this.onDragEnd.bind(this));
    
    // Determinar o canto mais próximo
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let centerX, centerY;
    if(windowWidth < 768) {
      centerX = (windowWidth / 2);
      centerY = (windowHeight / 2);
    } else {
      centerX = windowWidth / 2;
      centerY = windowHeight / 2;
    }

    let newPosition = 'bottom-right';
    
    if (event.clientX < centerX && event.clientY < centerY) {
      newPosition = 'top-left';
    } else if (event.clientX >= centerX && event.clientY < centerY) {
      newPosition = 'top-right';
    } else if (event.clientX < centerX && event.clientY >= centerY) {
      newPosition = 'bottom-left';
    } else {
      newPosition = 'bottom-right';
    }
    
    this.currentPosition = newPosition;
    this.applyPosition(newPosition);
    
    // Salvar posição no localStorage
    localStorage.setItem('chatbot-position', newPosition);
    
    // Remover transição após um delay
    setTimeout(() => {
      this.isTransitioning = false;
    }, 600);
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.isTransitioning = true;
    
    // Remover event listeners globais
    document.removeEventListener('touchmove', this.onTouchMove.bind(this));
    document.removeEventListener('touchend', this.onTouchEnd.bind(this));
    
    const touch = event.changedTouches[0];
    
    // Determinar o canto mais próximo
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    let centerX, centerY;
    if(windowWidth < 768) {
      centerX = (windowWidth / 2);
      centerY = (windowHeight / 2) - 200;
    } else {
      centerX = windowWidth / 2;
      centerY = windowHeight / 2;
    }
    
    let newPosition = 'bottom-right';
    
    if (touch.clientX < centerX && touch.clientY < centerY) {
      newPosition = 'top-left';
    } else if (touch.clientX >= centerX && touch.clientY < centerY) {
      newPosition = 'top-right';
    } else if (touch.clientX < centerX && touch.clientY >= centerY) {
      newPosition = 'bottom-left';
    } else {
      newPosition = 'bottom-right';
    }
    
    this.currentPosition = newPosition;
    this.applyPosition(newPosition);
    
    // Salvar posição no localStorage
    localStorage.setItem('chatbot-position', newPosition);
    
    // Remover transição após um delay
    setTimeout(() => {
      this.isTransitioning = false;
    }, 600);
  }

  private applyPosition(position: string): void {
    const element = this.elementRef.nativeElement;
    
    setTimeout(() => {
      this.renderer.removeStyle(element, 'left');
      this.renderer.removeStyle(element, 'right');
      this.renderer.removeStyle(element, 'top');
      this.renderer.removeStyle(element, 'bottom');
      this.renderer.removeStyle(element, 'transform');
    }, 50);
  }

  private updateMaxHeight(): void {
    const windowHeight = window.innerHeight;
    const availableHeight = windowHeight - 100;
    this.maxSize.height = Math.min(availableHeight, 900);
    
    if (this.maxSize.height < this.minSize.height) {
      this.maxSize.height = this.minSize.height;
    }
    
    if (this.currentSize.height > this.maxSize.height) {
      this.currentSize.height = this.maxSize.height;
    }
  }

  private onWindowResize(): void {
    this.updateMaxHeight();
  }
  
  onResizeStart(event: MouseEvent): void {
    
    if (window.innerWidth <= 768) return;
    
    this.isResizing = true;
    this.resizeStartPos = { x: event.clientX, y: event.clientY };
    this.initialSize = { ...this.currentSize };
    
    document.addEventListener('mousemove', this.onResizeMove.bind(this));
    document.addEventListener('mouseup', this.onResizeEnd.bind(this));
    
    event.preventDefault();
    event.stopPropagation();
  }

  onResizeTouchStart(event: TouchEvent): void {
    
    if (window.innerWidth <= 768) return;
    
    const touch = event.touches[0];
    this.isResizing = true;
    this.resizeStartPos = { x: touch.clientX, y: touch.clientY };
    this.initialSize = { ...this.currentSize };
    
    document.addEventListener('touchmove', this.onResizeTouchMove.bind(this));
    document.addEventListener('touchend', this.onResizeTouchEnd.bind(this));
    
    event.preventDefault();
    event.stopPropagation();
  }

  onResizeMove(event: MouseEvent): void {
    if (!this.isResizing) return;
    
    const deltaX = event.clientX - this.resizeStartPos.x;
    const deltaY = event.clientY - this.resizeStartPos.y;
    
    let newWidth = this.initialSize.width;
    let newHeight = this.initialSize.height;
    
    if (this.currentPosition.includes('right')) {
      newWidth = this.initialSize.width - deltaX;
    } else {
      newWidth = this.initialSize.width + deltaX;
    }
    
    if (this.currentPosition.includes('bottom')) {
      newHeight = this.initialSize.height - deltaY;
    } else {
      newHeight = this.initialSize.height + deltaY;
    }
    
    newWidth = Math.max(this.minSize.width, Math.min(this.maxSize.width, newWidth));
    newHeight = Math.max(this.minSize.height, Math.min(this.maxSize.height, newHeight));
    
    this.currentSize = { width: newWidth, height: newHeight };
  }

  onResizeTouchMove(event: TouchEvent): void {
    if (!this.isResizing) return;
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - this.resizeStartPos.x;
    const deltaY = touch.clientY - this.resizeStartPos.y;
    
    let newWidth = this.initialSize.width;
    let newHeight = this.initialSize.height;
    
    if (this.currentPosition.includes('right')) {
      newWidth = this.initialSize.width - deltaX;
    } else {
      newWidth = this.initialSize.width + deltaX;
    }
    
    if (this.currentPosition.includes('bottom')) {
      newHeight = this.initialSize.height - deltaY;
    } else {
      newHeight = this.initialSize.height + deltaY;
    }
    
    newWidth = Math.max(this.minSize.width, Math.min(this.maxSize.width, newWidth));
    newHeight = Math.max(this.minSize.height, Math.min(this.maxSize.height, newHeight));
    
    this.currentSize = { width: newWidth, height: newHeight };
  }

  onResizeEnd(event: MouseEvent): void {
    if (!this.isResizing) return;
    
    this.isResizing = false;
    
    document.removeEventListener('mousemove', this.onResizeMove.bind(this));
    document.removeEventListener('mouseup', this.onResizeEnd.bind(this));
    
    localStorage.setItem('chatbot-size', JSON.stringify(this.currentSize));
  }

  onResizeTouchEnd(event: TouchEvent): void {
    if (!this.isResizing) return;
    
    this.isResizing = false;
    
    document.removeEventListener('touchmove', this.onResizeTouchMove.bind(this));
    document.removeEventListener('touchend', this.onResizeTouchEnd.bind(this));
    
    localStorage.setItem('chatbot-size', JSON.stringify(this.currentSize));
  }
}


