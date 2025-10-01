import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { PageSimuladoComponent } from '../page-simulado/page-simulado.component';
import { PageDesempenhoComponent } from '../page-desempenho/page-desempenho.component';
import { MeusSimuladosComponent } from '../meus-simulados/meus-simulados.component';
import { QuestoesService } from 'src/app/services/questoes.service';
import { SugestaoQuestaoIResponseDTO } from './SugestaoQuestaoIResponseDTO';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { SubtemaDescricoes } from '../page-questoes/enums/subtema-descricao';
import { Tema } from '../page-questoes/enums/tema';
import { Subtema } from '../page-questoes/enums/subtema';
import { TipoDeProvaDescricoes } from '../page-questoes/enums/tipodeprova-descricao';
import { TipoDeProva } from '../page-questoes/enums/tipoDeProva';

// Interfaces
interface SugestaoQuestao {
  question_id: number;
  question_text: string;
  theme: string;
  subtheme: string;
  exam_type: string;
}

interface SugestoesAgrupadas {
  tema: string;
  subtema: string;
  tipoDeProva: string;
  questoes: SugestaoQuestao[];
}

@Component({
  selector: 'app-page-mentoria',
  templateUrl: './page-mentoria.component.html',
  styleUrls: ['./page-mentoria.component.css']
})
export class PageMentoriaComponent implements OnInit {

  // --- Propriedades da Lógica de Alunos ---
  listaCompletaAlunos: Usuario[] = [];
  carregandoAlunos = true;
  opcoesAlunosParaFiltro: { label: string, value: number }[] = [];
  idsAlunosSelecionados: number[] = [];
  alunosFiltrados: Usuario[] = [];

  // --- NOVA PROPRIEDADE PARA O MODAL ---
  // Guarda o objeto do aluno quando o modal deve ser exibido, ou null quando estiver fechado.
  alunoSelecionadoParaDetalhes: Usuario | null = null;

  // --- Propriedades da Lógica de Sugestões (com Paginação) ---
  sugestoesAgrupadas: SugestoesAgrupadas[] = [];
  carregandoSugestoes = true;
  paginaAtualSugestoes = 1;
  totalDePaginasSugestoes = 5; // Total de grupos a serem buscados
  limitePorPaginaSugestoes = 10;
  popupDadosAlunoAberto: boolean = false;

  constructor(
    private readonly authService: AuthService,
    private readonly questoesService: QuestoesService,
    private router: Router,
    public sanitizer: DomSanitizer,
    private readonly dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.fetchListaCompletaAlunos();
    this.fetchPaginaDeSugestoes(this.paginaAtualSugestoes); // Carrega a primeira página de sugestões
  }

  // --- LÓGICA DE ALUNOS ---
  fetchListaCompletaAlunos(): void {
    this.carregandoAlunos = true;
    this.authService.visualizarAlunos().subscribe({
      next: (data: Usuario[] | null) => {
        this.listaCompletaAlunos = data || [];
        this.opcoesAlunosParaFiltro = this.listaCompletaAlunos.map(aluno => ({
          label: aluno.nome,
          value: Number(aluno.id)
        }));
        this.carregandoAlunos = false;
      },
      error: (error) => {
        console.error("Erro ao buscar a lista de alunos:", error);
        this.listaCompletaAlunos = [];
        this.carregandoAlunos = false;
      }
    });
  }

  onSelecaoDeAlunosChange(): void {
    if (!this.idsAlunosSelecionados || this.idsAlunosSelecionados.length === 0) {
      this.alunosFiltrados = [];
      return;
    }
    this.alunosFiltrados = this.listaCompletaAlunos.filter(aluno =>
      this.idsAlunosSelecionados.includes(Number(aluno.id))
    );
  }

  verDesempenho(usuario: Usuario): void {
    this.dialog.open(PageDesempenhoComponent, {
      width: '90vw', maxWidth: '1200px', maxHeight: '90vh',
      data: { alunoId: usuario.id, nomeAluno: usuario.nome },
      panelClass: 'dark-theme-dialog'
    });
  }

  verSimuladosRealizados(usuario: Usuario): void {
    this.dialog.open(MeusSimuladosComponent, {
      width: '90vw', maxWidth: '1200px', maxHeight: '90vh',
      data: { alunoId: usuario.id, nomeAluno: usuario.nome },
      panelClass: 'dark-theme-dialog'
    });
  }

  criarSimulado(usuario: Usuario): void {
    this.dialog.open(PageSimuladoComponent, {
      width: '90vw', maxWidth: '1200px', maxHeight: '90vh',
      data: { alunoId: usuario.id, nomeAluno: usuario.nome },
      panelClass: 'dark-theme-dialog'
    });
  }


  verDetalhesAluno(usuario: Usuario): void {
    this.popupDadosAlunoAberto = true;
    this.alunoSelecionadoParaDetalhes = usuario;
  }


  fecharDetalhesAluno(): void {
    this.popupDadosAlunoAberto = false;
    this.alunoSelecionadoParaDetalhes = null;
  }

  fetchPaginaDeSugestoes(pagina: number): void {
    this.carregandoSugestoes = true;
    this.sugestoesAgrupadas = [];

    this.questoesService.obterSugestoesDeQuestoes(pagina, this.limitePorPaginaSugestoes).subscribe({
      next: (resultado: SugestaoQuestaoIResponseDTO[] | null) => {
        const sugestoes: SugestaoQuestao[] = resultado ? resultado.map(dto => ({
          question_id: dto.question_id,
          question_text: dto.question_text,
          theme: dto.theme,
          subtheme: dto.subtheme,
          exam_type: dto.exam_type
        })) : [];

        this.agruparSugestoes(sugestoes);
        this.carregandoSugestoes = false;
      },
      error: (error) => {
        console.error(`Erro ao buscar sugestões da página ${pagina}:`, error);
        this.sugestoesAgrupadas = [];
        this.carregandoSugestoes = false;
      }
    });
  }

  private agruparSugestoes(sugestoes: SugestaoQuestao[]): void {
    const grupos: { [key: string]: SugestoesAgrupadas } = {};
    for (const questao of sugestoes) {
      const chave = `${questao.theme}-${questao.subtheme}`;
      if (!grupos[chave]) {
        grupos[chave] = {
          tema: questao.theme,
          subtema: questao.subtheme,
          tipoDeProva: questao.exam_type,
          questoes: []
        };
      }
      grupos[chave].questoes.push(questao);
    }
    this.sugestoesAgrupadas = Object.values(grupos);
  }

  irParaPaginaSugestoes(pagina: number): void {
    if (pagina < 1 || pagina > this.totalDePaginasSugestoes || pagina === this.paginaAtualSugestoes) {
      return;
    }
    this.paginaAtualSugestoes = pagina;
    this.fetchPaginaDeSugestoes(this.paginaAtualSugestoes);
  }

  criarSimuladoComFoco(sugestao: SugestoesAgrupadas): void {
    this.router.navigate(['/usuario/simulados'], {
      queryParams: {
        tema: sugestao.tema,
        subtema: sugestao.subtema
      }
    });
  }

  // Funções de tradução
  traduzirTema(tema: string): string {
    return TemaDescricoes[tema as Tema] || tema;
  }

  traduzirSubtema(subtema: string): string {
    return SubtemaDescricoes[subtema as Subtema] || subtema;
  }

  traduzirTipoDeProva(tipoDeProva: string): string {
    return TipoDeProvaDescricoes[tipoDeProva as TipoDeProva] || tipoDeProva;
  }
}
