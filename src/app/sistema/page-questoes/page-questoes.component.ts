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
import { RespostaDTO } from '../RespostaDTO';  // Adicione esta importação
import { Resposta } from '../Resposta';  // Adicione esta importação

declare var bootstrap: any;

@Component({
  selector: 'app-page-questoes',
  templateUrl: './page-questoes.component.html',
  styleUrls: ['./page-questoes.component.css']
})
export class PageQuestoesComponent implements OnInit {

  questao: Questao = new Questao();
  selectedOption: string = '';
  //resposta: string | null = null;

  tiposDeProva = Object.values(TipoDeProva);
  anos = Object.values(Ano);
  dificuldades = Object.values(Dificuldade);
  subtemas = Object.values(Subtema);
  temas = Object.values(Tema);

  message: string = '';
  resposta: string = ''; // Adiciona esta variável para armazenar a resposta

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

  mostrarGabarito: boolean = false; // Adiciona esta variável para controlar a exibição do gabarito

  //selectedOption: string = ''; // Adiciona esta variável para armazenar a opção selecionada

  selectedAno: Ano | null = null;
  selectedDificuldade: Dificuldade | null = null;
  selectedTipoDeProva: TipoDeProva | null = null;
  selectedSubtema: Subtema | null = null;
  selectedTema: Tema | null = null;
  palavraChave: string = '';

  questoes: Questao[] = [];
  isFiltered = false;
  p: number = 1;

  //resposta: string;
  isRespostaCorreta: boolean = false;

  questaoDTO = new Questao();
  selectedAlternativeIndex: number = -3;

  constructor(
    private questoesService: QuestoesService,
    private filtroService: FiltroService
  ) { }

  ngOnInit(): void {
  }


  onOptionChange(texto: string): void {
    this.selectedOption = texto;
    console.log('Alternativa selecionada:', texto);
  }


  responderQuestao(questao: Questao | null): void {
    if (!questao) {
      console.error('Questão atual é nula.');
      this.resposta = 'Nenhuma questão selecionada.';
      return;
    }
  
    const respostaDTO: RespostaDTO = {
      questaoId: questao.id,
      selecionarOpcao: this.selectedOption
    };
  
    this.questoesService.checkAnswer(questao.id, respostaDTO).subscribe(
      (resposta: Resposta) => {
        console.log('Resposta do backend:', resposta);
        console.log('correct:', resposta.correct);
  
        if (resposta.hasOwnProperty('correct')) {
          this.isRespostaCorreta = resposta.correct;
          this.resposta = resposta.correct ? 'Resposta correta!' : 'Resposta incorreta. Tente novamente.';
        } else {
          console.error('Resposta do backend não contém a propriedade correct.');
          this.resposta = 'Ocorreu um erro ao verificar a resposta. Por favor, tente novamente mais tarde.';
        }
      },
      (error) => {
        console.error('Erro ao verificar resposta:', error);
        this.resposta = 'Ocorreu um erro ao verificar a resposta. Por favor, tente novamente mais tarde.';
      }
    );
  }
  
exibirGabarito() {
  this.mostrarGabarito = true; // Define a variável para exibir o gabarito
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
  
    this.questoesService.filtrarQuestoes(filtros, 0, 100).subscribe(
      (questoes: Questao[]) => {
        if (questoes.length === 0) {
          if (filtros.ano && !filtros.tipoDeProva && !filtros.dificuldade && !filtros.subtema && !filtros.tema && !filtros.palavraChave) {
            this.message = 'Nenhuma questão encontrada para o ano selecionado.';
          } else if (filtros.tipoDeProva && !filtros.ano && !filtros.dificuldade && !filtros.subtema && !filtros.tema && !filtros.palavraChave) {
            this.message = 'Nenhuma questão encontrada para o tipo de prova selecionado.';
          } else if (filtros.dificuldade && !filtros.ano && !filtros.tipoDeProva && !filtros.subtema && !filtros.tema && !filtros.palavraChave) {
            this.message = 'Nenhuma questão encontrada para a dificuldade selecionada.';
          } else if (filtros.subtema && !filtros.ano && !filtros.tipoDeProva && !filtros.dificuldade && !filtros.tema && !filtros.palavraChave) {
            this.message = 'Nenhuma questão encontrada para o subtema selecionado.';
          } else if (filtros.tema && !filtros.ano && !filtros.tipoDeProva && !filtros.dificuldade && !filtros.subtema && !filtros.palavraChave) {
            this.message = 'Nenhuma questão encontrada para o tema selecionado.';
          } else if (filtros.palavraChave && !filtros.ano && !filtros.tipoDeProva && !filtros.dificuldade && !filtros.subtema && !filtros.tema) {
            this.message = 'Nenhuma questão encontrada para a palavra-chave informada.';
          } else {
            this.message = 'Nenhuma questão encontrada para os filtros selecionados.';
          }
          this.questoes = [];
          this.questaoAtual = null;
        } else {
          this.message = '';
          this.questoes = questoes;
          this.paginaAtual = 0;
          this.questaoAtual = this.questoes[this.paginaAtual];
        }
  
        this.resposta = '';
        this.mostrarGabarito = false;
      },
      (error) => {
        console.error('Erro ao filtrar questões:', error);
        this.message = 'Ocorreu um erro ao filtrar questões. Por favor, tente novamente mais tarde.';
      }
    );
  }
  
  
  

  anteriorQuestao() {
    if (this.paginaAtual > 0) {
      this.paginaAtual--;
      this.questaoAtual = this.questoes[this.paginaAtual];
      this.mostrarGabarito = false;
      this.resposta = '';
    }
  }
  
  

  proximaQuestao() {
    if (this.paginaAtual < this.questoes.length - 1) {
      this.paginaAtual++;
      this.questaoAtual = this.questoes[this.paginaAtual];
      this.mostrarGabarito = false; 
      this.resposta = ''; 
    } else {
      this.message = 'Não há mais questões disponíveis.';
    }
  }
  
  
  
}