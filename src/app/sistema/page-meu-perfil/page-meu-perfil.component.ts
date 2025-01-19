import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Permissao } from 'src/app/login/Permissao';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { StripeService } from 'src/app/services/stripe/stripe.service';
import { Plano } from '../stripePlanDTO';
import { runInThisContext } from 'vm';

@Component({
  selector: 'app-page-meu-perfil',
  templateUrl: './page-meu-perfil.component.html',
  styleUrls: ['./page-meu-perfil.component.css'],
})
export class PageMeuPerfilComponent implements OnInit {
  usuario!: Usuario;
  planName!: string;
  editMode: boolean = false;
  selectedFile!: File;
  tiposPermissao = [Permissao.PROFESSOR, Permissao.USER];
  tipoUsuario: String = '';
  
  constructor(private router: Router, private authService: AuthService, private stripeService: StripeService) {}

  ngOnInit(): void {
    this.obterPerfilUsuario();
    this.obterPlanoDoUsuarioByPriceId();

  }

  obterPerfilUsuario() {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (data) => {
        this.usuario = data;
        
      },
      (error) => {
       console.error('Erro ao obter perfil do usuário:', error);
      }
    );
  }

  obterPlanoDoUsuarioByPriceId() {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (data) => {
        const price_id = data.planoId;

        this.stripeService.getPlanByPrice(price_id).then((plan: Plano | null) => {
          if(plan) {
            this.planName = plan.name;
            console.log("Nome do plano: ", this.planName);

          } else {
            this.planName = "FREE";
            console.error("Não foi possível encontrar um plano para esse usuário");
          }
        })
        
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
