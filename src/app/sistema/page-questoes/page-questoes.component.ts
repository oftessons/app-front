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

declare var bootstrap: any;

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

  message: string = '';

  questaoAtual: Questao | null = null;
  paginaAtual: number = 0;
  filtros: any = {
    ano: null,
    dificuldade: null,
    tipoDeProva: null,
    subtema: null,
    tema: null,
    palavraChave: null
  };

  mostrarCardConfirmacao = false;
  filtroASalvar!: Filtro;

  favoriteSeason!: string;
  seasons: string[] = ['A) I: V; II: V; III: V; IV: V.', 'B) I: F; II: F; III: V; IV: F.', 'C) I: F; II: F; III: F; IV: F.', 'D) I: V; II: V; III: F; IV: V.'];

  selectedAno: Ano | null = null;
  selectedDificuldade: Dificuldade | null = null;
  selectedTipoDeProva: TipoDeProva | null = null;
  selectedSubtema: Subtema | null = null;
  selectedTema: Tema | null = null;
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

  // -OK
  LimparFiltro() {
    this.selectedAno = null;
    this.selectedDificuldade = null;
    this.selectedTipoDeProva = null;
    this.selectedSubtema = null;
    this.selectedTema = null;
    this.palavraChave = '';
    this.filtros = {
      ano: null,
      dificuldade: null,
      tipoDeProva: null,
      subtema: null,
      tema: null,
      palavraChave: null
    };
    this.paginaAtual = 0;
  }
  

  filtrarQuestoes(): void {
    const filtros: any = {};
  
    // Adiciona filtros apenas se estiverem definidos
    if (this.selectedAno) {
      filtros.ano = this.selectedAno;
    }
    if (this.selectedDificuldade) {
      filtros.dificuldade = this.selectedDificuldade;
    }
    if (this.selectedTipoDeProva) {
      filtros.tipoDeProva = this.selectedTipoDeProva;
    }
    if (this.selectedSubtema) {
      filtros.subtema = this.selectedSubtema;
    }
    if (this.selectedTema) {
      filtros.tema = this.selectedTema;
    }
    if (this.palavraChave) {
      filtros.palavraChave = this.palavraChave;
    }
  
    if (Object.keys(filtros).length === 0) {
      this.message = 'Por favor, selecione pelo menos um filtro.';
      this.questoes = [];
      return;
    }
  
    this.questoesService.filtrarQuestoes(filtros, this.paginaAtual, 1).subscribe(
      (questoes: Questao[]) => {
        if (questoes.length === 0) {
          this.message = 'Nenhuma questão encontrada com os filtros aplicados.';
          this.questoes = [];
        } else {
          this.message = '';
          this.questoes = questoes;
        }
      },
      (error) => {
        console.error('Erro ao tentar obter as questões.', error);
        this.message = 'Erro ao tentar obter as questões. Por favor, tente novamente.';
        this.questoes = [];
      }
    );
  }
  
    

  anteriorQuestao(): void {
    if (this.paginaAtual > 0) {
      this.paginaAtual--;
      this.filtrarQuestoes();
    }
  }

  proximaQuestao(): void {
    this.paginaAtual++;
    this.filtrarQuestoes();
  }

  abrirModal(): void {
    const modalElement = document.getElementById('confirmacaoModal');
    const modal = new bootstrap.Modal(modalElement!);
    modal.show();

    // Adiciona evento para quando o modal for fechado
    modalElement?.addEventListener('hidden.bs.modal', () => {
      this.fecharCardConfirmacao();
    });
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
    const modalElement = document.getElementById('confirmacaoModal');
    const modal = bootstrap.Modal.getInstance(modalElement!);
    modal.hide();
  }

  fecharCardConfirmacao(): void {
    this.mostrarCardConfirmacao = false;
  }
}