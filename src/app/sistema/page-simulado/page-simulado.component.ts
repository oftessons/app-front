import { Component, OnInit } from '@angular/core';
import { TipoDeProva } from '../page-questoes/enums/tipoDeProva'; 
import { getDescricaoAno, getDescricaoDificuldade, getDescricaoSubtema, getDescricaoTema, getDescricaoTipoDeProva } from '../page-questoes/enums/enum-utils';
import { Ano } from '../page-questoes/enums/ano'; 
import { Dificuldade } from '../page-questoes/enums/dificuldade';
import { Subtema } from '../page-questoes/enums/subtema';
import { Tema } from '../page-questoes/enums/tema';
import { Questao } from '../page-questoes/questao'; 
import { QuestoesService } from 'src/app/services/questoes.service';
import { Filtro } from '../filtro';
import { FiltroService } from 'src/app/services/filtro.service';
import { RespostaDTO } from '../RespostaDTO';  
import { Resposta } from '../Resposta';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/login/usuario';  

declare var bootstrap: any;

@Component({
  selector: 'app-page-simulado',
  templateUrl: './page-simulado.component.html',
  styleUrls: ['./page-simulado.component.css']
})
export class PageSimuladoComponent implements OnInit {

  tempo: number = 0; // Contador de tempo em segundos
  intervalId: any; // Armazena o ID do intervalo para controlar o timer
  isSimuladoIniciado: boolean = false; // Controla se o simulado foi iniciado ou não

  questao: Questao = new Questao();
  selectedOption: string = '';

  usuario!: Usuario;

  tiposDeProva = Object.values(TipoDeProva);
  anos = Object.values(Ano);
  dificuldades = Object.values(Dificuldade);
  subtemas = Object.values(Subtema);
  temas = Object.values(Tema);

  message: string = '';
  resposta: string = ''; 

  quantidadeQuestoesSelecionada: number | null = null;

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

  mostrarGabarito: boolean = false; 

  selectedAno: Ano | null = null;
  selectedDificuldade: Dificuldade | null = null;
  selectedTipoDeProva: TipoDeProva | null = null;
  selectedSubtema: Subtema | null = null;
  selectedTema: Tema | null = null;
  palavraChave: string = '';

  questoes: Questao[] = [];
  isFiltered = false;
  p: number = 1;

  isRespostaCorreta: boolean = false;

  dados: any;
  questaoDTO = new Questao();
  selectedAlternativeIndex: number = -3;

  constructor(
    private questoesService: QuestoesService,
    private filtroService: FiltroService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    console.log('Componente inicializado');
    this.dados = this.obterDados();
    console.log('Dados:', this.dados);
  }

  obterDados() {
    // Simula a obtenção de dados
    return { exemplo: 'valor' };
  }
  


  onOptionChange(texto: string): void {
    this.selectedOption = texto;
    console.log('Alternativa selecionada:', texto);
  }

  obterPerfilUsuario() {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (data) => {
        this.usuario = data; // Armazenar os dados do perfil do usuário na variável 'usuario'
      },
      (error) => {
        console.error('Erro ao obter perfil do usuário:', error);
      }
    );
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

    const idUser = parseInt(this.usuario.id);
  
    this.questoesService.checkAnswer(questao.id, idUser, respostaDTO).subscribe(
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
    this.mostrarGabarito = true; 
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
    }
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

  confirmarSalvarSimulado(): void {
    if (this.filtroASalvar) {
      this.filtroService.salvarFiltro(this.filtroASalvar)
        .subscribe(
          response => {
            console.log('Simulado salvo com sucesso:', response);
          },
          error => {
            console.error('Erro ao salvar simulado:', error);
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

  iniciarSimulado(): void {
    if (!this.isSimuladoIniciado) {
      this.isSimuladoIniciado = true;
      this.tempo = 0;
      this.intervalId = setInterval(() => {
        this.tempo++;
      }, 1000); // Atualiza o tempo a cada segundo
    }
  }

  finalizarSimulado(): void {
    if (this.isSimuladoIniciado) {
      clearInterval(this.intervalId); // Para o contador
      this.isSimuladoIniciado = false;
      //alert(`Simulado finalizado! Tempo total: ${this.formatarTempo(this.tempo)}`);
    }
  }

  // Função para formatar o tempo decorrido (opcional)
  formatarTempo(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${this.formatarNumero(horas)}:${this.formatarNumero(minutos)}:${this.formatarNumero(segs)}`;
  }

  // Função auxiliar para formatar com dois dígitos
  formatarNumero(numero: number): string {
    return numero < 10 ? `0${numero}` : `${numero}`;
  }
}
