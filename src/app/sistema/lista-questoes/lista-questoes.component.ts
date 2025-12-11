import { Component, OnInit } from '@angular/core';
import { Questao } from '../page-questoes/questao';
import { Ano } from '../page-questoes/enums/ano';
import { TipoDeProva } from '../page-questoes/enums/tipoDeProva';
import { QuestoesService } from 'src/app/services/questoes.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { QuestaoBusca } from '../questaoBusca';
import { Dificuldade } from '../page-questoes/enums/dificuldade';
import {
  getDescricaoTipoDeProva,
  getDescricaoAno,
} from '../page-questoes/enums/enum-utils';
import { Subtema } from '../page-questoes/enums/subtema';
import { Tema } from '../page-questoes/enums/tema';
import { Filtro } from '../filtro';
import { FiltroService } from 'src/app/services/filtro.service';
import { Usuario } from 'src/app/login/usuario';
import { Permissao } from 'src/app/login/Permissao';

import { Aula } from 'src/app/sistema/painel-de-aulas/aula';
import { AulasService } from 'src/app/services/aulas.service';
import { Categoria } from '../painel-de-aulas/enums/categoria';
import { CategoriaDescricoes } from '../painel-de-aulas/enums/categoria-descricao';
import { NavigateService } from 'src/app/services/navigate.service';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';

@Component({
  selector: 'app-lista-questoes',
  templateUrl: './lista-questoes.component.html',
  styleUrls: ['./lista-questoes.component.css'],
})
export class ListaQuestoesComponent implements OnInit {
  usuario: Usuario | null = null;
  Permissao = Permissao;
  questaoId!: number;
  filtros: Filtro[] = [];
  tiposDeProva = Object.values(TipoDeProva);
  anos = Object.values(Ano);
  dificuldades = Object.values(Dificuldade);
  subtemas = Object.values(Subtema);
  temas = Object.values(Tema);
  temasFormatado: string[] = Object.values(Tema).map(tema => TemaDescricoes[tema]);

  aulaId!: number;
  aulas: any[] = [];
  pageAula: number = 1;
  pageSizeAula: number = 5;
  mensagemAula: string = '';
  mensagemSucessoAula: string = '';

  questoes: Questao[] = [];
  selectedAno?: Ano;
  selectedTipoDeProva?: TipoDeProva;
  listaDasQuestoes!: QuestaoBusca[];
  projetoSelecionado!: QuestaoBusca[];
  page: number = 1;
  pageSize: number = 5;
  message: string = '';
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  paginaAtual: number = 0;

  questaoSelecionada!: Questao;
  filtroSelecionado!: Filtro;
  modalAberto: boolean = false;

  modalTitle: string = '';
  modalType: string = '';

  aulaDTO = new Aula();
  categoria: string[] = Object.values(Categoria);
  categoriaFormatada: string[] = Object.values(Categoria).map(categoria => CategoriaDescricoes[categoria]);
  categoriaSelecionada: Categoria | null = null;
  carregando: boolean = false;

  modoAtribuicao: 'ID' | 'TEMA' = 'ID';
  atribuicaoId?: number;
  atribuicaoTema?: string;
  nomeProfessor: string = '';
  fotoProfessorFile: File | null = null;
  carregandoAtribuicao: boolean = false;
  mensagemSucessoAtribuicao: string = '';
  mensagemErroAtribuicao: string = '';

  constructor(
    private questoesService: QuestoesService,
    private filtroService: FiltroService,
    private authService: AuthService,
    private router: Router,
    private aulasService: AulasService,
    private navigateService: NavigateService
  ) { }

  ngOnInit(): void {
    this.carregarFiltros();
    this.usuario = this.authService.getUsuarioAutenticado();
  }

  carregarFiltros(): void { }


  navegarParaEdicao(id: number): void {
    this.navigateService.navigateTo(`/usuario/cadastro-questao/${id}`, '/usuario/buscar-questão');
  }

  editarFiltro(id: number): void {
    this.filtroService.getFiltroById(id).subscribe(
      (data) => {
        this.router.navigate(['/usuario/questoes'], {
          state: { questao: data },
        });
      },
      (error) => {
        alert('Erro ao obter filtro por ID');
      }
    );
  }

