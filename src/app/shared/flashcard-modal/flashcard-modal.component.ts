import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  Flashcard,
  FlashcardService,
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
  @Output() close = new EventEmitter<void>();

  estado_atual: FlashcardsState = 'question';

  public isDeleteModalVisible = false;

  public currentCard: Flashcard | null = null;
  private cardsVistos = new Set<number>();

  public totalCardsEstudados: number = 0;
  public porcentagemAcerto: number = 0;
  private stats: { cardId: number; rating: number }[] = [];

  private temaDescricoes = TemaDescricoes;

  private isLoadingNextCard = false;

  private sessaoStartTime: number = 0;
  public tempoDecorrido: string = '00 min 00 seg';

  constructor(
    private flashcardService: FlashcardService,
    private authService: AuthService
  ) {}

  public get PermissaoFlashcards(): boolean {
    const token = this.authService.obterToken();
    if (!token) {
      return false;
    }

    try {
      const decodedToken = this.authService.jwtHelper.decodeToken(token);
      const userRoles: string[] = decodedToken?.authorities || decodedToken?.roles || [];

      if (userRoles.length === 0) {
        const singleRole = decodedToken?.role;
        if (!singleRole) return false;
        return singleRole === 'ADMIN' || singleRole === 'PROFESSOR';
      }

      return userRoles.includes('ADMIN') || 
             userRoles.includes('PROFESSOR') ||
             userRoles.includes('ROLE_ADMIN') ||
             userRoles.includes('ROLE_PROFESSOR');

    } catch (error) {
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
  }

  private iniciarSessao(): void {
    if (this.flashcards && this.flashcards.length > 0) {
      this.stats = [];
      this.cardsVistos.clear();
      this.totalCardsEstudados = 0;
      this.isLoadingNextCard = false;

      this.sessaoStartTime = Date.now();
      this.tempoDecorrido = '00 min 00 seg';

      this.currentCard = this.flashcards[0];
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

    const cardId = this.currentCard.id;

    this.stats.push({ cardId: cardId, rating: rating });
    this.totalCardsEstudados = this.stats.length;

    const idealDificuldade = this.mapearRatingParaDificuldade(rating);

    const tryFallback = () => {
      this.flashcardService
        .getFlashcardsParaEstudar(this.temaEstudo, this.subtemaEstudo)
        .subscribe({
          next: (fallbackList) => {
            const list = fallbackList || [];
            const fallbackCard = list.find(
              (card) => !this.cardsVistos.has(card.id)
            );

            if (fallbackCard) {
              this.currentCard = fallbackCard;
              this.cardsVistos.add(fallbackCard.id);
              this.estado_atual = 'question';
              this.isLoadingNextCard = false;
            } else {
              this.mostrarSumario();
            }
          },
          error: () => {
            this.mostrarSumario();
          },
        });
    };

    this.flashcardService
      .getFlashcardsParaEstudar(
        this.temaEstudo,
        this.subtemaEstudo,
        idealDificuldade
      )
      .subscribe({
        next: (idealList) => {
          const list = idealList || [];
          const idealCard = list.find((card) => !this.cardsVistos.has(card.id));

          if (idealCard) {
            this.currentCard = idealCard;
            this.cardsVistos.add(idealCard.id);
            this.estado_atual = 'question';
            this.isLoadingNextCard = false;
          } else {
            tryFallback();
          }
        },
        error: () => {
          tryFallback();
        },
      });
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

  private mapearRatingParaDificuldade(rating: number): string {
    if (rating <= 2) {
      return 'FACIL';
    }
    if (rating === 3) {
      return 'MEDIA';
    }
    return 'DIFICIL';
  }

  private mostrarSumario(): void {
    const endTime = Date.now();
    const durationInSeconds = Math.floor(
      (endTime - this.sessaoStartTime) / 1000
    );
    this.tempoDecorrido = this.formatarTempo(durationInSeconds);

    const somaNotas = this.stats.reduce((acc, stat) => acc + stat.rating, 0);
    const mediaNotas =
      this.stats.length > 0 ? somaNotas / this.stats.length : 0;
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

  getTemaNome(): string {
    if (!this.currentCard) return '';
    const temaKey = this.currentCard.tema.toUpperCase() as Tema;
    return this.temaDescricoes[temaKey] || this.currentCard.tema;
  }
}