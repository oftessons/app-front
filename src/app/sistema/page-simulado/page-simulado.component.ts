import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { TipoDeProva } from '../page-questoes/enums/tipoDeProva';
import {
  getDescricaoAno,
  getDescricaoDificuldade,
  getDescricaoSubtema,
  getDescricaoTema,
  getDescricaoTipoDeProva,
  getDescricaoQuantidadeDeQuestoesSelecionadas,
  getDescricaoRespostasSimulado
} from '../page-questoes/enums/enum-utils';
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
import { Simulado } from '../simulado';
import { SimuladoService } from 'src/app/services/simulado.service';
import { QuantidadeDeQuestoesSelecionadas } from '../page-questoes/enums/quant-questoes';
import { RespostasSimulado } from '../page-questoes/enums/resp-simu';
import Chart from 'chart.js';
import { Router } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-page-simulado',
  templateUrl: './page-simulado.component.html',
  styleUrls: ['./page-simulado.component.css'],
})
export class PageSimuladoComponent implements OnInit {
  nomeSimulado: string = '';
  descricaoSimulado: string = '';

  mensagemDeAviso!: string;

  tempo: number = 0; // Contador de tempo em segundos
  intervalId: any; // Armazena o ID do intervalo para controlar o timer
  isSimuladoIniciado: boolean = false; // Controla se o simulado foi iniciado ou não

  questao: Questao = new Questao();
  idsQuestoes: number[] = [];
  selectedOption: string = '';

  usuario!: Usuario;
  usuarioId!: number;

  @ViewChild('confirmacaoModalRef', { static: false })
  confirmacaoModal!: ElementRef;

  nomeFiltro: string = '';
  descricaoFiltro: string = '';

  tiposDeProva = Object.values(TipoDeProva);
  anos = Object.values(Ano);
  dificuldades = Object.values(Dificuldade);
  subtemas = Object.values(Subtema);
  temas = Object.values(Tema);
  quantidadeDeQuestoesSelecionadas = Object.values(QuantidadeDeQuestoesSelecionadas);
  respostasSimulado = Object.values(RespostasSimulado);

  message: string = '';
  resposta: string = '';

  respostas: any[] = []; // Array que armazena as respostas do usuário
  respostasList: any[] = [];
  chart: any;

