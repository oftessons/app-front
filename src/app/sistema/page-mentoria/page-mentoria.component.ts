// src/app/mentoria/page-mentoria/page-mentoria.component.ts

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { PageDesempenhoComponent } from '../page-desempenho/page-desempenho.component';
import { MeusSimuladosComponent } from '../meus-simulados/meus-simulados.component';
import { PageSimuladoComponent } from '../page-simulado/page-simulado.component';
import { SugestaoAlunoDialogComponent } from '../sugestao-aluno-dialog/sugestao-aluno-dialog.component';
import { TipoUsuario } from 'src/app/login/enums/tipo-usuario';
import { TipoUsuarioDescricao } from 'src/app/login/enums/tipo-usuario-descricao';
import { PageQuestoesComponent } from '../page-questoes/page-questoes.component';
import { Permissao } from 'src/app/login/Permissao';

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
  isAluno = false;

  constructor(
    private readonly authService: AuthService,
    private readonly dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    // this.fetchListaCompletaAlunos();
    this.verificarFormaLoading();
  }

  verificarFormaLoading():void{
    const usuarioLogado = this.authService.getUsuarioAutenticado();

    if(usuarioLogado){
      const permissao = usuarioLogado.permissao;
      this.isAluno =permissao === Permissao.USER || permissao === Permissao.BOLSISTA

      if(this.isAluno){
        this.filtrarAlunoLogadoNaListaMentoria();
      }
      else{
        this.fetchListaCompletaAlunos();
      }
    }
  }

  filtrarAlunoLogadoNaListaMentoria(): void {
    this.carregandoAlunos = true;

    this.authService.obterUsuarioAutenticadoDoBackend().subscribe({
      next: (dadosDoUsuarioLogado: Usuario) => {

        this.authService.visualizarAlunosMentoria().subscribe({
          
          next: (listaDaMentoria: Usuario[] | null) => {
            
            const listaSegura = listaDaMentoria || [];

            const alunoEncontrado = listaSegura.find(
              aluno => Number(aluno.id) === Number(dadosDoUsuarioLogado.id)
            );

            if (alunoEncontrado) {
              this.listaCompletaAlunos = [alunoEncontrado];
              this.alunosFiltrados = [alunoEncontrado];
            } else {
              console.warn("Aluno logado não encontrado na lista de mentoria.");
              this.alunosFiltrados = [];
            }
            
            this.carregandoAlunos = false;
          },
          error: (erroLista) => {
            console.error("Erro ao buscar lista de mentoria:", erroLista);
            this.carregandoAlunos = false;
          }
        });
      },
      error: (erroUsuario) => {
        console.error("Erro ao buscar dados do usuário logado:", erroUsuario);
        this.carregandoAlunos = false;
      }
    });
  }

  fetchListaCompletaAlunos(): void {
    this.carregandoAlunos = true;
    this.authService.visualizarAlunosMentoria().subscribe({
      next: (data: Usuario[] | null) => {
        this.listaCompletaAlunos = data || [];
        this.opcoesAlunosParaFiltro = this.listaCompletaAlunos.map(aluno => {
          let label = aluno.nome;
          const permissao = aluno.permissao;
          
          if (permissao === Permissao.BOLSISTA.valueOf().substring(5)) {
            label = `${aluno.nome} (Bolsista)`;
          } else if (permissao === Permissao.USER.valueOf().substring(5)) {
            label = `${aluno.nome} (Aluno)`;
          } else if (permissao === Permissao.PROFESSOR.valueOf().substring(5)) {
            label = `${aluno.nome} (Professor)`;
          } 
          
          return {
            label: label,
            value: Number(aluno.id)
          };
        });
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