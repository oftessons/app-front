import { Component, OnInit } from '@angular/core';
import { Questao } from '../page-questoes/questao';
import { Ano } from '../page-questoes/enums/ano';
import { TipoDeProva } from '../page-questoes/enums/tipoDeProva';
import { QuestoesService } from 'src/app/services/questoes.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { QuestaoBusca } from '../questaoBusca';
import { Dificuldade } from '../page-questoes/enums/dificuldade';
import { getDescricaoTipoDeProva, getDescricaoAno, getDescricaoDificuldade, getDescricaoSubtema, getDescricaoTema } from '../page-questoes/enums/enum-utils';
import { Subtema } from '../page-questoes/enums/subtema';
import { Tema } from '../page-questoes/enums/tema';
import { Filtro } from '../filtro';
import { FiltroService } from 'src/app/services/filtro.service';

@Component({
  selector: 'app-lista-questoes',
  templateUrl: './lista-questoes.component.html',
  styleUrls: ['./lista-questoes.component.css']
})
export class ListaQuestoesComponent implements OnInit {

  filtros: Filtro[] = [];

  tiposDeProva = Object.values(TipoDeProva);
  anos = Object.values(Ano);
  dificuldades = Object.values(Dificuldade);
  subtemas = Object.values(Subtema);
  temas = Object.values(Tema);
  
  questoes: Questao[] = [];
  selectedAno!: Ano;
  selectedTipoDeProva!: TipoDeProva;
  listaDasQuestoes!: QuestaoBusca[];
  projetoSelecionado!: QuestaoBusca[];
  page: number = 1;
  pageSize: number = 5;
  message: string = '';
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  questaoSelecionada!: Questao;
  modalAberto: boolean = false;

  constructor(
    private questoesService: QuestoesService,
    private filtroService: FiltroService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obterTodasQuestoes();
    this.anos = Object.values(Ano);
    this.tiposDeProva = Object.values(TipoDeProva);
    this.carregarFiltros();
  }

  carregarFiltros(): void {
    this.filtroService.getFiltros()
      .subscribe(
        filtros => {
          this.filtros = filtros;
        },
        error => {
          console.error('Erro ao carregar filtros:', error);
          // Tratar erro aqui se necessário
        }
      );
  }

  deletarFiltro(id: number): void {
    this.filtroService.deletarFiltro(id)
      .subscribe(
        () => {
          // Após deletar com sucesso, recarregar os filtros
          this.carregarFiltros();
        },
        error => {
          console.error('Erro ao deletar filtro:', error);
          // Tratar erro aqui se necessário
        }
      );
  }

  editarFiltro(id: number): void {
    this.router.navigate(['/editar-filtro', id]); // Navega para a rota de edição
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

  buscarQuestoes(): void {
    const filtros = {
      ano: this.selectedAno,
      tipoDeProva: this.selectedTipoDeProva
    };

    this.questoesService.filtrarQuestoes(filtros).subscribe(
      (questoes: Questao[]) => {
        this.questoes = questoes;
        this.message = questoes.length === 0 ? 'Nenhuma questão encontrada com os filtros aplicados.' : '';
      },
      (error) => {
        console.error('Erro ao buscar questões:', error);
        this.message = 'Erro ao buscar questões. Por favor, tente novamente.';
      }
    );
  }

  consultarProjeto(){

  }
  obterTodasQuestoes(): void {
    this.questoesService.obterTodasQuestoes().subscribe(
      (questoes: Questao[]) => {
        this.questoes = questoes;
      },
      (error) => {
        console.error('Erro ao buscar todas as questões:', error);
        this.message = 'Erro ao buscar todas as questões. Por favor, tente novamente.';
      }
    );
  }

  deletarProjeto(){

  }
  preparaDelecao(questao: QuestaoBusca) {
    this.questaoSelecionada = { ...questao } as Questao;
    this.modalAberto = true; // Abre o modal
  }

  fecharModal() {
    this.modalAberto = false; // Fecha o modal
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
}
