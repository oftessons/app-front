import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Tema } from '../page-questoes/enums/tema';
import { Subtema } from '../page-questoes/enums/subtema';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { SubtemaDescricoes } from '../page-questoes/enums/subtema-descricao';
import { temasESubtemas } from '../page-questoes/enums/map-tema-subtema';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import {
  FlashcardService,
  SubtemaStatsDTO,
  Flashcard,
} from 'src/app/services/flashcards.service';

@Component({
  selector: 'app-tema-flashcards',
  templateUrl: './tema-flashcards.component.html',
  styleUrls: ['./tema-flashcards.component.css'],
})
export class TemaFlashcardsComponent implements OnInit {
  @Input() tema: string = 'Tema';
  @Input() cards_estudados: number = 0;
  @Input() cards_totais: number = 0;

  listaDeSubtemas: Subtema[] = [];
  subtemaDescricoes = SubtemaDescricoes;

  private statsMap = new Map<string, SubtemaStatsDTO>();

  public isFlashcardModalVisible = false;

  public temaEstudo: string = '';
  public subtemaEstudo?: Subtema;
  public flashcardsIniciais: Flashcard[] = [];
  public sessaoIdAtual?: number;
  public indiceInicial: number = 0;

  private temaIdUrl: string = '';
  public temaEnumKey: string = '';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private flashcardService: FlashcardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idUrl = this.route.snapshot.paramMap.get('temaId');

    if (!idUrl) {
      this.tema = 'Tema não encontrado';
      return;
    }

    this.temaIdUrl = idUrl;

    const foundKey = Object.keys(Tema).find(
      (key) =>
        (Tema[key as keyof typeof Tema] as string).toLowerCase() ===
        this.temaIdUrl.toLowerCase()
    );

    if (foundKey) {
      this.temaEnumKey = foundKey;
      const temaEnum = Tema[foundKey as keyof typeof Tema];
      this.tema = TemaDescricoes[temaEnum] || (temaEnum as string);
      this.listaDeSubtemas = temasESubtemas[temaEnum] || [];
    } else {
      this.tema = 'Tema não encontrado';
    }

    this.carregarDados();
  }

  private normalizarChave(texto: string): string {
    if (!texto) return '';
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[\s_]+/g, '')
      .trim();
  }

  carregarDados(): void {
    if (!this.temaEnumKey) {
      return;
    }

    this.flashcardService.getFlashcardsContador().subscribe((lista) => {
      const info = lista.find(
        (t) =>
          this.normalizarChave(t.tema) ===
          this.normalizarChave(this.temaEnumKey)
      );

      if (info) {
        this.cards_totais = info.total || 0;
      }
      this.cdr.detectChanges();
    });

    this.flashcardService
      .getStatsPorTema(this.temaEnumKey)
      .subscribe((statsList: any[]) => {
        this.statsMap.clear();

        let somaEstudados = 0;

        for (const stat of statsList) {
          const chave = this.normalizarChave(stat.subtema);
          this.statsMap.set(chave, stat);

          const estudadosSubtema =
            stat.estudados ?? stat.flashcardsEstudados ?? 0;
          somaEstudados += estudadosSubtema;
        }

        this.cards_estudados = somaEstudados;
        this.cdr.detectChanges();
      });
  }

  public getStatsDoSubtema(subtemaKey: any): {
    total: number;
    estudados: number;
    porcentagem: number;
  } {
    const chaveBusca = this.normalizarChave(String(subtemaKey));
    const stats: any = this.statsMap.get(chaveBusca);

    if (!stats) {
      return { total: 0, estudados: 0, porcentagem: 0 };
    }

    const total = stats.total ?? stats.totalFlashcards ?? 0;
    const estudados = stats.estudados ?? stats.flashcardsEstudados ?? 0;
    const porcentagem = total > 0 ? (estudados / total) * 100 : 0;

    return { total, estudados, porcentagem };
  }

  iniciarEstudoTemaTodo(): void {
    this.flashcardService
      .getFlashcardsParaEstudar(this.temaIdUrl)
      .subscribe((dto) => {
        this.iniciarSessao(
          dto.listaFlashcards,
          this.temaIdUrl,
          dto.idFlaschardContinuar,
          dto.idSessao,
          undefined
        );
      });
  }

  iniciarEstudoSubtema(subtemaKey: Subtema): void {
    this.flashcardService
      .getFlashcardsParaEstudar(this.temaIdUrl, subtemaKey)
      .subscribe((dto) => {
        this.iniciarSessao(
          dto.listaFlashcards,
          this.temaIdUrl,
          dto.idFlaschardContinuar,
          dto.idSessao,
          subtemaKey
        );
      });
  }

  private iniciarSessao(
    cards: Flashcard[],
    tema: string,
    indice: number,
    sessaoId: number,
    subtema?: Subtema
  ): void {
    if (cards && cards.length > 0) {
      this.flashcardsIniciais = cards;
      this.temaEstudo = tema;
      this.subtemaEstudo = subtema;
      this.indiceInicial = indice || 0;
      this.sessaoIdAtual = sessaoId;
      this.isFlashcardModalVisible = true;
    }
  }

  closeFlashcard(): void {
    this.isFlashcardModalVisible = false;
    this.flashcardsIniciais = [];
    setTimeout(() => {
      this.carregarDados();
    }, 200);
  }

  voltar(): void {
    this.location.back();
  }
}
