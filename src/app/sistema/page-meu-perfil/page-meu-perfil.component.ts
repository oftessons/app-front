import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';


@Component({
  selector: 'app-page-meu-perfil',
  templateUrl: './page-meu-perfil.component.html',
  styleUrls: ['./page-meu-perfil.component.css']
})
export class PageMeuPerfilComponent implements OnInit {

  usuario!: Usuario; // Variável para armazenar os dados do perfil do usuário

  constructor(
    private router: Router,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.obterPerfilUsuario();
  }

  obterPerfilUsuario() {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (data) => {
        this.usuario = data; // Armazenar os dados do perfil do usuário na variável 'usuario'
      },
      (error) => {
        console.error('Erro ao obter perfil do usuário:', error);
      }
    );
  }

}
