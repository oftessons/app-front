import { Component, Input, OnInit } from '@angular/core';
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

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private flashcardService: FlashcardService
  ) {}

  ngOnInit(): void {
    const temaIdUrl = this.route.snapshot.paramMap.get('temaId');
    let temaKey: keyof typeof Tema | undefined;

    if (temaIdUrl) {
      temaKey = Object.keys(Tema).find(
        (key) => Tema[key as keyof typeof Tema].toLowerCase() === temaIdUrl
      ) as keyof typeof Tema | undefined;

      if (temaKey) {
        const temaEnum = Tema[temaKey];
        this.tema = TemaDescricoes[temaEnum];
        this.listaDeSubtemas = temasESubtemas[temaEnum] || [];
      } else {
        this.tema = 'Tema não encontrado';
      }

      if (temaKey) {
        this.flashcardService.getFlashcardsContador().subscribe({
          next: (listaDeTodosOsTemas) => {
            const temaInfo = listaDeTodosOsTemas.find(
              (t) => t.tema.toUpperCase() === (temaKey as string)
            );
            if (temaInfo) {
              this.cards_totais = temaInfo.total || 0;
              this.cards_estudados = temaInfo.qtdFlashcards || 0;
            }
          },
          error: (err) => {
            console.error('[HEADER] Erro ao buscar contador:', err);
            this.cards_estudados = 0;
            this.cards_totais = 0;
          },
        });
      }

      this.flashcardService.getStatsPorTema(temaIdUrl.toUpperCase()).subscribe({
        next: (statsList) => {
          this.statsMap.clear();
          for (const stat of statsList) {
            this.statsMap.set(stat.subtema.toUpperCase(), stat);
          }
        },
        error: (err) => {
          console.error('[SUBTEMAS] Erro ao buscar stats dos subtemas:', err);
          this.statsMap.clear();
        },
      });
    }
  }

  public getStatsDoSubtema(subtemaKey: Subtema): {
    total: number;
    estudados: number;
    porcentagem: number;
  } {
    const stats = this.statsMap.get(subtemaKey);

    if (!stats) {
      return { total: 0, estudados: 0, porcentagem: 0 };
    }

    const total = (stats as any).total || 0;
    const estudados = (stats as any).estudados || 0;

    const porcentagem = total > 0 ? (estudados / total) * 100 : 0;

    return { total, estudados, porcentagem };
  }

  isFlashcardModalVisible = false;

  openFlashcard(): void {
    this.isFlashcardModalVisible = true;
  }

  closeFlashcard(): void {
    this.isFlashcardModalVisible = false;
  }

  voltar(): void {
    this.location.back();
  }
}
