import { Component, Input, OnInit } from '@angular/core';
import { Tema } from '../page-questoes/enums/tema';
import { Subtema } from '../page-questoes/enums/subtema';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { SubtemaDescricoes } from '../page-questoes/enums/subtema-descricao';
import { temasESubtemas } from '../page-questoes/enums/map-tema-subtema';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FlashcardService, SubtemaStatsDTO } from 'src/app/services/flashcards.service'; // Certifique-se que o caminho está correto

@Component({
  selector: 'app-tema-flashcards',
  templateUrl: './tema-flashcards.component.html',
  styleUrls: ['./tema-flashcards.component.css'],
})
export class TemaFlashcardsComponent implements OnInit {
  @Input() tema: string = 'Tema';
  @Input() cards_estudados: number = 0;
  @Input() cards_totais: number = 0;

  subtemaDescricoes = SubtemaDescricoes;


  public subtemaStatsList: SubtemaStatsDTO[] = [];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private flashcardService: FlashcardService
  ) {}

  ngOnInit(): void {
    const temaIdUrl = this.route.snapshot.paramMap.get('temaId');

    if (temaIdUrl) {

      const temaKey = Object.keys(Tema).find(
        (key) => (Tema[key as keyof typeof Tema]).toLowerCase() === temaIdUrl
      ) as keyof typeof Tema | undefined;

      if (temaKey) {
        this.tema = TemaDescricoes[Tema[temaKey]];
      } else {
        this.tema = 'Tema não encontrado';
      }


      this.flashcardService.getStatsPorTema(temaIdUrl).subscribe({
        next: (statsList) => {

          this.subtemaStatsList = statsList;


          this.cards_estudados = statsList.reduce(
            (acumulador, subtema) => acumulador + subtema.flashcardsEstudados, 0
          );
          this.cards_totais = statsList.reduce(
            (acumulador, subtema) => acumulador + subtema.totalFlashcards, 0
          );
        },
        error: (err) => {
          console.error('Erro ao buscar estatísticas dos subtemas:', err);
          this.cards_estudados = 0;
          this.cards_totais = 0;
          this.subtemaStatsList = [];
        }
      });
    }
  }


  public getDescricao(key: string): string {
    const enumKey = key.toUpperCase() as Subtema;
    return this.subtemaDescricoes[enumKey] || key;
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