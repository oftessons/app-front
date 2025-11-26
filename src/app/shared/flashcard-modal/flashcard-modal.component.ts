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
  ReqAvaliarFlashcardDTO,
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
  @Input() startingIndex: number = 0;
  @Input() sessaoId?: number;
  @Output() close = new EventEmitter<void>();

  estado_atual: FlashcardsState = 'question';
  public isDeleteModalVisible = false;

  public currentCard: Flashcard | null = null;
  private currentIndex: number = 0;

  public totalCardsEstudados: number = 0;
  public porcentagemAcerto: number = 0;
  private stats: { cardId: number; rating: number }[] = [];

  private temaDescricoes = TemaDescricoes;
  private sessaoStartTime: number = 0;
  private cardStartTime: number = 0;
  public tempoDecorrido: string = '00 min 00 seg';

  isLoadingQuestionImage: boolean = true;
  isLoadingAnswerImage: boolean = true;

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
      const userRoles: string[] =
        decodedToken?.authorities || decodedToken?.roles || [];
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
  }

  private iniciarSessao(): void {
    if (this.flashcards && this.flashcards.length > 0) {
      this.stats = [];
      this.totalCardsEstudados = 0;
      this.sessaoStartTime = Date.now();
      this.tempoDecorrido = '00 min 00 seg';
      this.currentIndex = this.startingIndex || 0;
      this.carregarCardAtual();
    } else {
      this.onCloseClick();
    }
  }

  private carregarCardAtual(): void {
    if (this.currentIndex < this.flashcards.length) {
      this.isLoadingQuestionImage = true;
      this.isLoadingAnswerImage = true;
      
      this.currentCard = this.flashcards[this.currentIndex];
      this.cardStartTime = Date.now();
      this.estado_atual = 'question';
    } else {
      this.mostrarSumario();
    }
  }

  onImageLoad(type: 'question' | 'answer'): void {
    if (type === 'question') {
      this.isLoadingQuestionImage = false;
    } else {
      this.isLoadingAnswerImage = false;
    }
  }

  private resetarModal(): void {
    this.estado_atual = 'question';
    this.currentCard = null;
    this.currentIndex = 0;
    this.isDeleteModalVisible = false;
    this.isLoadingQuestionImage = true;
    this.isLoadingAnswerImage = true;
  }

  onCloseClick(): void {
    this.close.emit();
  }

  showAnswer(): void {
    this.estado_atual = 'answer';
  }

  rateAnswer(rating: number): void {
    if (!this.currentCard) return;

    const cardId = this.currentCard.id;
    const tempoGasto = Date.now() - this.cardStartTime;

    const avaliacaoDTO: ReqAvaliarFlashcardDTO = {
      id: cardId,
      nota: rating,
      sessaoId: this.sessaoId,
      tempoAtivoMilisegundo: tempoGasto,
    };

    this.flashcardService.avaliarFlashcard(avaliacaoDTO).subscribe({
      next: (res) => {},
      error: (err) => {
        console.error('Erro ao salvar avaliação', err);
      },
    });

    this.stats.push({ cardId: cardId, rating: rating });
    this.totalCardsEstudados = this.stats.length;

    this.currentIndex++;
    this.carregarCardAtual();
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
    this.currentCard = null;
  }

  openDeleteModal(): void {
    this.isDeleteModalVisible = true;
  }

  onDeleteModalClose(): void {
    this.isDeleteModalVisible = false;
  }

  onDeleteConfirm(): void {
    if (this.currentCard) {
      this.isDeleteModalVisible = false;
      this.onCloseClick();
    }
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