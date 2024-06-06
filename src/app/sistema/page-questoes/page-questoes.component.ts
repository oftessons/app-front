import { Component, OnInit } from '@angular/core';
import { TipoDeProva } from './enums/tipoDeProva';
import { getDescricaoAno, getDescricaoDificuldade, getDescricaoSubtema, getDescricaoTema, getDescricaoTipoDeProva } from './enums/enum-utils';
import { Ano } from './enums/ano';
import { Dificuldade } from './enums/dificuldade';
import { Subtema } from './enums/subtema';
import { Tema } from './enums/tema';
import { Questao } from './questao';
import { QuestoesService } from 'src/app/services/questoes.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-page-questoes',
  templateUrl: './page-questoes.component.html',
  styleUrls: ['./page-questoes.component.css']
})
export class PageQuestoesComponent implements OnInit {
  tiposDeProva = Object.values(TipoDeProva);
  anos = Object.values(Ano);
  dificuldades = Object.values(Dificuldade);
  subtemas = Object.values(Subtema);
  temas = Object.values(Tema);

  selectedAno: Ano = Ano.ANO_2024; // Inicializando com um valor padrão
  selectedDificuldade: Dificuldade = Dificuldade.DIFICIL;
  selectedTipoDeProva: TipoDeProva = TipoDeProva.PRATICA; // Inicializando com um valor padrão
  selectedSubtema: Subtema = Subtema.RETINOPATIA; // Inicializando com um valor padrão
  selectedTema: Tema = Tema.CIRURGIA_OCULAR; // Inicializando com um valor padrão
  palavraChave!: string;

  questoes: Questao[] = [];
  isFiltered = false;
  p: number = 1; // Página inicial para a paginação

  constructor(private questoesService: QuestoesService) { }

  ngOnInit() { }

  getDescricaoTipoDeProva(tipoDeProva: TipoDeProva): string {
    return getDescricaoTipoDeProva(tipoDeProva);
  }

  getDescricaoAno(ano: Ano): string {
    return getDescricaoAno(ano);
  }

  getDescricaoDificuldade(dificuldade: Dificuldade): string {
    return getDescricaoDificuldade(dificuldade);
  }

  getDescricaoSubtema(subtema: Subtema): string {
    return getDescricaoSubtema(subtema);
  }

  getDescricaoTema(tema: Tema): string {
    return getDescricaoTema(tema);
  }

  filtrarQuestoes(): void {
    this.questoesService.filtrarQuestoes({
      ano: this.selectedAno,
      dificuldade: this.selectedDificuldade,
      tipoDeProva: this.selectedTipoDeProva,
      subtema: this.selectedSubtema,
      tema: this.selectedTema,
      palavraChave: this.palavraChave || '' // Adicione um valor padrão para palavraChave
    }).subscribe(
      (questoes: Questao[]) => {
        this.questoes = questoes;
        this.isFiltered = true; // Marque que a filtragem foi realizada
        this.p = 1; // Reseta a página para 1 ao realizar nova filtragem
      },
      (error: HttpErrorResponse) => {
        console.error('Erro ao filtrar questões:', error);
      }
    );
  }
  
  
}
