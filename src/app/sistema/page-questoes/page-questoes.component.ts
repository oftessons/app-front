import { Component, OnInit } from '@angular/core';
import { TipoDeProva } from './enums/tipoDeProva';
import { getDescricaoAno, getDescricaoDificuldade, getDescricaoSubtema, getDescricaoTema, getDescricaoTipoDeProva } from './enums/enum-utils';
import { Ano } from './enums/ano';
import { Dificuldade } from './enums/dificuldade';
import { Subtema } from './enums/subtema';
import { Tema } from './enums/tema';
import { Questao } from './questao';
import { QuestoesService } from 'src/app/services/questoes.service';
import { Filtro } from '../filtro';
import { FiltroService } from 'src/app/services/filtro.service';

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

  filtros: Filtro[] = [];
  mostrarCardConfirmacao = false;
  filtroASalvar!: Filtro;

  favoriteSeason!: string;
  seasons: string[] = ['A) I: V; II: V; III: V; IV: V.', 'B) I: F; II: F; III: V; IV: F.', 'C) I: F; II: F; III: F; IV: F.', 'D) I: V; II: V; III: F; IV: V.'];


  selectedAno!: Ano; // Inicialize com null ou com um valor padrão
  selectedDificuldade!: Dificuldade; // Inicialize com null ou com um valor padrão
  selectedTipoDeProva!: TipoDeProva; // Inicialize com null ou com um valor padrão
  selectedSubtema!: Subtema; // Inicialize com null ou com um valor padrão
  selectedTema!: Tema; // Inicialize com null ou com um valor padrão
  palavraChave: string = '';

  questoes: Questao[] = [];
  isFiltered = false;
  p: number = 1;

  constructor(
    private questoesService: QuestoesService,
    private filtroService: FiltroService
  ) { }

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
    const filtro: any = {
      ano: this.selectedAno,
      dificuldade: this.selectedDificuldade,
      tipoDeProva: this.selectedTipoDeProva,
      subtema: this.selectedSubtema,
      tema: this.selectedTema,
      palavraChave: this.palavraChave
    };

    this.questoesService.filtrarQuestoes(filtro).subscribe(
      (questoes: Questao[]) => {
        this.questoes = questoes;
        this.isFiltered = true;
        this.p = 1;
      },
      (error) => {
        console.error('Erro ao tentar obter as questões.', error);
        // Adicione lógica para tratamento de erro aqui, se necessário
      }
    );
  }

  abrirCardConfirmacao(filtro: Filtro): void {
    this.filtroASalvar = filtro;
    this.mostrarCardConfirmacao = true;
  }

  fecharCardConfirmacao(): void {
    this.mostrarCardConfirmacao = false;
  }

  confirmarSalvarFiltro(): void {
    if (this.filtroASalvar) {
      this.filtroService.salvarFiltro(this.filtroASalvar)
        .subscribe(
          response => {
            console.log('Filtro salvo com sucesso:', response);
            // Adicione lógica adicional se necessário
          },
          error => {
            console.error('Erro ao salvar filtro:', error);
            // Trate o erro aqui, se necessário
          }
        );
    }
    this.fecharCardConfirmacao();
  }
}