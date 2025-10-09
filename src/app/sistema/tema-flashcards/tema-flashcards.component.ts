import { Component, Input, OnInit } from '@angular/core';
import { Tema } from '../page-questoes/enums/tema';
import { Subtema } from '../page-questoes/enums/subtema';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { SubtemaDescricoes } from '../page-questoes/enums/subtema-descricao';
import { temasESubtemas } from '../page-questoes/enums/map-tema-subtema';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

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

  constructor(private route: ActivatedRoute, private location: Location) {}

  ngOnInit(): void {
    const temaIdUrl = this.route.snapshot.paramMap.get('temaId');

    if (temaIdUrl) {
      const temaKey = Object.keys(Tema).find(
        (key) => Tema[key as keyof typeof Tema].toLowerCase() === temaIdUrl
      ) as keyof typeof Tema | undefined;

      if (temaKey) {
        const temaEnum = Tema[temaKey];

        this.tema = TemaDescricoes[temaEnum];
        this.listaDeSubtemas = temasESubtemas[temaEnum] || [];
        this.cards_totais = this.listaDeSubtemas.length;
      } else {
        this.tema = 'Tema não encontrado';
      }
    }
  }

  voltar(): void {
    this.location.back();
  }
}
