import { Component, Input, OnInit } from '@angular/core';
import { Tema } from '../page-questoes/enums/tema';
import { Subtema } from '../page-questoes/enums/subtema';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { SubtemaDescricoes } from '../page-questoes/enums/subtema-descricao';
import { temasESubtemas } from '../page-questoes/enums/map-tema-subtema';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FlashcardService, SubtemaStatsDTO, Flashcard } from 'src/app/services/flashcards.service'; 

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

  private temaIdUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private flashcardService: FlashcardService
  ) {}

  ngOnInit(): void {
    const idUrl = this.route.snapshot.paramMap.get('temaId');
    if (!idUrl) {
      this.tema = 'Tema não encontrado';
      return;
    }
    
    this.temaIdUrl = idUrl;
    let temaKey: keyof typeof Tema | undefined;

    temaKey = Object.keys(Tema).find(
      (key) => (Tema[key as keyof typeof Tema]).toLowerCase() === this.temaIdUrl
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
      });
    }

    this.flashcardService.getStatsPorTema(this.temaIdUrl.toUpperCase()).subscribe({
      next: (statsList) => {
        this.statsMap.clear();
        for (const stat of statsList) {
          this.statsMap.set(stat.subtema.toUpperCase(), stat);
        }
      },
    });
  }

  public getStatsDoSubtema(subtemaKey: Subtema): { total: number, estudados: number, porcentagem: number } {
    const stats = this.statsMap.get(subtemaKey);
    if (!stats) {
      return { total: 0, estudados: 0, porcentagem: 0 };
    }
    const total = (stats as any).total || 0; 
    const estudados = (stats as any).estudados || 0;
    const porcentagem = (total > 0) ? (estudados / total * 100) : 0;
    
    return { total, estudados, porcentagem };
  }
  
  iniciarEstudoTemaTodo(): void {
    this.flashcardService.getFlashcardsParaEstudar(this.temaIdUrl).subscribe(cards => {
      this.iniciarSessao(cards, this.temaIdUrl, undefined);
    });
  }

  iniciarEstudoSubtema(subtemaKey: Subtema): void {
    this.flashcardService.getFlashcardsParaEstudar(this.temaIdUrl, subtemaKey).subscribe(cards => {
      this.iniciarSessao(cards, this.temaIdUrl, subtemaKey);
    });
  }

  private iniciarSessao(cards: Flashcard[], tema: string, subtema?: Subtema): void {
    if (cards && cards.length > 0) {
      this.flashcardsIniciais = cards;
      this.temaEstudo = tema;
      this.subtemaEstudo = subtema;
      this.isFlashcardModalVisible = true;
    }
  }

  closeFlashcard(): void {
    this.isFlashcardModalVisible = false;
    this.flashcardsIniciais = [];
  }

  voltar(): void {
    this.location.back();
  }
}