  questaoAtual: Questao | null = null;
  paginaAtual: number = 0;
  filtros: any = {
    ano: null,
    dificuldade: null,
    tipoDeProva: null,
    subtema: null,
    tema: null,
    palavraChave: null,
    quantidadeDeQuestoesSelecionadas: null,
    respostasSimulado: null,
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
  selectedQuantidadeDeQuestoesSelecionadas: QuantidadeDeQuestoesSelecionadas | null = null;
  selectedRespostasSimulado: RespostasSimulado | null = null;

  questoes: Questao[] = [];
  isFiltered = false;
  p: number = 1;
  mensagemSucesso: string = '';

  isRespostaCorreta: boolean = false;

  dados: any;
  questaoDTO = new Questao();
  selectedAlternativeIndex: number = -3;

  simuladoIniciado = false;
  simuladoFinalizado = false;
  tempoTotal: number = 0;

  tiposDeProvaDescricoes: string[] = [];
  anosDescricoes: string[] = [];
  dificuldadesDescricoes: string[] = [];
  subtemasDescricoes: string[] = [];
  temasDescricoes: string[] = [];
  quantidadeDeQuestoesSelecionadasDescricoes: string[] = [];
  respostasSimuladoDescricao: string[] = [];


  constructor(
    private questoesService: QuestoesService,
    private filtroService: FiltroService,
    private simuladoService: SimuladoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('Componente inicializado');
    this.dados = this.obterDados();
    console.log('Dados:', this.dados);
    this.obterPerfilUsuario();
    this.tiposDeProvaDescricoes = this.tiposDeProva.map(tipoDeProva => this.getDescricaoTipoDeProva(tipoDeProva));
    this.anosDescricoes = this.anos.map(ano => this.getDescricaoAno(ano));
    this.dificuldadesDescricoes = this.dificuldades.map(dificuldade => this.getDescricaoDificuldade(dificuldade));
    this.subtemasDescricoes = this.subtemas.map(subtema => this.getDescricaoSubtema(subtema));
    this.temasDescricoes = this.temas.map(tema => this.getDescricaoTema(tema));
    this.quantidadeDeQuestoesSelecionadasDescricoes = this.quantidadeDeQuestoesSelecionadas.map(
      quantidadeDeQuestoesSelecionadas => this.getDescricaoQuantidadeDeQuestoesSelecionadas(quantidadeDeQuestoesSelecionadas));
    this.respostasSimuladoDescricao = this.respostasSimulado.map(
      respostasSimulado => this.getDescricaoRespostasSimulado(respostasSimulado));
  }

  finalizarSimulado() {
    console.log('Respostas enviadas:', this.respostasList);
    this.simuladoService.finalizarSimulado(this.usuarioId, this.respostasList).subscribe((resultado) => {
      console.log('Resultado da API:', resultado);
      this.gerarGrafico(resultado.acertos, resultado.erros);
    });
    this.simuladoIniciado = false;
    this.simuladoFinalizado = true;
    this.tempoTotal = this.tempo; // Tempo total em segundos
  }

  gerarGrafico(acertos: number, erros: number) {
    console.log('Acertos:', acertos, 'Erros:', erros);  // Verifique os valores aqui
    if (this.chart) {
      this.chart.destroy();
    }
    this.chart = new Chart('graficoBarras', {
      type: 'bar',
      data: {
        labels: ['Acertos', 'Erros'],
        datasets: [{
          label: 'Quantidade',
          data: [acertos, erros],
          backgroundColor: ['#4CAF50', '#F44336'],
        }]
      },
      options: {
        responsive: true,
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              precision: 0
            }
          }]
        }
      }
    });
  }

  obterDados() {
    // Simula a obtenção de dados
    return { exemplo: 'valor' };
  }

  onOptionChange(alternativaTexto: string) {
    this.selectedOption = alternativaTexto;
    if (this.questaoAtual) {
      this.respostas[this.paginaAtual] = alternativaTexto;
    }
  }

  getLetraAlternativa(alternativaTexto: string): string {
    if (this.questaoAtual) {
      const index = this.questaoAtual.alternativas.findIndex(alt => alt.texto === alternativaTexto);
      return String.fromCharCode(65 + index);
    }
    return '';
  }



  obterPerfilUsuario() {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (data) => {
        this.usuario = data; // Armazenar os dados do perfil do usuário na variável 'usuario'
        this.usuarioId = parseInt(this.usuario.id);
      },
      (error) => {
        console.error('Erro ao obter perfil do usuário:', error);
      }
    );
  }

  responderQuestao(questao: Questao | null): void {
    if (this.selectedOption) {
      this.mensagemDeAviso = `Você marcou a letra ${this.getLetraAlternativa(this.selectedOption)} como resposta, continue seus estudos e vá para a próxima questão 😃.`;
      // Armazena a resposta para a questão atual
      this.respostas[this.paginaAtual] = this.selectedOption;
    } else {
      this.mensagemDeAviso = 'Por favor, selecione uma alternativa antes de responder.';
    }

    if (!questao) {
      console.error('Questão atual é nula.');
      this.resposta = 'Nenhuma questão selecionada.';
      return;
    }
  
    const respostaDTO: RespostaDTO = {
      questaoId: questao.id,
      selecionarOpcao: this.selectedOption,
    };
  
    this.questoesService
      .checkAnswer(questao.id, this.usuarioId, respostaDTO)
      .subscribe(
        (resposta: Resposta) => {
          console.log('Resposta do backend:', resposta);
          if (resposta.correct) {
            this.isRespostaCorreta = resposta.correct;
            this.resposta = 'Resposta correta!';
          } else {
            this.resposta = 'Resposta incorreta. Tente novamente.';
          }
  
          // Adicionar a resposta à lista de respostas do simulado
          this.respostasList.push({
            questaoId: questao.id,
            selecionarOpcao: this.selectedOption,
            correta: resposta.correct
          });
        },
        (error) => {
          console.error('Erro ao verificar resposta:', error);
          this.resposta =
            'Ocorreu um erro ao verificar a resposta. Por favor, tente novamente mais tarde.';
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

  getDescricaoQuantidadeDeQuestoesSelecionadas(
    quantidadeDeQuestoesSelecionadas: QuantidadeDeQuestoesSelecionadas): string {
    return  getDescricaoQuantidadeDeQuestoesSelecionadas(quantidadeDeQuestoesSelecionadas);
  }

  getDescricaoRespostasSimulado(respostasSimulado: RespostasSimulado): string {
    return getDescricaoRespostasSimulado(respostasSimulado);
  }

  LimparFiltro() {
    this.selectedAno = null;
    this.selectedDificuldade = null;
    this.selectedTipoDeProva = null;
    this.selectedSubtema = null;
    this.selectedTema = null;
    this.selectedQuantidadeDeQuestoesSelecionadas = null;
    this.palavraChave = '';
    this.filtros = {
      ano: null,
      dificuldade: null,
      tipoDeProva: null,
      subtema: null,
      tema: null,
      palavraChave: null,
    };
    this.paginaAtual = 0;
  }

  filtrarQuestoes(): void {
    const filtros: any = {};

    if (this.selectedAno) {
      const anoSelecionado = this.anos.find(
        (ano) => this.getDescricaoAno(ano) === this.selectedAno
      );
      if (anoSelecionado) {
        filtros.ano = anoSelecionado;
      }
    }
    if (this.selectedDificuldade) {
      const dificuldadeSelecionada = this.dificuldades.find(
        (dificuldade) =>
          this.getDescricaoDificuldade(dificuldade) === this.selectedDificuldade
      );
      if (dificuldadeSelecionada) {
        filtros.dificuldade = dificuldadeSelecionada;
      }
    }
    if (this.selectedTipoDeProva) {
      const tipoDeProvaSelecionado = this.tiposDeProva.find(
        (tipoDeProva) =>
          this.getDescricaoTipoDeProva(tipoDeProva) === this.selectedTipoDeProva
      );
      if (tipoDeProvaSelecionado) {
        filtros.tipoDeProva = tipoDeProvaSelecionado;
      }
    }
    if (this.selectedRespostasSimulado) {
      const respostaSimuladoSelecionado = this.respostasSimulado.find(
        (respostaSimulado) =>
          this.getDescricaoRespostasSimulado(respostaSimulado) === this.selectedRespostasSimulado
      );
      if (respostaSimuladoSelecionado) {
        filtros.questaoRespondida = respostaSimuladoSelecionado;
      }
    }
    if (this.selectedSubtema) {
      const subtemaSelecionado = this.subtemas.find(
        (subtema) => this.getDescricaoSubtema(subtema) === this.selectedSubtema
      );
      if (subtemaSelecionado) {
        filtros.subtema = subtemaSelecionado;
      }
    }
    if (this.selectedTema) {
      const temaSelecionado = this.temas.find(
        (tema) => this.getDescricaoTema(tema) === this.selectedTema
      );
      if (temaSelecionado) {
        filtros.tema = temaSelecionado;
      }
    }
    if (this.quantidadeDeQuestoesSelecionadas) {
      const quantidadeSelecionada = this.quantidadeDeQuestoesSelecionadas.find(
        (quantidadeDeQuestoesSelecionadas) => getDescricaoQuantidadeDeQuestoesSelecionadas(quantidadeDeQuestoesSelecionadas)
         === this.selectedQuantidadeDeQuestoesSelecionadas
      );
      if (quantidadeSelecionada) {
        filtros.quantidadeDeQuestoesSelecionadas = quantidadeSelecionada;
      }
    }
    // Verificar se a palavra-chave está preenchida
    if (this.palavraChave && this.palavraChave.trim() !== '') {
      filtros.palavraChave = this.palavraChave.trim();
    } else {
      console.error('Quantidade de questões selecionada é inválida:', this.quantidadeDeQuestoesSelecionadas);
    }

    if (Object.keys(filtros).length === 0) {
      this.message = 'Por favor, selecione pelo menos um filtro.';
      this.questoes = [];
      this.idsQuestoes = [];
      return;
    }

    this.questoesService
      .filtrarSimulados(this.usuarioId, filtros, 0, 100)
      .subscribe(
        (questoes: Questao[]) => {
          if (questoes.length === 0) {
            if (filtros.ano && !filtros.tipoDeProva && !filtros.dificuldade && !filtros.subtema && !filtros.tema && !filtros.palavraChave && !filtros.qtdQuestoes) {
              this.message = 'Nenhuma questão encontrada para o ano selecionado.';
            } else if (filtros.tipoDeProva && !filtros.ano && !filtros.dificuldade && !filtros.subtema && !filtros.tema && !filtros.palavraChave && !filtros.qtdQuestoes) {
              this.message = 'Nenhuma questão encontrada para o tipo de prova selecionado.';
            } else if (filtros.dificuldade && !filtros.ano && !filtros.tipoDeProva && !filtros.subtema && !filtros.tema && !filtros.palavraChave && !filtros.qtdQuestoes) {
              this.message = 'Nenhuma questão encontrada para a dificuldade selecionada.';
            } else if (filtros.subtema && !filtros.ano && !filtros.tipoDeProva && !filtros.dificuldade && !filtros.tema && !filtros.palavraChave && !filtros.qtdQuestoes) {
              this.message = 'Nenhuma questão encontrada para o subtema selecionado.';
            } else if (filtros.tema && !filtros.ano && !filtros.tipoDeProva && !filtros.dificuldade && !filtros.subtema && !filtros.palavraChave && !filtros.qtdQuestoes) {
              this.message = 'Nenhuma questão encontrada para o tema selecionado.';
            } else if (filtros.palavraChave && !filtros.ano && !filtros.tipoDeProva && !filtros.dificuldade && !filtros.subtema && !filtros.tema && !filtros.qtdQuestoes) {
              this.message = 'Nenhuma questão encontrada para a palavra-chave informada.';
            } else if (filtros.qtdQuestoes && !filtros.ano && !filtros.tipoDeProva && !filtros.dificuldade && !filtros.subtema && !filtros.tema && !filtros.palavraChave) {
              this.message = 'Nenhuma questão encontrada para a quantidade de questões selecionada.';
            } else {
              this.message = 'Nenhuma questão encontrada para os filtros selecionados.';
            }
            this.questoes = [];
            this.idsQuestoes = [];
            this.questaoAtual = null;
          } else {
            this.message = '';
            this.questoes = questoes;
            this.idsQuestoes = questoes.map((q) => q.id);
            this.paginaAtual = 0;
            this.questaoAtual = this.questoes[this.paginaAtual];
          }
          this.resposta = '';
          this.mostrarGabarito = false;
        },
        (error) => {
          console.error('Erro ao filtrar questões:', error);
          this.message =
            'Ocorreu um erro ao filtrar questões. Por favor, tente novamente mais tarde.';
          this.idsQuestoes = [];
        }
      );
  }
  
  carregarRespostaAnterior() {
    const respostaAnterior = this.respostas[this.paginaAtual];
    if (respostaAnterior) {
      this.selectedOption = respostaAnterior;
      this.mensagemDeAviso = `Você respondeu anteriormente a letra ${this.getLetraAlternativa(respostaAnterior)}.`; // Exibe mensagem apenas ao voltar
    } else {
      this.selectedOption = '';
    }
  }

  anteriorQuestao() {
    this.mensagemDeAviso = '';
    if (this.paginaAtual > 0) {
      this.paginaAtual--;
      this.questaoAtual = this.questoes[this.paginaAtual];
      this.mostrarGabarito = false;
      this.carregarRespostaAnterior(); // Chame a função para carregar a resposta anterior
    }
  }
  
  proximaQuestao() {
    if (this.paginaAtual < this.questoes.length - 1) {
      this.paginaAtual++;
      this.questaoAtual = this.questoes[this.paginaAtual];
      this.mostrarGabarito = false;
      this.resposta = '';
      this.selectedOption = '';
      this.mensagemDeAviso = ''; // Limpa a mensagem ao clicar em "próxima"
    }
  }

  confirmarSalvarSimulado(
    nomeSimulado: string,
    descricaoSimulado: string
  ): void {
    const simulado: Simulado = {
      nomeSimulado: nomeSimulado,
      assunto: descricaoSimulado,
      quantidadeDeQuestoesSelecionadas: this.selectedQuantidadeDeQuestoesSelecionadas,
      ano: this.selectedAno,
      tema: this.selectedTema,
      dificuldade: this.selectedDificuldade,
      tipoDeProva: this.selectedTipoDeProva,
      subtema: this.selectedSubtema,
      questaoIds: this.idsQuestoes,
    };

    this.simuladoService.cadastrarSimulado(this.usuarioId, simulado).subscribe(
      (response) => {
        // Exibir mensagem de sucesso
        this.mensagemSucesso = 'Seu simulado foi cadastrado com sucesso!';

        // Esconder a mensagem após 5 segundos
        setTimeout(() => {
          this.mensagemSucesso = '';
        }, 5000);

        // Fecha o modal automaticamente após sucesso
        const modalElement = document.getElementById('confirmacaoModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement!);
        modalInstance.hide(); // Fecha o modal
      },
      (error) => {
        // Exibir mensagem de erro
        alert('Erro ao cadastrar o simulado. Por favor, tente novamente.');
        console.error('Erro ao cadastrar o simulado:', error);
      }
    );
  }

  abrirModal(): void {
    const modalElement = document.getElementById('confirmacaoModal');
    const modal = new bootstrap.Modal(modalElement!);
    modal.show();

    modalElement?.addEventListener('hidden.bs.modal', () => {
      this.fecharCardConfirmacao();
    });
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
    this.simuladoIniciado = true;
    this.simuladoFinalizado = false;
  }

  // Função para formatar o tempo decorrido (opcional)
  formatarTempo(segundos: number): string {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${this.formatarNumero(horas)}:${this.formatarNumero(
      minutos
    )}:${this.formatarNumero(segs)}`;
  }

  // Função auxiliar para formatar com dois dígitos
  formatarNumero(numero: number): string {
    return numero < 10 ? `0${numero}` : `${numero}`;
  }

  backHome() {
    this.router.navigate(['usuario/dashboard']);
  }
}