import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { Tema } from '../page-questoes/enums/tema';
import { Subtema } from '../page-questoes/enums/subtema';
import { MatDialog } from '@angular/material/dialog';
import { PageSimuladoComponent } from '../page-simulado/page-simulado.component';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { SubtemaDescricoes } from '../page-questoes/enums/subtema-descricao';
import { PageDesempenhoComponent } from '../page-desempenho/page-desempenho.component';

// Interfaces para a seção de sugestões
interface SugestaoQuestao {
  question_id: number;
  question_text: string;
  theme: string;
  subtheme: string;
}

interface SugestoesAgrupadas {
  tema: string;
  subtema: string;
  questoes: SugestaoQuestao[];
}

@Component({
  selector: 'app-page-mentoria',
  templateUrl: './page-mentoria.component.html',
  styleUrls: ['./page-mentoria.component.css']
})
export class PageMentoriaComponent implements OnInit {

  // --- Propriedades para a Lógica de Alunos ---
  listaCompletaAlunos: Usuario[] = [];
  carregandoAlunos = true;

  // Opções formatadas para o seu componente <app-multiplo-select>
  opcoesAlunosParaFiltro: { label: string, value: number }[] = [];

  // Guarda os IDs dos alunos que foram selecionados no filtro
  idsAlunosSelecionados: number[] = [];

  // Guarda a lista de objetos de usuário que devem ser exibidos na tela
  alunosFiltrados: Usuario[] = [];

  // --- Propriedades para as Sugestões ---
  sugestoesRaw: SugestaoQuestao[] = [];
  sugestoesAgrupadas: SugestoesAgrupadas[] = [];
  carregandoSugestoes = true;

  constructor(
    private readonly authService: AuthService,
    private router: Router,
    public sanitizer: DomSanitizer,
    private readonly dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.fetchListaCompletaAlunos();
    this.fetchSugestoes();
  }

  fetchListaCompletaAlunos(): void {
    this.carregandoAlunos = true;
    this.authService.visualizarAlunos().subscribe({
      next: (data: Usuario[] | null) => {
        this.listaCompletaAlunos = data || [];
        // Transforma a lista de alunos para o formato { label, value } que o seletor espera
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

  // É chamado toda vez que a seleção no filtro <app-multiplo-select> muda
  onSelecaoDeAlunosChange(): void {
    if (!this.idsAlunosSelecionados || this.idsAlunosSelecionados.length === 0) {
      // Se nada estiver selecionado, a lista de exibição fica vazia
      this.alunosFiltrados = [];
      return;
    }

    // Filtra a lista completa para encontrar os alunos cujos IDs foram selecionados
    this.alunosFiltrados = this.listaCompletaAlunos.filter(aluno =>
      this.idsAlunosSelecionados.includes(Number(aluno.id))
    );
  }

  // Ações para os cards de alunos (agora com tipagem correta do ID)
  verDesempenho(usuarioId: string): void {
    const dialogRef = this.dialog.open(PageDesempenhoComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { alunoId: usuarioId },
      panelClass: 'dark-theme-dialog'
    });
  }

  criarSimulado(usuarioId: string): void {
    const dialogRef = this.dialog.open(PageSimuladoComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { alunoId: usuarioId },
      panelClass: 'dark-theme-dialog'
    });
  }

  // --- Funções da Seção de Sugestões (sem alterações) ---

  fetchSugestoes(): void {
    this.carregandoSugestoes = true;
    const dadosSimulados: SugestaoQuestao[] = [
      { question_id: 789, question_text: "<p>Uma fonte luminosa incide sobre uma lente esferocilíndrica...</p>", theme: "OPTICA", subtheme: "LENTES_E_ESPELHOS" },
      { question_id: 805, question_text: "<p>Considerando que uma lente foca a 50 mm a luz...</p>", theme: "OPTICA", subtheme: "LENTES_E_ESPELHOS" },
      { question_id: 3168, question_text: "<p>Ao se analisar o movimento de um feixe de luz refletido...</p>", theme: "OPTICA", subtheme: "LENTES_E_ESPELHOS" },
      { question_id: 956, question_text: "<p>Sobre a reflexão de um espelho é correto afirmar...</p>", theme: "REFRACAO", subtheme: "ASTIGMATISMO" }
    ];

    setTimeout(() => {
      this.sugestoesRaw = dadosSimulados;
      this.agruparSugestoes();
      this.carregandoSugestoes = false;
    }, 1000);
  }

  private agruparSugestoes(): void {
    const grupos: { [key: string]: SugestoesAgrupadas } = {};
    for (const questao of this.sugestoesRaw) {
      const chave = `${questao.theme}-${questao.subtheme}`;
      if (!grupos[chave]) {
        grupos[chave] = {
          tema: questao.theme,
          subtema: questao.subtheme,
          questoes: []
        };
      }
      grupos[chave].questoes.push(questao);
    }
    this.sugestoesAgrupadas = Object.values(grupos);
  }

  criarSimuladoComFoco(sugestao: SugestoesAgrupadas): void {
    this.router.navigate(['/usuario/simulados'], {
      queryParams: {
        tema: sugestao.tema,
        subtema: sugestao.subtema
      }
    });
  }

  traduzirTema(tema: string): string {
    return TemaDescricoes[tema as Tema] || tema;
  }

  traduzirSubtema(subtema: string): string {
    return SubtemaDescricoes[subtema as Subtema] || subtema;
  }
}
