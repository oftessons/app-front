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
import { TipoUsuario } from 'src/app/login/enums/tipo-usuario';
import { TipoUsuarioDescricao } from 'src/app/login/enums/tipo-usuario-descricao';
import { VendasService } from 'src/app/services/vendas.service';
import { Permissao } from 'src/app/login/Permissao';

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
  possuiPermissao!: boolean;

  tiposUsuario = Object.keys(TipoUsuario).map(key => ({
    key,
    value: TipoUsuario[key as keyof typeof TipoUsuario],
    description: TipoUsuarioDescricao[TipoUsuario[key as keyof typeof TipoUsuario]]
  }));



  constructor(private router: Router, private authService: AuthService, private stripeService: StripeService,
    private vendasService: VendasService
  ) { }

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
        // data.tipoDeEstudante = this.obterDescricaoTipoUsuario(data.tipoDeEstudante as TipoUsuario);
        console.log(data);
        this.usuario = data;
      },
      (error) => {
        console.error('Erro ao obter perfil do usuário:', error);
      }
    );
  }

  obterDescricaoTipoUsuario(tipoUsuario: TipoUsuario) {
    return TipoUsuarioDescricao[tipoUsuario] || 'Tipo de usuario não informado';
  }

  obterTipoUsuarioPorDescricao(descricao: string): TipoUsuario | string {
    for (const key in TipoUsuarioDescricao) {
      if (TipoUsuarioDescricao[key as keyof typeof TipoUsuarioDescricao] === descricao) {
        return key as TipoUsuario;
      }
    }
    return '';
  }


  editarPerfil() {
    this.editMode = !this.editMode;
  
    if (!this.editMode) {
      if (this.usuario.dataNascimento && typeof this.usuario.dataNascimento === 'string') {
        this.usuario.dataNascimento = new Date(this.usuario.dataNascimento);
      }
    
      console.log('Dados do usuário para atualização:', this.usuario);
    
      this.authService
        .atualizarUsuario(this.usuario, this.selectedFile)
        .subscribe(
          (data) => {
            this.usuario = data;
           // this.usuario.tipoDeEstudante = this.obterDescricaoTipoUsuario(data.tipoDeEstudante as TipoUsuario);

            // localStorage.setItem('usuario', JSON.stringify(data));

            if (data.telefone && data.cidade && data.estado && data.dataNascimento) {
              localStorage.setItem('cadastro_completo', 'true');
              localStorage.removeItem('precisa_completar_cadastro');
            }
            //  console.log('Perfil atualizado com sucesso:', data);
          },
          (error) => {
            console.error('Erro ao atualizar perfil do usuário:', error);
          }
        );
    }
  }

  exibirInformacaoPlano() {
    this.vendasService.obterDadosAssinatura().subscribe(
      (response) => {
        const plano: Plano = new Plano();
        console.log(plano);
        plano.name = response.name;
        plano.intervaloRenovacao = this.getPeriodoTraduzido(response.intervaloRenovacao);
        plano.status = this.getStatusTraduzido(response.status);
        plano.proximaRenovacao = this.converterDateTime(response.proximaRenovacao);
        plano.validoAte = this.converterDateTime(response.validoAte);
        this.planInformation = plano;
      },
      (error) => {
        console.error('Erro ao obter informações do plano:', error);
      })
  }

  exibirPortalAssinatura() {
    this.vendasService.obterPortalAcesso().subscribe(
      (response) => {
        window.location.href = response.url;

      },
      (error) => {
        console.error('Erro ao exibir portal de assinatura:', error);
      }
    );
  }

  converterDateTime(data: Date): string {
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

  traduzirTipoEstudanteUsuario(tipoUsuario: string): string {
    return TipoUsuarioDescricao[tipoUsuario as TipoUsuario] || 'Tipo de usuario não informado';
  }

}
