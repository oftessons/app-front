import { Component, OnInit } from '@angular/core';
import { SimuladoService } from 'src/app/services/simulado.service';
import { Simulado } from '../simulado';
import { Router } from '@angular/router'; // Para navegação após visualizar ou editar
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/login/usuario';

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

  constructor(
    private simuladoService: SimuladoService,
    private router: Router,
    private authService: AuthService
  ) {}

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
            console.error('Erro ao carregar simulados', error);
            this.carregando = false;  // Mesmo em caso de erro, desativa o carregamento
          }
        );
      },
      (error) => {
        console.error('Erro ao obter perfil do usuário:', error);
        this.carregando = false;
      }
    );
  }

  editarSimulado(id: number): void {
    this.router.navigate([`/simulados`, id]);
  }

  deletarSimulado(id: number): void {
    console.log('Deletando simulado com ID:', id);
    this.simuladoService.deletarSimulado(id).subscribe(
      () => {
        this.simulados = this.simulados.filter(
          (simulado) => simulado.id !== id
        );
      },
      (error) => {
        console.error('Erro ao deletar o simulado', error);
      }
    );
  }
}