  buscarQuestoes(): void {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (usuario) => {
        this.carregando = true;
        this.message = '';
        this.mensagemSucesso = '';
        this.questoes = [];
        const idUser = parseInt(usuario.id);
        if (this.questaoId) {
          this.questoesService
            .buscarQuestaoPorId(idUser, this.questaoId)
            .subscribe(
              (questao: Questao | null) => {
                if (!questao) {
                  this.message = 'Nenhuma questão encontrada com o ID informado.';
                  this.questoes = [];
                } else {
                  this.questoes = [questao];
                  this.mensagemSucesso = 'Questão encontrada com sucesso!';
                  this.message = '';
                }
                this.carregando = false;
              },
              (error) => {
                this.message = 'Erro ao buscar questão. Por favor, tente novamente.';
                this.carregando = false;
              }
            );
        } else {
          this.message = 'Por favor, insira o ID da questão.';
        }
      },
      (error) => {
        this.message = 'Erro ao obter usuário autenticado. Por favor, tente novamente.';
        this.carregando = false;
      }
    );
  }

  preparaDelecao(questao: Questao): void {
    this.questaoSelecionada = questao;
    this.modalTitle = 'Confirmação de Exclusão';
    this.modalType = 'deleteQuestao';
    this.modalAberto = true;
  }

  preparaDelecaoFiltro(filtro: Filtro): void {
    this.filtroSelecionado = filtro;
    this.modalTitle = 'Confirmação de Exclusão';
    this.modalType = 'deleteFiltro';
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
  }

  confirmarAcao(): void {
    if (this.modalType === 'deleteQuestao') {
      this.deletarQuestao();
    } else if (this.modalType === 'deleteFiltro') {
      this.deletarFiltro(this.filtroSelecionado.id);
    }
    else if (this.modalType === 'deleteAula') {
      this.deletarAula();
    }
  }

  deletarQuestao() {
    this.questoesService.deletar(this.questaoSelecionada).subscribe(
      (response) => {
        this.mensagemSucesso = 'Questão deletada com sucesso!';
        this.questoes = [];
        this.message = 'A questão foi deletada. Busque outra.';
        this.fecharModal();
      },
      (erro) => {
        this.mensagemErro = 'Ocorreu um erro ao deletar a questão.';
      }
    );
  }

  deletarFiltro(id: number): void {
    this.filtroService.deletarFiltro(id).subscribe(
      () => {
        this.carregarFiltros();
        this.fecharModal();
      },
      (error) => {
        console.error('Erro ao deletar filtro:', error);
      }
    );
  }

  limparFiltros() {
    this.selectedAno = undefined;
    this.selectedTipoDeProva = undefined;
    this.questoes = [];
    this.message = '';
  }

  buscarAulas(): void {
    if (this.categoriaSelecionada) {
      const categoriaDescricao = CategoriaDescricoes[this.getCategoriaFromDescricao(this.categoriaSelecionada)!];
      this.mensagemAula = '';
      this.mensagemSucessoAula = '';

      this.aulasService.listarAulasPorCategoria(categoriaDescricao).subscribe(
        (response: Aula[]) => {
          this.aulas = response;
          if (response.length === 0) {
            this.mensagemAula = 'Nenhuma aula encontrada para a categoria selecionada.';
          } else {
            this.mensagemSucessoAula = 'Aulas encontradas com sucesso!';
          }
        },
        (error) => {
          this.mensagemAula = 'Erro ao buscar aulas. Por favor, tente novamente.';
          this.mensagemSucessoAula = '';
          console.error('Erro ao buscar aulas:', error);
        }
      );
    } else {
      this.mensagemAula = 'Por favor, selecione uma categoria.';
    }
  }

  limparFiltrosAula(): void {
    this.categoriaSelecionada = null;
    this.aulas = [];
    this.mensagemSucessoAula = '';
    this.mensagemAula = '';
  }

  aulaSelecionada: any;

  preparaDelecaoAula(aula: any): void {
    this.aulaSelecionada = aula;
    this.modalTitle = 'Confirmação de Exclusão de Aula';
    this.modalType = 'deleteAula';
    this.modalAberto = true;
  }

  deletarAula() {
    if (this.aulaSelecionada) {
      this.aulasService.deletar(this.aulaSelecionada.id).subscribe(
        (response) => {
          this.mensagemSucessoAula = 'Aula deletada com sucesso!';
          this.aulas = this.aulas.filter(
            (aula) => aula.id !== this.aulaSelecionada!.id
          );
          this.fecharModal();
        },
        (erro) => {
          this.mensagemAula = 'Ocorreu um erro ao deletar a aula.';
        }
      );
    }
  }

  editarAula(id: number): void {
    this.router.navigate(['/usuario/cadastro-aulas', id]);
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.fotoProfessorFile = file;
    }
  }

  atribuirComentador(): void {
    if (this.modoAtribuicao === 'ID' && !this.atribuicaoId) {
      this.mensagemErroAtribuicao = 'Informe o ID da questão.';
      return;
    }

    if (this.modoAtribuicao === 'TEMA' && !this.atribuicaoTema) {
      this.mensagemErroAtribuicao = 'Selecione um tema.';
      return;
    }

    this.carregandoAtribuicao = true;
    this.mensagemErroAtribuicao = '';
    this.mensagemSucessoAtribuicao = '';

    const formData = new FormData();
    formData.append('nomeProfessor', this.nomeProfessor);
    if (this.fotoProfessorFile) {
      formData.append('file', this.fotoProfessorFile);
    }

    if (this.modoAtribuicao === 'ID' && this.atribuicaoId) {
      formData.append('idQuestao', this.atribuicaoId.toString());
    } else if (this.modoAtribuicao === 'TEMA' && this.atribuicaoTema) {
      formData.append('tema', this.getTemaFromDescricao(this.atribuicaoTema) || '');
    }

    this.questoesService.atribuirComentador(formData).subscribe(
      (response: any) => {
        const msg = typeof response === 'string' ? response : (response.message || 'Atualizado com sucesso!');
        this.mensagemSucessoAtribuicao = msg;
        this.carregandoAtribuicao = false;
        this.limparAtribuicao(false);
      },
      (error) => {
        console.log("Error name" + error);
        this.mensagemErroAtribuicao = error.error?.message || 'Erro ao atribuir comentador.';
        this.carregandoAtribuicao = false;
      }
    );
  }

  limparAtribuicao(limparMsg: boolean = true): void {
    this.atribuicaoId = undefined;
    this.atribuicaoTema = undefined;
    this.nomeProfessor = '';
    this.fotoProfessorFile = null;
    if (limparMsg) {
      this.mensagemSucessoAtribuicao = '';
      this.mensagemErroAtribuicao = '';
    }
  }

  getTemaFromDescricao(descricao: string): Tema | undefined {
    const entry = Object.entries(TemaDescricoes).find(([tema, desc]) => desc === descricao);
    return entry ? (entry[0] as Tema) : undefined;
  }

  getCategoriaFromDescricao(descricao: string): Categoria | undefined {
    const entry = Object.entries(CategoriaDescricoes).find(([categoria, desc]) => desc === descricao);
    return entry ? (entry[0] as Categoria) : undefined;
  }

}