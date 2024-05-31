import { Component, OnInit } from '@angular/core';
import { TipoDeProva } from './enums/tipoDeProva';
import { getDescricaoAno, getDescricaoDificuldade, getDescricaoSubtema, getDescricaoTema, getDescricaoTipoDeProva } from './enums/enum-utils';
import { Ano } from './enums/ano';
import { Dificuldade } from './enums/dificuldade';
import { Subtema } from './enums/subtema';
import { Tema } from './enums/tema';
import { Questao } from './questao';
import { QuestoesService } from 'src/app/services/questoes.service';

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

selectedAno!: Ano;
selectedDificuldade!: Dificuldade;
selectedTipoDeProva!: TipoDeProva;
selectedSubtema!: Subtema;
selectedTema!: Tema;
palavraChave!: string;

  constructor(private questoesService: QuestoesService
  ) { }

  ngOnInit() {
    this.filtrarQuestoes();
  }

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
    // Chamar o serviço para buscar as questões com os filtros selecionados
    //this.questoesService.filtrarQuestoes(this.selectedAno, this.selectedDificuldade, this.selectedTipoDeProva, this.selectedSubtema, this.selectedTema)
     // .subscribe((questoes: Questao[]) => {
     //   this.questoes = questoes; // Atribuir as questões retornadas pelo backend à variável do componente
     // });
  }
}
