import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  Flashcard,
  FlashcardService,
  ReqAvaliarFlashcardDTO
} from 'src/app/services/flashcards.service';
import { TemaDescricoes } from 'src/app/sistema/page-questoes/enums/tema-descricao';
import { Tema } from 'src/app/sistema/page-questoes/enums/tema';
import { Subtema } from 'src/app/sistema/page-questoes/enums/subtema';
import { AuthService } from 'src/app/services/auth.service';

type FlashcardsState = 'question' | 'answer' | 'summary';

@Component({
  selector: 'app-flashcard-modal',
  templateUrl: './flashcard-modal.component.html',
  styleUrls: ['./flashcard-modal.component.css'],
})
export class FlashcardModalComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() temaEstudo: string = '';
  @Input() subtemaEstudo?: Subtema;
  @Input() flashcards: Flashcard[] = [];
  @Input() sessaoId?: number; 
  @Input() startingIndex: number = 0;
  @Output() close = new EventEmitter<void>();

  estado_atual: FlashcardsState = 'question';
  public isDeleteModalVisible = false;
  public currentCard: Flashcard | null = null;
  
  private cardsVistos = new Set<number>();
  public totalCardsEstudados: number = 0;
  public porcentagemAcerto: number = 0;
  private stats: { cardId: number; rating: number }[] = [];
  
  private sessaoStartTime: number = 0;
  private cardStartTime: number = 0;
  public tempoDecorrido: string = '00 min 00 seg';
  
  private currentSessaoId: number | undefined;
  private temaDescricoes = TemaDescricoes;
  private isLoadingNextCard = false;

  constructor(
    private flashcardService: FlashcardService,
    private authService: AuthService,
    private router: Router
  ) {}

  public get PermissaoFlashcards(): boolean {
    const token = this.authService.obterToken();
    if (!token) return false;
    try {
      const decodedToken = this.authService.jwtHelper.decodeToken(token);
      const userRoles: string[] = decodedToken?.authorities || decodedToken?.roles || [];
      if (userRoles.length === 0) {
        const singleRole = decodedToken?.role;
        if (!singleRole) return false;
        return singleRole === 'ADMIN' || singleRole === 'PROFESSOR';
      }
      return (
        userRoles.includes('ADMIN') ||
        userRoles.includes('PROFESSOR') ||
        userRoles.includes('ROLE_ADMIN') ||
        userRoles.includes('ROLE_PROFESSOR')
      );
    } catch {
      return false;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
      this.iniciarSessao();
    }
    if (changes['isVisible'] && !changes['isVisible'].currentValue) {
      this.resetarModal();
    }
    if (changes['sessaoId']) {
        this.currentSessaoId = changes['sessaoId'].currentValue;
    }
  }

  private iniciarSessao(): void {
    if (this.flashcards && this.flashcards.length > 0) {
      this.stats = [];
      this.cardsVistos.clear();
      this.totalCardsEstudados = 0;
      this.isLoadingNextCard = false;
      
      const agora = Date.now();
      this.sessaoStartTime = agora;
      this.cardStartTime = agora; 
      this.tempoDecorrido = '00 min 00 seg';
      this.currentSessaoId = this.sessaoId;

      let index = (this.startingIndex && this.startingIndex < this.flashcards.length) 
                    ? this.startingIndex 
                    : 0;
      
      if (index >= this.flashcards.length) {
          this.mostrarSumario();
          return;
      }

      for(let i = 0; i < index; i++) {
         if(this.flashcards[i]) {
             this.cardsVistos.add(this.flashcards[i].id);
         }
      }

      this.currentCard = this.flashcards[index];
      this.cardsVistos.add(this.currentCard.id);
      this.estado_atual = 'question';
    } else {
      this.onCloseClick();
    }
  }

  private resetarModal(): void {
    this.estado_atual = 'question';
    this.currentCard = null;
    this.flashcards = [];
    this.isDeleteModalVisible = false;
  }

  onCloseClick(): void {
    this.close.emit();
  }

  showAnswer(): void {
    this.estado_atual = 'answer';
  }

  rateAnswer(rating: number): void {
    if (!this.currentCard || this.isLoadingNextCard) return;

    this.isLoadingNextCard = true;

    const tempoFim = Date.now();
    const milissegundosGastos = tempoFim - this.cardStartTime;
    const segundosGastos = milissegundosGastos / 1000;

    const avaliacaoDTO: ReqAvaliarFlashcardDTO = {
        id: this.currentCard.id,
        nota: rating,
        sessaoId: this.currentSessaoId,
        tempoAtivoMilisegundo: milissegundosGastos
    };

    this.flashcardService.avaliarFlashcard(avaliacaoDTO).subscribe({
        next: () => {},
        error: (err) => console.error(err)
    });

    this.stats.push({ cardId: this.currentCard.id, rating: rating });
    this.totalCardsEstudados = this.stats.length;

    const sequenciaPrioridade = this.gerarSequenciaPrioridade(segundosGastos);
    this.executarBuscaEmCascata(sequenciaPrioridade);
  }

  private gerarSequenciaPrioridade(segundos: number): (string | undefined)[] {
    if (segundos < 30) {
      return ['DIFICIL', 'MEDIO', 'FACIL', undefined];
    } else if (segundos < 60) {
      return ['MEDIO', 'DIFICIL', 'FACIL', undefined];
    } else {
      return ['FACIL', 'MEDIO', 'DIFICIL', undefined];
    }
  }

  private executarBuscaEmCascata(prioridades: (string | undefined)[]): void {
    if (prioridades.length === 0) {
      this.mostrarSumario();
      return;
    }

    const dificuldadeAtual = prioridades[0];
    const proximasPrioridades = prioridades.slice(1);

    this.flashcardService
      .getFlashcardsParaEstudar(this.temaEstudo, this.subtemaEstudo, dificuldadeAtual)
      .subscribe({
        next: (dto) => {
          if (dto.idSessao) {
            this.currentSessaoId = dto.idSessao;
          }
          
          const lista = dto.listaFlashcards || [];
          const novoCard = lista.find(c => !this.cardsVistos.has(c.id));

          if (novoCard) {
            this.setarNovoCard(novoCard);
          } else {
            this.executarBuscaEmCascata(proximasPrioridades);
          }
        },
        error: () => {
          this.executarBuscaEmCascata(proximasPrioridades);
        }
      });
  }

  private setarNovoCard(card: Flashcard): void {
    this.currentCard = card;
    this.cardsVistos.add(card.id);
    this.estado_atual = 'question';
    this.isLoadingNextCard = false;
    this.cardStartTime = Date.now();
  }

  openDeleteModal(): void {
    this.isDeleteModalVisible = true;
  }

  onDeleteModalClose(): void {
    this.isDeleteModalVisible = false;
  }

  onDeleteConfirm(): void {
    this.isDeleteModalVisible = false;
    this.onCloseClick();
  }

  private mostrarSumario(): void {
    const endTime = Date.now();
    const durationInSeconds = Math.floor((endTime - this.sessaoStartTime) / 1000);
    this.tempoDecorrido = this.formatarTempo(durationInSeconds);
    
    const somaNotas = this.stats.reduce((acc, stat) => acc + stat.rating, 0);
    const mediaNotas = this.stats.length > 0 ? somaNotas / this.stats.length : 0;
    this.porcentagemAcerto = (mediaNotas / 5) * 100;
    
    this.estado_atual = 'summary';
    this.isLoadingNextCard = false;
  }

  private formatarTempo(totalSegundos: number): string {
    const horas = Math.floor(totalSegundos / 3600);
    const segundosRestantes = totalSegundos % 3600;
    const minutos = Math.floor(segundosRestantes / 60);
    const segundos = segundosRestantes % 60;
    
    const minString = minutos.toString().padStart(2, '0');
    const segString = segundos.toString().padStart(2, '0');
    
    if (horas > 0) {
      const horaString = horas.toString().padStart(2, '0');
      return `${horaString} h ${minString} min ${segString} seg`;
    } else {
      return `${minString} min ${segString} seg`;
    }
  }

  editarFlashcard(): void {
    if (!this.currentCard) return;
    this.router.navigate(['/usuario/cadastro-flashcard', this.currentCard.id], {
      state: { flashcard: this.currentCard },
    });
    this.onCloseClick();
  }

  getTemaNome(): string {
    if (!this.currentCard) return '';
    const temaKey = this.currentCard.tema.toUpperCase() as Tema;
    return this.temaDescricoes[temaKey] || this.currentCard.tema;
  }
}