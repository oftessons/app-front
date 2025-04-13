import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Usuario } from '../login/usuario';
import { MFACodigoDTO } from '../sistema/MFACodigoDTO';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-validacao-acesso',
  templateUrl: './validacao-acesso.component.html',
  styleUrls: ['./validacao-acesso.component.css']
})
export class ValidacaoAcessoComponent {
  codigo: string = '';
  errors: string[] = [];
  mensagemSucesso: string | null = null;

  username: string = localStorage.getItem('username') ?? '';
  password: string = localStorage.getItem('password') ?? '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    const dto: MFACodigoDTO = {
      username: this.username,
      codigo: this.codigo
    };

    console.log("username", this.username);
    console.log("password", this.password);
    console.log("codigo", this.codigo);

    this.authService.verify2FACode(dto).subscribe({
      next: (res: boolean) => {
        if (res) {
          this.realizarLogin();
        } else {
          this.errors = ['Código inválido. Tente novamente.'];
        }
      },
      error: () => {
        this.errors = ['Erro ao validar o código.'];
      }
    });
  }

  realizarLogin() {
    this.authService.tentarLogar(this.username, this.password).subscribe(
      (response: any) => {
        const access_token = response.access_token;
        localStorage.setItem('access_token', access_token);
  
        const userId = this.authService.getUserIdFromToken() ?? '';
        localStorage.setItem('user_id', userId);
  
        const usuario: Usuario = {
          id: userId,
          fotoUrl: null,
          username: response.username,
          password: '',
          email: response.email || '',
          planoId: response.planoId || '',
          stripeCustomerId: response.stripeCustomerId || '',
          telefone: response.telefone || '',
          cidade: response.cidade || '',
          estado: response.estado || '',
          nome: response.nome || '',
          confirmPassword: '',
          tipoUsuario: '',
          bolsaAssinatura: response.bolsa || false,
          diasDeTeste: response.quantidadeDiasBolsa || 0,
          permissao: response.authorities.length > 0 ? response.authorities[0] : null,
          tipoDeEstudante: response.tipoDeEstudante || ''
        };
        localStorage.setItem('usuario', JSON.stringify(usuario));

        this.mensagemSucesso = 'Login realizado com sucesso. Redirecionando...';
  
        if (
          usuario.permissao === 'ROLE_ADMIN' ||
          usuario.permissao === 'ROLE_USER' ||
          usuario.permissao === 'ROLE_PROFESSOR'
        ) {
          this.router.navigate(['/usuario/inicio']);
        } else {
          this.router.navigate(['/forbidden']);
        }
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status === 401 && errorResponse.error === 'CadastroIncompleto') {
          this.errors = ['Faça o seu cadastro, entre e ative o seu plano para acessar a plataforma.'];
        } else {
          this.errors = ['Usuário e/ou senha incorreto(s).'];
        }
      }
    );
  }
}