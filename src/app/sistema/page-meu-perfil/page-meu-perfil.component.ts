import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-page-meu-perfil',
  templateUrl: './page-meu-perfil.component.html',
  styleUrls: ['./page-meu-perfil.component.css'],
})
export class PageMeuPerfilComponent implements OnInit {
  conteudoAtual: string = 'perfil';
  usuario!: Usuario;
  editMode: boolean = false;
  selectedFile!: File;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.obterPerfilUsuario();
  }

  mostrarConteudo(conteudo: string) {
    this.conteudoAtual = conteudo;
  }

  obterPerfilUsuario() {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (data) => {
        this.usuario = data;
      },
      (error) => {
       // console.error('Erro ao obter perfil do usuário:', error);
      }
    );
  }

  editarPerfil() {
    this.editMode = !this.editMode;
    if (!this.editMode) {
      this.authService
        .atualizarUsuario(this.usuario, this.selectedFile)
        .subscribe(
          (data) => {
          //  console.log('Perfil atualizado com sucesso:', data);
          },
          (error) => {
           // console.error('Erro ao atualizar perfil do usuário:', error);
          }
        );
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.usuario.fotoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  voltarPerfil(): void {
    this.router.navigate(['/usuario/dashboard']);
  }
}
