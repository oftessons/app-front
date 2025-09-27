import { Component, OnInit } from '@angular/core';
import { SimuladoService } from 'src/app/services/simulado.service';
import { Simulado } from '../simulado';
import { Router } from '@angular/router'; // Para navegação após visualizar ou editar
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Usuario } from 'src/app/login/usuario';
import { StatusSimuladoDescricao } from './status-simulado-descricao';
import { StatusSimulado } from './status-simulado';

@Component({
  selector: 'app-meus-simulados',
  templateUrl: './meus-simulados.component.html',
  styleUrls: ['./meus-simulados.component.css'],
})
export class MeusSimuladosComponent implements OnInit {
  simulados: Simulado[] = [];
  usuario!: Usuario;
  usuarioId!: number;
  carregando: boolean = true;  // Variável para indicar o estado de carregamento
  mensagemSucesso: string = '';
  ocultarFiltros: boolean = false;


  constructor(
    private simuladoService: SimuladoService,
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService
  ) { }

  ngOnInit(): void {
    this.obterPerfilUsuario();
  }

  obterPerfilUsuario() {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (data) => {
        this.usuario = data;
        this.usuarioId = parseInt(this.usuario.id);
        this.simuladoService.obterSimulados(this.usuarioId).subscribe(
          (data: Simulado[]) => {
            this.simulados = data;
            this.carregando = false;  // Desativa o carregamento quando os dados chegarem
          },
          (error) => {
            // console.error('Erro ao carregar simulados', error);
            this.carregando = false;  
          }
        );
      },
      (error) => {
        //console.error('Erro ao obter perfil do usuário:', error);
        this.carregando = false;
      }
    );
  }

  editarSimulado(id: number): void {
    this.simuladoService.obterSimuladoPorId(id).subscribe(
      (data) => {
        // console.log('Simulado:', data);
        this.ocultarFiltros = true;
        this.router.navigate(['/usuario/simulados'], { state: { simulado: data } });
      },
      (error) => {
        alert('Erro ao obter simulado por ID');
        console.error('Erro ao obter simulado por ID:', error);
      }
    )
  }

  deletarSimulado(id: number): void {
    this.simuladoService.deletarSimulado(id).subscribe(
      () => {
        this.simulados = this.simulados.filter(
          (simulado) => simulado.id !== id
        );

        this.mensagemSucesso = 'Simulado Deletado com Sucesso.';

        setTimeout(() => {
          this.mensagemSucesso = '';
        }, 3000);
      },
      (error) => {
        console.error('Erro ao deletar o simulado', error);
      }
    );
  }

  descricaoStatusSimulado(status: StatusSimulado): string {
    return StatusSimuladoDescricao[status];
  }

  getBotaoSimuladoTexto(status: StatusSimulado): string {
    switch (status) {
      case StatusSimulado.NAO_INICIADO:
        return 'Iniciar simulado';
      case StatusSimulado.EM_ANDAMENTO:
        return 'Retornar ao simulado';
      case StatusSimulado.FINALIZADO:
        return 'Revisar simulado';
      default:
        return 'Ação';
    }
  }

  verificarMetricas(simuladoId: number): void {
    this.router.navigate(['/usuario/metricas-detalhadas', simuladoId]);
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}

