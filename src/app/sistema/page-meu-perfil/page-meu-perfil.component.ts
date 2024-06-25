import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-page-meu-perfil',
  templateUrl: './page-meu-perfil.component.html',
  styleUrls: ['./page-meu-perfil.component.css']
})
export class PageMeuPerfilComponent implements OnInit {
  usuario!: Usuario; 
  editMode: boolean = false; 

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

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

  editarPerfil() {
    this.editMode = !this.editMode; // Alternar o modo de edição
    if (!this.editMode) {
      this.authService.atualizarUsuario(this.usuario).subscribe(
        (data) => {
          console.log('Perfil atualizado com sucesso:', data);
        },
        (error) => {
          console.error('Erro ao atualizar perfil do usuário:', error);
        }
      );
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.usuario.fotoUrl = e.target.result; // Atualizar a URL da foto do usuário com a imagem carregada
      };
      reader.readAsDataURL(file);
    }
  }
  
  voltarPerfil(): void {
    this.router.navigate(['/usuario/dashboard']);
  }
}
