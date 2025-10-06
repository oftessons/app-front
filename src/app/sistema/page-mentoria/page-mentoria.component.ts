// src/app/mentoria/page-mentoria/page-mentoria.component.ts

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { PageDesempenhoComponent } from '../page-desempenho/page-desempenho.component';
import { MeusSimuladosComponent } from '../meus-simulados/meus-simulados.component';
import { PageSimuladoComponent } from '../page-simulado/page-simulado.component';
// Importe o novo componente de diálogo que será criado
import { SugestaoAlunoDialogComponent } from '../sugestao-aluno-dialog/sugestao-aluno-dialog.component';
import { TipoUsuario } from 'src/app/login/enums/tipo-usuario';
import { TipoUsuarioDescricao } from 'src/app/login/enums/tipo-usuario-descricao';
import { PageFiltroComponent } from '../page-filtro/page-filtro.component';
import { PageQuestoesComponent } from '../page-questoes/page-questoes.component';

@Component({
  selector: 'app-page-mentoria',
  templateUrl: './page-mentoria.component.html',
  styleUrls: ['./page-mentoria.component.css']
})
export class PageMentoriaComponent implements OnInit {

  // Propriedades da Lógica de Alunos
  listaCompletaAlunos: Usuario[] = [];
  carregandoAlunos = true;
  opcoesAlunosParaFiltro: { label: string, value: number }[] = [];
  idsAlunosSelecionados: number[] = [];
  alunosFiltrados: Usuario[] = [];

  // Propriedade para o modal de detalhes do aluno
  alunoSelecionadoParaDetalhes: Usuario | null = null;
  popupDadosAlunoAberto: boolean = false;

  constructor(
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.fetchListaCompletaAlunos();
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


  verDetalhesAluno(usuario: Usuario): void {
    this.popupDadosAlunoAberto = true;
    this.alunoSelecionadoParaDetalhes = usuario;
  }

  fecharDetalhesAluno(): void {
    this.popupDadosAlunoAberto = false;
    this.alunoSelecionadoParaDetalhes = null;
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

  criarListaQuestoes(usuario: Usuario): void {
    this.dialog.open(PageQuestoesComponent, {
      width: '90vw', maxWidth: '1200px', maxHeight: '90vh',
      data: { alunoId: usuario.id, nomeAluno: usuario.nome },
      panelClass: 'dark-theme-dialog'
    });
  }

  // NOVO MÉTODO para ver sugestões personalizadas por IA
  verSugestoes(usuario: Usuario): void {
    this.dialog.open(SugestaoAlunoDialogComponent, {
      width: '90vw', maxWidth: '1200px', maxHeight: '90vh',
      data: { alunoId: usuario.id, nomeAluno: usuario.nome },
      panelClass: 'dark-theme-dialog'
    });
  }

  traduzirTipoUsuario(tipoUsuario: string): string {
    return TipoUsuarioDescricao[tipoUsuario as TipoUsuario] || 'Desconhecido';
  }
}