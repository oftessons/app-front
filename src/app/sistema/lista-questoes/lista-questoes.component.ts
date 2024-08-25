import { Component, OnInit } from '@angular/core';
import { Questao } from '../page-questoes/questao';
import { Ano } from '../page-questoes/enums/ano';
import { TipoDeProva } from '../page-questoes/enums/tipoDeProva';
import { QuestoesService } from 'src/app/services/questoes.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { QuestaoBusca } from '../questaoBusca';
import { Dificuldade } from '../page-questoes/enums/dificuldade';
import { getDescricaoTipoDeProva, getDescricaoAno } from '../page-questoes/enums/enum-utils';
import { Subtema } from '../page-questoes/enums/subtema';
import { Tema } from '../page-questoes/enums/tema';
import { Filtro } from '../filtro';
import { FiltroService } from 'src/app/services/filtro.service';

@Component({
  selector: 'app-lista-questoes',
  templateUrl: './lista-questoes.component.html',
  styleUrls: ['./lista-questoes.component.css'],
})
export class ListaQuestoesComponent implements OnInit {
  filtros: Filtro[] = [];
  tiposDeProva = Object.values(TipoDeProva);
  anos = Object.values(Ano);
  dificuldades = Object.values(Dificuldade);
  subtemas = Object.values(Subtema);
  temas = Object.values(Tema);

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

  constructor(
    private questoesService: QuestoesService,
    private filtroService: FiltroService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarFiltros();
  }

  carregarFiltros(): void {
    this.filtroService.getFiltros().subscribe(
      (filtros) => {
        this.filtros = filtros;
      },
      (error) => {
        console.error('Erro ao carregar filtros:', error);
      }
    );
  }

  editarFiltro(id: number): void {
    this.router.navigate(['/editar-filtro', id]);
  }

  getDescricaoTipoDeProva(tipoDeProva: TipoDeProva): string {
    return getDescricaoTipoDeProva(tipoDeProva);
  }

  getDescricaoAno(ano: Ano): string {
    return getDescricaoAno(ano);
  }

  buscarQuestoes(): void {
    const filtros: any = {};
  
    if (this.selectedAno) {
      filtros.ano = this.selectedAno; // Enviar a string do ano
    }
    if (this.selectedTipoDeProva) {
      filtros.tipoDeProva = this.selectedTipoDeProva;
    }
  
    if (Object.keys(filtros).length === 0) {
      this.message = 'Por favor, selecione pelo menos um filtro.';
      return;
    }
  
    this.questoesService.consultarQuestao(filtros).subscribe(
      (questoes: Questao[]) => {
        this.questoes = questoes;
  
        if (questoes.length === 0) {
          if (filtros.ano && !filtros.tipoDeProva) {
            this.message = 'Nenhuma questão encontrada para o ano selecionado.';
          } else if (filtros.tipoDeProva && !filtros.ano) {
            this.message =
              'Nenhuma questão encontrada para o tipo de prova selecionado.';
          } else {
            this.message =
              'Nenhuma questão encontrada com os filtros aplicados.';
          }
        } else {
          this.message = '';
        }
      },
      (error) => {
        console.error('Erro ao buscar questões:', error);
        this.message = 'Erro ao buscar questões. Por favor, tente novamente.';
      }
    );
  }
  
  

  consultarProjeto() {}

  deletarProjeto() {}

  // Métodos para abrir e fechar o modal
  preparaDelecao(questao: Questao): void {
    console.log('Preparando deleção da questão:', questao);
    this.questaoSelecionada = questao;
    this.modalTitle = 'Confirmação de Exclusão';
    this.modalType = 'deleteQuestao';
    this.modalAberto = true;
    console.log('Modal aberto:', this.modalAberto);
  }

  preparaDelecaoFiltro(filtro: Filtro): void {
    console.log('Preparando deleção do filtro:', filtro);
    this.filtroSelecionado = filtro;
    this.modalTitle = 'Confirmação de Exclusão';
    this.modalType = 'deleteFiltro';
    this.modalAberto = true;
    console.log('Modal aberto:', this.modalAberto);
  }

  fecharModal() {
    this.modalAberto = false;
  }

  confirmarAcao(): void {
    console.log('Confirmando ação para o tipo:', this.modalType);
    if (this.modalType === 'deleteQuestao') {
      this.deletarQuestao();
    } else if (this.modalType === 'deleteFiltro') {
      this.deletarFiltro(this.filtroSelecionado.id);
    }
  }

  deletarQuestao() {
    this.questoesService.deletar(this.questaoSelecionada).subscribe(
      (response) => {
        this.mensagemSucesso = 'Questão deletada com sucesso!';
        this.ngOnInit();
        this.fecharModal();
      },
      (erro) => (this.mensagemErro = 'Ocorreu um erro ao deletar a questão.')
    );
  }

  deletarFiltro(id: number): void {
    this.filtroService.deletarFiltro(id)
      .subscribe(
        () => {
          this.carregarFiltros();
          this.fecharModal();
        },
        error => {
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
}
