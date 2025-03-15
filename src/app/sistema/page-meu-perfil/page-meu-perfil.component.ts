import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { StripeService } from 'src/app/services/stripe.service';
import { Plano } from './plano';
import { concatMapTo } from 'rxjs/operators';

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
  planInformation!: Plano;

  
  constructor(private router: Router, private authService: AuthService, private stripeService: StripeService) {}

  ngOnInit(): void {
    this.obterPerfilUsuario();
  }

  mostrarConteudo(conteudo: string) {
    this.conteudoAtual = conteudo;
    this.exibirInformacaoPlano();
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

  exibirInformacaoPlano() {
    this.stripeService.getPlanInformation().subscribe(
      (response) => {
        const plano: Plano = new Plano();
        plano.name = response.data.name;
        plano.intervaloRenovacao = response.data.intervaloRenovacao;
        plano.status = response.data.status;
        plano.proximaRenovacao = response.data.proximaRenovacao;
        plano.validoAte = response.data.validoAte;
        this.planInformation = plano;
        console.log('Informações do plano:', this.planInformation);
      },
      (error) => {
      console.error('Erro ao obter informações do plano:', error);
    })
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
