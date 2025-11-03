import { Component, Inject, OnInit, Optional } from '@angular/core';
import { SimuladoService } from 'src/app/services/simulado.service';
import { Simulado } from '../simulado';
import { Router } from '@angular/router'; // Para navegação após visualizar ou editar
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Usuario } from 'src/app/login/usuario';
import { StatusSimuladoDescricao } from './status-simulado-descricao';
import { StatusSimulado } from './status-simulado';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MetricasDetalhadasComponent } from '../metricas-detalhadas/metricas-detalhadas.component';
import { PageSimuladoComponent } from '../page-simulado/page-simulado.component';

@Component({
  selector: 'app-meus-simulados',
  templateUrl: './meus-simulados.component.html',
  styleUrls: ['./meus-simulados.component.css'],
})
export class MeusSimuladosComponent implements OnInit {
  simulados: Simulado[] = [];
  usuario!: Usuario;
  usuarioId!: number;
  carregando: boolean = true;  
  mensagemSucesso: string = '';
  ocultarFiltros: boolean = false;
  idAlunoMentorado!: string;
  nomeAlunoMentorado!: string;
  bloqueado: boolean = false;


  constructor(
    private simuladoService: SimuladoService,
    private router: Router,
    private authService: AuthService,
    private themeService: ThemeService,
    private readonly dialog: MatDialog,
    @Optional() public dialogRef: MatDialogRef<MeusSimuladosComponent>,

    @Optional() @Inject(MAT_DIALOG_DATA) public data: { alunoId: string, nomeAluno: string } | null
  ) {
    this.idAlunoMentorado = data?.alunoId || '';
    this.nomeAlunoMentorado = data?.nomeAluno || '';
  }

  ngOnInit(): void {
    this.obterPerfilUsuario();
  }

  obterPerfilUsuario() {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (data) => {
        this.usuario = data;
        this.usuarioId = this.idAlunoMentorado ? Number(this.idAlunoMentorado) : Number(this.usuario.id);
        this.simuladoService.obterSimulados(this.usuarioId).subscribe(
          (data: Simulado[]) => {
            this.simulados = data;
            this.carregando = false;
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
        this.ocultarFiltros = true;
        if (this.data) {
          // Se estiver em um dialog, abre o componente de edição em um modal
          const dialogRef = this.dialog.open(PageSimuladoComponent, {
            width: '90vw',
            maxWidth: '1200px',
            maxHeight: '90vh',
            data: { simulado: data, modoEdicao: true, alunoId: this.usuarioId },
            panelClass: 'dark-theme-dialog'
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              // Atualize a lista de simulados ou faça outra ação se necessário
              this.obterPerfilUsuario();
            }
          });
        } else {
          // Caso contrário, navega normalmente
          this.router.navigate(['/usuario/simulados'], { state: { simulado: data, ocultarFiltros: true } });
        }
      },
      (error) => {
        alert('Erro ao obter simulado por ID');
        console.error('Erro ao obter simulado por ID:', error);
      }
    );
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
      case StatusSimulado.FINALIZADO:
        return 'Revisar simulado';
      default:
        this.bloqueado = true;
        return 'Processando...';
    }
  }

  abrirMetricas(simulado: Simulado): void {
    // Se o componente estiver sendo usado em um dialog (possui this.data), abre o dialog
    if (this.data) {
      this.verificarMetricasDialog(simulado);
    } else {
      this.verificarMetricas(simulado);
    }
  }

  verificarMetricasDialog(simulado: Simulado) {
    const dialogRef = this.dialog.open(MetricasDetalhadasComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { simuladoId: simulado.id },
      panelClass: 'dark-theme-dialog'

    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.verificarMetricas(result);
      }
    });
  }

  verificarMetricas(simulado: Simulado): void {
    this.router.navigate(['/usuario/metricas-detalhadas', simulado.id]);
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  fecharPopup(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}

