import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Permissao } from 'src/app/login/Permissao';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  
  usuarioLogado: Usuario | null = null;
  Permissao = Permissao; // Adicione esta linha
  usuario!: Usuario | null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.usuarioLogado = this.authService.getUsuarioAutenticado();
  }
  isAdmin(): boolean {
    return this.usuario?.permissao === 'ADMIN'; // Verifica se o usuário é admin
  }

}
