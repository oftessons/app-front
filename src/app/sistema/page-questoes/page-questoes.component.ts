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
  mostrarCardConfirmacao = false; // Variável para controlar a visibilidade do card de confirmação
  filtroASalvar!: Filtro; // Variável para armazenar o filtro a ser salvo
  
  favoriteSeason!: string;
  seasons: string[] = ['A) I: V; II: V; III: V; IV: V.', 'B) I: F; II: F; III: V; IV: F.', 'C) I: F; II: F; III: F; IV: F.', 'D) I: V; II: V; III: F; IV: V.'];

  selectedAno: Ano = Ano.ANO_2024; // Inicializando com um valor padrão
  selectedDificuldade: Dificuldade = Dificuldade.DIFICIL;
  selectedTipoDeProva: TipoDeProva = TipoDeProva.PRATICA; // Inicializando com um valor padrão
  selectedSubtema: Subtema = Subtema.BASES_DE_CORNEA; // Inicializando com um valor padrão
  selectedTema: Tema = Tema.LENTES_DE_CONTATO; // Inicializando com um valor padrão
  palavraChave!: string;

  questoes: Questao[] = [];
  isFiltered = false;
  p: number = 1; // Página inicial para a paginação

  constructor(private questoesService: QuestoesService,
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
    this.questoesService.filtrarQuestoes({
      ano: this.selectedAno,
      dificuldade: this.selectedDificuldade,
      tipoDeProva: this.selectedTipoDeProva,
      subtema: this.selectedSubtema,
      tema: this.selectedTema,
      palavraChave: this.palavraChave // Adicione a palavra-chave aos filtros
    }).subscribe((questoes: Questao[]) => {
      this.questoes = questoes;
      this.isFiltered = true; // Marque que a filtragem foi realizada
      this.p = 1; // Reseta a página para 1 ao realizar nova filtragem
    });
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
            // Aqui você pode adicionar lógica adicional, como atualizar a lista de filtros, etc.
          },
          error => {
            console.error('Erro ao salvar filtro:', error);
            // Tratar erro aqui se necessário
          }
        );
    }
    this.fecharCardConfirmacao(); // Fecha o card de confirmação após a ação
  }
}
