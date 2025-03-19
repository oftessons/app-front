import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { StripeService } from 'src/app/services/stripe.service';
import { Plano } from './plano';
import { StatusAssinatura } from './enums/status-assinatura';
import { StatusAssinaturaDescricao } from './enums/status-assinatura-descricao';
import { PeriodoAssinatura } from './enums/periodo-assinatura';
import { PeriodoAssinaturaDescricao } from './enums/periodo-assinatura-descricao';
import { InteractionModeRegistry } from 'chart.js';

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
    this.exibirInformacaoPlano();

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

  exibirInformacaoPlano() {
    this.stripeService.getPlanInformation().subscribe(
      (response) => {
        const plano: Plano = new Plano();
        plano.name = response.data.name;
        plano.intervaloRenovacao = this.getPeriodoTraduzido(response.data.intervaloRenovacao);
        plano.status = this.getStatusTraduzido(response.data.status);
        plano.proximaRenovacao = this.converterDateTime(response.data.proximaRenovacao);
        plano.validoAte = this.converterDateTime(response.data.validoAte);
        this.planInformation = plano;
      },
      (error) => {
      console.error('Erro ao obter informações do plano:', error);
    })
  }

  exibirPortalAssinatura() {
    this.stripeService.createPortalSession().subscribe(
      (response) => {
        window.location.href = response.url_portal;
        console.log('Portal de assinatura exibido com sucesso:', response);
      },
      (error) => {
        console.error('Erro ao exibir portal de assinatura:', error);
      }
    );
  }

  converterDateTime(data: Date) : string {
    let dataHoraFormatada = new Date(data).toLocaleDateString();
    let dataFormatada = dataHoraFormatada.split(',')[0];
    return dataFormatada;
  }


  getStatusTraduzido(status: StatusAssinatura) {
    return StatusAssinaturaDescricao[status];
  }

  getPeriodoTraduzido(status: PeriodoAssinatura) {
    return PeriodoAssinaturaDescricao[status];
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
