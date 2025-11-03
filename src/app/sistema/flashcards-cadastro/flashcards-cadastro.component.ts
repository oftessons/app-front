import {
  Component,
  OnInit,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { Tema } from '../page-questoes/enums/tema';
import { Subtema } from '../page-questoes/enums/subtema';
import { temasESubtemas } from '../page-questoes/enums/map-tema-subtema';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { SubtemaDescricoes } from '../page-questoes/enums/subtema-descricao';
import { Location } from '@angular/common';
import {
  FlashcardService,
  ReqSalvarFlashcardDTO,
  Flashcard,
  ReqAtualizarFlashcardDTO,
} from 'src/app/services/flashcards.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-flashcards-cadastro',
  templateUrl: './flashcards-cadastro.component.html',
  styleUrls: ['./flashcards-cadastro.component.css'],
})
export class FlashcardsCadastroComponent implements OnInit, AfterViewInit {
  subtemasAgrupadosPorTema: {
    label: string;
    temaKey: string;
    disabled?: boolean;
    options: { label: string; value: string }[];
  }[] = [];

  assuntoSelecionado: string | null = null;
  relevanciaSelecionada: number | null = null;
  dificuldadeSelecionada: string | null = null;

  optionsRelevancia = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
  ];

  optionsDificuldade = [
    { label: 'Fácil', value: 'FACIL' },
    { label: 'Médio', value: 'MEDIO' },
    { label: 'Difícil', value: 'DIFICIL' },
  ];

  perguntaHtml = '';
  respostaHtml = '';

  flashcardParaEditar: Flashcard | null = null;
  modoEdicao = false;

  constructor(
    private location: Location,
    private flashcardService: FlashcardService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.flashcardParaEditar = navigation.extras.state[
        'flashcard'
      ] as Flashcard;
    }
  }

  ngOnInit(): void {
    this.subtemasAgrupadosPorTema = Object.entries(temasESubtemas).map(
      ([temaKey, subtemas]) => {
        const temaEnum = temaKey as Tema;
        const temaLabel = TemaDescricoes[temaEnum] || temaKey;
        return {
          label: temaLabel,
          temaKey: temaKey,
          disabled: true,
          options: subtemas.map((subtema) => {
            const subtemaKey =
              typeof subtema === 'number'
                ? (Subtema as any)[subtema]
                : (subtema as any);
            const subtemaLabel = SubtemaDescricoes[subtema] || subtemaKey;
            return { label: subtemaLabel, value: subtemaKey };
          }),
        };
      }
    );
  }

  ngAfterViewInit(): void {
    if (this.flashcardParaEditar) {
      this.modoEdicao = true;
      const card = this.flashcardParaEditar;
      this.perguntaHtml = card.pergunta;
      this.respostaHtml = card.resposta;
      setTimeout(() => {
        this.relevanciaSelecionada = card.relevancia;
        this.dificuldadeSelecionada = this.normalizarDificuldade(
          card.dificuldade
        );
        this.assuntoSelecionado = this.findMatchingSubtema(card.subtema);
        this.cdRef.detectChanges();
      }, 0);
    }
  }

  voltar() {
    this.location.back();
  }

  salvar(): void {
    if (
      !this.assuntoSelecionado ||
      !this.dificuldadeSelecionada ||
      !this.relevanciaSelecionada ||
      !this.perguntaHtml ||
      !this.respostaHtml
    ) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const temaSelecionado = this.encontrarTemaDoSubtema(
      this.assuntoSelecionado
    );
    if (!temaSelecionado) {
      alert('Erro: Tema não encontrado para o subtema selecionado.');
      return;
    }

    if (this.modoEdicao && this.flashcardParaEditar) {
      const dto: ReqAtualizarFlashcardDTO = {
        pergunta: this.perguntaHtml,
        resposta: this.respostaHtml,
        tema: temaSelecionado,
        subtema: this.assuntoSelecionado,
        dificuldade: this.dificuldadeSelecionada,
        relevancia: this.relevanciaSelecionada,
      };
      this.flashcardService
        .atualizarFlashcard(this.flashcardParaEditar.id, dto)
        .subscribe({
          next: () => {
            alert('Flashcard atualizado com sucesso!');
            this.voltar();
          },
        });
    } else {
      const dto: ReqSalvarFlashcardDTO = {
        pergunta: this.perguntaHtml,
        resposta: this.respostaHtml,
        tema: temaSelecionado,
        subtema: this.assuntoSelecionado,
        dificuldade: this.dificuldadeSelecionada,
        relevancia: this.relevanciaSelecionada,
        createdBy: 0,
      };
      this.flashcardService.salvarFlashcard(dto).subscribe({
        next: () => {
          alert('Flashcard salvo com sucesso!');
          this.voltar();
        },
        error: (erro) => {
          alert(`Erro ao salvar: ${erro.error?.message || erro.message}`);
        },
      });
    }
  }

  private encontrarTemaDoSubtema(subtemaKey: string): string | null {
    for (const grupo of this.subtemasAgrupadosPorTema) {
      const found = grupo.options.find((opt) => opt.value === subtemaKey);
      if (found) return grupo.temaKey;
    }
    return null;
  }
  
  private canon(s: string): string {
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .toUpperCase();
  }

  private normalizarDificuldade(v?: string | null): string | null {
    if (!v) return null;
    const x = this.canon(v);
    if (x === 'MEDIA' || x === 'MEDIO' || x === 'INTERMEDIARIO') return 'MEDIO';
    if (x === 'FACIL' || x === 'EASY') return 'FACIL';
    if (x === 'DIFICIL' || x === 'HARD') return 'DIFICIL';
    return ['FACIL', 'MEDIO', 'DIFICIL'].includes(x) ? x : null;
  }

  private findMatchingSubtema(v?: string | null): string | null {
    if (!v) return null;
    const wanted = this.canon(v);
    for (const g of this.subtemasAgrupadosPorTema) {
      for (const opt of g.options) {
        const key = this.canon(String(opt.value));
        if (key === wanted) return opt.value;
      }
    }
    return null;
  }
}
