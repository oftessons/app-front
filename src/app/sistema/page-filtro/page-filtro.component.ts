import { Component, OnInit } from '@angular/core';
import { FiltroDTO } from '../filtroDTO'; // Atualize o caminho conforme necessário
import { FiltroService } from 'src/app/services/filtro.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/login/usuario';

@Component({
  selector: 'app-page-filtro',
  templateUrl: './page-filtro.component.html',
  styleUrls: ['./page-filtro.component.css'],
})
export class PageFiltroComponent implements OnInit {
  filtros: FiltroDTO[] = [];
  usuario!: Usuario;

  constructor(
    private filtroService: FiltroService,
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
        this.carregarFiltros();
      },
      (error) => {
        console.error('Erro ao obter perfil do usuário:', error);
      }
    );
  }

  carregarFiltros(): void {
    const idUser = parseInt(this.usuario.id);
    console.log('idUser: ' + idUser);
    this.filtroService.getFiltros(idUser).subscribe(
      (filtros) => {
        this.filtros = filtros;
      },
      (error) => {
        console.error('Erro ao carregar filtros:', error);
      }
    );
  }

  deletarFiltro(id: number): void {
    this.filtroService.deletarFiltro(id).subscribe(
      () => {
        this.carregarFiltros();
      },
      (error) => {
        console.error('Erro ao deletar filtro:', error);
      }
    );
  }

  editarFiltro(id: number): void {
    this.router.navigate(['/editar-filtro', id]); // Navega para a rota de edição
  }
}
