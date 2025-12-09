import { Component, OnInit } from '@angular/core';
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
})
export class NotificacoesComponent implements OnInit {
  notificacoes: Notificacao[] = [];
  loading: boolean = true;
  filtroAtual: 'todas' | 'nao-lidas' = 'todas';

  mostrarModalConfirmacao: boolean = false;

  // Paginação
  paginaAtual: number = 1;
  itensPorPagina: number = 10;
  totalItens: number = 0;
  totalPaginas: number = 1;
  paginas: number[] = []; // Array para os botões numéricos da paginação

  userId: number | null = null;

  constructor(
    private notificacaoService: NotificacaoService,
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userIdStr = this.authService.getUserIdFromToken();
    if (userIdStr) {
      const parsedId = parseInt(userIdStr, 10);
      if (!isNaN(parsedId)) {
        this.userId = parsedId;
        this.carregarNotificacoes();
      } else {
        console.warn('ID do usuário inválido no token.');
        this.loading = false;
      }
    } else {
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

    // Podemos pegar os IDs das notificações não lidas carregadas atualmente
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
    // 1. Marca como lida se não estiver
    if (!notificacao.lida) {
      notificacao.lida = true; // Atualiza visualmente instantaneamente
      if (this.userId) {
        this.notificacaoService.markAsRead([notificacao.id]).subscribe();
      }
    }

    // 2. Redireciona baseado no referenciaId
    if (notificacao.referenciaId) {
      console.log('Navegando para referência:', notificacao.referenciaId);
      // Exemplo de navegação real:
      // this.router.navigate(['/usuario/painel-de-aulas', notificacao.referenciaId]);
    }
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

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
