import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Notificacao, NotificacaoService, Page } from 'src/app/services/notificacoes.service';

import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-notificacoes',
  templateUrl: './notificacoes.component.html',
  styleUrls: ['./notificacoes.component.css']
})
export class NotificacoesComponent implements OnInit {

  notificacoes: Notificacao[] = [];
  loading: boolean = true;
  filtroAtual: 'todas' | 'nao-lidas' = 'todas';

  mostrarModalConfirmacao: boolean = false;
  
  // Paginação
  paginaAtual: number = 1; // Frontend visualmente começa na página 1
  itensPorPagina: number = 10;
  totalItens: number = 0;
  totalPaginas: number = 1;

  userId: number | null = null;

  constructor(
    private notificacaoService: NotificacaoService,
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userIdStr = this.authService.getUserIdFromToken();
    if (userIdStr) {
      const parsedId = parseInt(userIdStr, 10);
      if (!isNaN(parsedId)) {
        this.userId = parsedId;
        this.carregarNotificacoes();
      } else {
        console.warn('ID do usuário inválido no token. Carregando modo simulação.');
        this.simularDados();
        this.loading = false;
      }
    } else {
      // Se não tiver usuário logado, carrega o mock para visualização do design
      this.simularDados();
      this.loading = false;
    }
  }

  carregarNotificacoes(): void {
    // Mesmo se tiver userId, vamos rodar o mock
    this.loading = true;

    /* -----------------------------------------------------------
       MOCK DE DADOS PARA DESIGN (ATIVADO)
       -----------------------------------------------------------
       Força o carregamento dos dados simulados para teste visual
    */
    setTimeout(() => {
        console.log('Usando dados mockados para desenvolvimento...');
        this.simularDados(); 
        this.loading = false;
    }, 500);
    
    return; // 🛑 INTERROMPE AQUI para não chamar a API real abaixo

    /* -----------------------------------------------------------
       INTEGRAÇÃO COM A API (CÓDIGO ORIGINAL MANTIDO COMENTADO)
       Remova o 'return' acima e descomente abaixo para usar a API
       -----------------------------------------------------------
    */
    
    /*
    if (!this.userId) return;

    // O Spring Boot usa paginação baseada em 0, então subtraímos 1
    const pageApi = this.paginaAtual - 1;
    const somenteNaoLidas = this.filtroAtual === 'nao-lidas';

    this.notificacaoService.listarNotificacoes(this.userId, pageApi, this.itensPorPagina, somenteNaoLidas)
      .subscribe({
        next: (response: Page<Notificacao>) => {
           this.notificacoes = response.content;
           this.totalItens = response.totalElements;
           this.totalPaginas = response.totalPages;
           this.loading = false;
        },
        error: (err) => {
           console.error('Erro ao carregar notificações da API:', err);
           // Fallback: Carrega o mock em caso de erro para você ver o design
           this.simularDados(); 
           this.loading = false;
        }
      });
    */
  }

  mudarFiltro(filtro: 'todas' | 'nao-lidas'): void {
    this.filtroAtual = filtro;
    this.paginaAtual = 1; // Reseta para a primeira página ao filtrar
    this.carregarNotificacoes();
  }

  abrirModalConfirmacao(): void {
    // Só abre se houver notificações para marcar
    if (this.notificacoes.some(n => !n.lida)) {
        this.mostrarModalConfirmacao = true;
    }
  }

  // 2. Fecha o modal
  fecharModalConfirmacao(): void {
    this.mostrarModalConfirmacao = false;
  }

  marcarTodasComoLidas(): void {
    // MOCK VISUAL: Marca visualmente como lidas sem chamar o backend
    this.notificacoes.forEach(n => n.lida = true);
    this.fecharModalConfirmacao()

    /* LÓGICA REAL (Comentada)
    if (!this.userId) return;
    
    const idsNaoLidos = this.notificacoes
      .filter(n => !n.lida)
      .map(n => n.id);

    if (idsNaoLidos.length > 0) {
      this.notificacaoService.markAsRead(idsNaoLidos).subscribe(() => {
        this.notificacoes.forEach(n => n.lida = true);
      });
    }
    */
  }

  aoClicarNotificacao(notificacao: Notificacao): void {
    // 1. Marca como lida visualmente instantaneamente (Mock)
    if (!notificacao.lida) {
      notificacao.lida = true; 
      // Lógica real de marcar como lida no backend seria:
      // if (this.userId) { this.notificacaoService.markAsRead([notificacao.id]).subscribe(); }
    }

    // 2. Redireciona baseado no referenciaId
    if (notificacao.referenciaId) {
       console.log('Navegando para referência:', notificacao.referenciaId);
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

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  // --- Método de Mock para Testes de Design ---
  private simularDados() {
    this.notificacoes = Array(10).fill(0).map((_, i) => ({
      id: i,
      mensagem: `Victor Barroso comentou na aula "Introdução ${i + 1}". Este é um texto de exemplo para testar o layout.`,
      dataCriacao: new Date().toISOString(),
      lida: i > 2, // As 3 primeiras aparecem como não lidas (amarelo)
      referenciaId: 100 + i,
      tipo: 'COMENTARIO'
    }));
    this.totalPaginas = 3;
    this.totalItens = 30;
  }

}