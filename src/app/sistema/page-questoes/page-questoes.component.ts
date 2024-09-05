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
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/login/usuario';

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
  usuario!: Usuario;
  respostaVerificada: boolean = false;

  respostaFoiSubmetida: boolean = false; 

  tiposDeProva = Object.values(TipoDeProva);
  anos = Object.values(Ano);
  dificuldades = Object.values(Dificuldade);
  subtemas = Object.values(Subtema);
  temas = Object.values(Tema);

  respostaCorreta: string | null = null;
  respostaErrada: string | null = null;
  isRespostaCorreta: boolean = false;
  
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
  //isRespostaCorreta: boolean = false;

  questaoDTO = new Questao();
  selectedAlternativeIndex: number = -3;

  constructor(
    private questoesService: QuestoesService,
    private filtroService: FiltroService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.obterPerfilUsuario();
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
  
    if (this.selectedOption) {
      const alternativaSelecionada = questao.alternativas.find(a => a.texto === this.selectedOption);
  
      if (alternativaSelecionada) {
        const respostaDTO: RespostaDTO = {
          questaoId: questao.id,
          selecionarOpcao: this.selectedOption
        };
  
        const idUser = parseInt(this.usuario.id);
  
        this.questoesService.checkAnswer(questao.id, idUser, respostaDTO).subscribe(
          (resposta: Resposta) => {
            this.isRespostaCorreta = resposta.correct;
            this.respostaVerificada = true; // Só permite mostrar o fundo após verificar a resposta
            this.resposta = resposta.correct ? 'Resposta correta!' : 'Resposta incorreta. Tente novamente.';
          },
          (error) => {
            console.error('Erro ao verificar resposta:', error);
            this.resposta = 'Ocorreu um erro ao verificar a resposta. Por favor, tente novamente mais tarde.';
          }
        );
      }
    }
  }
  
  
  
  
  
  
  
  
  
  
  
  

  exibirGabarito() {
    this.mostrarGabarito = true;
  
    // Atualizar o estado das respostas corretas e erradas
    if (this.questaoAtual) {
      this.respostaCorreta = this.questaoAtual.alternativas.find(a => a.texto === this.respostaCorreta)?.texto || '';
      this.respostaErrada = this.questaoAtual.alternativas.find(a => a.texto === this.respostaErrada)?.texto || '';
    }
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
      
      // Resetar o estado para evitar fundo nas alternativas
      this.selectedOption = '';  // Limpar a seleção atual
      this.resposta = ''; // Limpar a resposta exibida
      this.respostaCorreta = ''; // Limpar a alternativa correta
      this.respostaErrada = ''; // Limpar a alternativa errada
      this.mostrarGabarito = false; // Resetar a exibição do gabarito
      this.isRespostaCorreta = false; // Limpar o estado da resposta correta
      this.respostaVerificada = false; // Limpar o estado da resposta verificada
  
    } else {
      this.message = 'Não há mais questões disponíveis.';
    }
  }
  
  

  

  proximaQuestao() {
    if (this.paginaAtual < this.questoes.length - 1) {
      this.paginaAtual++;
      this.questaoAtual = this.questoes[this.paginaAtual];
      
      // Resetar o estado para evitar fundo nas alternativas
      this.selectedOption = '';  // Limpar a seleção atual
      this.resposta = ''; // Limpar a resposta exibida
      this.respostaCorreta = ''; // Limpar a alternativa correta
      this.respostaErrada = ''; // Limpar a alternativa errada
      this.mostrarGabarito = false; // Resetar a exibição do gabarito
      this.isRespostaCorreta = false; // Limpar o estado da resposta correta
      this.respostaVerificada = false; // Limpar o estado da resposta verificada
  
    } else {
      this.message = 'Não há mais questões disponíveis.';
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