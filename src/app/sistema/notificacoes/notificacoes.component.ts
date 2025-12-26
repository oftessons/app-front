import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import {
  Notificacao,
  NotificacaoService,
  Page,
} from 'src/app/services/notificacoes.service';

import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-notificacoes',
  templateUrl: './notificacoes.component.html',
  styleUrls: ['./notificacoes.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class NotificacoesComponent implements OnInit {
  notificacoes: Notificacao[] = [];
  loading: boolean = true;
  filtroAtual: 'todas' | 'nao-lidas' = 'todas';

  mostrarModalConfirmacao: boolean = false;
  isLoading = false;
  isMarkingAsRead: { [key: number]: boolean } = {};
  isMarkingAllAsRead = false

  // Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalItens: number = 0;
  totalPaginas: number = 1;
  paginas: number[] = [];
  userId: number | null = null;

  constructor(
    private notificacaoService: NotificacaoService,
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private sanitizer: DomSanitizer,
  ) {
  }

  ngOnInit(): void {
    const userIdLocal = this.authService.getIdUsuarioLocalStorage();

    if (userIdLocal) {
        this.iniciarComId(userIdLocal);
    } else {
        this.authService.obterUsuarioAutenticadoDoBackend().subscribe({
            next: (usuario) => {
                if (usuario && usuario.id) {
                    this.iniciarComId(usuario.id.toString());
                } else {
                    console.error('❌ [DEBUG] Perfil recuperado mas sem ID.');
                    this.loading = false;
                }
            },
            error: (err) => {
                console.error('❌ [DEBUG] Erro ao buscar perfil do usuário:', err);
                this.loading = false;
            }
        });
    }
  }

  // Método auxiliar para iniciar o carregamento com o ID garantido
  private iniciarComId(idStr: string): void {
      const parsedId = parseInt(idStr, 10);
      if (!isNaN(parsedId)) { 
        this.userId = parsedId;
        this.carregarNotificacoes();
      } else {
        console.warn('⚠️ [DEBUG] ID do usuário inválido (NaN):', idStr);
        this.loading = false;
      }
  }

  carregarNotificacoes(): void {
    if (!this.userId) return;

    this.loading = true;

    const pageApi = this.paginaAtual - 1;
    const somenteNaoLidas = this.filtroAtual === 'nao-lidas';

    this.notificacaoService
      .listarNotificacoes(
        this.userId,
        pageApi,
        this.itensPorPagina,
        somenteNaoLidas
      )
      .subscribe({
        next: (response: Page<Notificacao>) => {
          this.notificacoes = response.content;
          this.totalItens = response.totalElements;
          this.totalPaginas = response.totalPages;
          console.log(response)

          this.gerarListaPaginas(); // Gera os números da paginação
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Erro ao carregar notificações da API:', err);
          this.loading = false;
        },
      });
  }

  // Gera o array de números [1, 2, 3...] para exibir no HTML
  private gerarListaPaginas(): void {
    this.paginas = [];
    const maxPaginasVisiveis = 5;
    let inicio = Math.max(1, this.paginaAtual - 2);
    let fim = Math.min(this.totalPaginas, inicio + maxPaginasVisiveis - 1);

    inicio = Math.max(1, fim - maxPaginasVisiveis + 1);

    for (let i = inicio; i <= fim; i++) {
      this.paginas.push(i);
    }
  }

  mudarFiltro(filtro: 'todas' | 'nao-lidas'): void {
    this.filtroAtual = filtro;
    this.paginaAtual = 1; // Reseta para a primeira página ao filtrar
    this.carregarNotificacoes();
  }

  abrirModalConfirmacao(): void {
    if (this.notificacoes.some((n) => !n.lida)) {
      this.mostrarModalConfirmacao = true;
    }
  }

  fecharModalConfirmacao(): void {
    this.mostrarModalConfirmacao = false;
  }

  marcarTodasComoLidas(): void {
    this.fecharModalConfirmacao();

    if (!this.userId) return;

    const idsNaoLidos = this.notificacoes
      .filter((n) => !n.lida)
      .map((n) => n.id);

    if (idsNaoLidos.length > 0) {
      this.notificacaoService.markAsRead(idsNaoLidos).subscribe({
        next: () => {
          // Atualiza visualmente
          this.notificacoes.forEach((n) => (n.lida = true));

          // Opcional: Recarregar a lista se quiser garantir sincronia total com o backend
          // this.carregarNotificacoes();
        },
        error: (err) => console.error('Erro ao marcar todas como lidas', err),
      });
    }
  }

  aoClicarNotificacao(notificacao: Notificacao): void {
      this.marcarComoLida(notificacao);
  }

  marcarComoLida(notificacao: Notificacao): void {
    // Se já estiver lida ou processando, navega direto
    if (notificacao.lida || !notificacao.id || this.isMarkingAsRead[notificacao.id]) {
        this.navegarParaReferencia(notificacao);
        return;
    }

    this.isMarkingAsRead[notificacao.id] = true;

    this.notificacaoService.markAsRead([notificacao.id]).subscribe({
      next: () => {
        notificacao.lida = true;
        this.isMarkingAsRead[notificacao.id] = false;
        // Navega após marcar como lida
        //this.navegarParaReferencia(notificacao);
      },
      error: (error) => {
        console.error('Erro ao marcar como lida:', error);
        this.isMarkingAsRead[notificacao.id] = false;
        // Tenta navegar mesmo com erro
        //this.navegarParaReferencia(notificacao);
      }
    });
  }

  // --- Controles de Paginação ---

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
      this.carregarNotificacoes();
    }
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
      this.carregarNotificacoes();
    }
  }

  selecionarPagina(numero: number): void {
    if (numero !== this.paginaAtual) {
      this.paginaAtual = numero;
      this.carregarNotificacoes();
    }
  }

  formatarMensagem(mensagem: string): SafeHtml {
    // O backend já envia o HTML formatado (strong, em, br), apenas confiamos nele
    return this.sanitizer.bypassSecurityTrustHtml(mensagem);
  }

  navegarParaReferencia(notificacao: Notificacao): void {
    console.warn("A implementar navegação pelas notificações.")
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
