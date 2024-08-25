import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Usuario } from './usuario';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  nome: string = '';
  email: string = '';
  telefone: string = '';
  cidade: string = '';
  estado: string = '';
  cadastrando: boolean = false;
  mensagemSucesso: string = '';
  errors: string[] = [];
  usuario: any;
  forgotEmail: string = '';
  showForgotPassword: boolean = false;

  passwordVisible: boolean = false;
  showTooltip: boolean = false;
  passwordValidations = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    this.authService.tentarLogar(this.username, this.password).subscribe(
      (response: any) => {
        const access_token = JSON.stringify(response);
        localStorage.setItem('access_token', access_token);

        const userId = this.authService.getUserIdFromToken();
        localStorage.setItem('user_id', userId || '');
        this.salvaUserLocal();

        // Redireciona para a página de dashboard após o login
        this.router.navigate(['/gerente/dashboard']);
      },
      errorResponse => {
        this.errors = ['Usuário e/ou senha incorreto(s).'];
      }
    );
  }

  preparaCadastrar(event: Event) {
    event.preventDefault();
    this.cadastrando = true;
    this.showForgotPassword = false; // Certifique-se de que o formulário de recuperação de senha está escondido
  }

  cancelaCadastro() {
    this.cadastrando = false;
  }

  cadastrar(){
  this.errors = []; // Limpa os erros anteriores
  const passwordValidationErrors: string[] = [];

  // Validações de senha
  if (this.password.length < 8) {
    passwordValidationErrors.push("A senha deve ter pelo menos 8 caracteres.");
  }
  if (!/[A-Z]/.test(this.password)) {
    passwordValidationErrors.push("A senha deve conter pelo menos uma letra maiúscula.");
  }
  if (!/[a-z]/.test(this.password)) {
    passwordValidationErrors.push("A senha deve conter pelo menos uma letra minúscula.");
  }
  if (!/[0-9]/.test(this.password)) {
    passwordValidationErrors.push("A senha deve conter pelo menos um número.");
  }
  if (!/[!@#$%^&*]/.test(this.password)) {
    passwordValidationErrors.push("A senha deve conter pelo menos um caractere especial (por exemplo, !@#$%^&*).");
  }

  // Se houver erros de validação, armazene-os em this.errors e não prossiga
  if (passwordValidationErrors.length > 0) {
    this.errors = passwordValidationErrors;
    return; // Interrompe a execução do método
  }

    const usuario: Usuario = new Usuario();
    usuario.username = this.username;
    usuario.password = this.password;
    usuario.email = this.email;
    this.authService
        .salvar(usuario)
        .subscribe( response => {
            this.mensagemSucesso = "Cadastro realizado com sucesso! Efetue o login.";
            this.cadastrando = false;
            this.username = '';
            this.password = '';
            this.email = '';
            this.errors = []
        }, errorResponse => {
            // this.mensagemSucesso = "Cadastro realizado com sucesso! Efetue o login.";
            this.errors = errorResponse.error.errors;
        })
  }


  // mudança aqui no login

  salvaUserLocal() {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (usuario: Usuario) => {
        this.usuario = usuario;
        localStorage.setItem('idUser', usuario.id);
        this.router.navigate(['/usuario/dashboard']);
        localStorage.setItem('usuario', usuario.username);
      },
      error => {
        console.error('Erro ao obter dados do usuário:', error);
      }
    );
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    this.showForgotPassword = true;
    this.cadastrando = false; // Certifique-se de que o formulário de cadastro está escondido
  }

  sendForgotPasswordEmail() {
    this.authService.forgotPassword(this.forgotEmail).subscribe(
      (response: any) => {
        this.mensagemSucesso = 'E-mail de recuperação de senha enviado com sucesso!';
        this.showForgotPassword = false; // Opcional: esconde o formulário após o envio do email
        this.forgotEmail = '';
      },
      error => {
        this.errors = ['Erro ao enviar e-mail de recuperação de senha.'];
      }
    );
  }

  cancelForgotPassword() {
    this.showForgotPassword = false;
    this.forgotEmail = '';
  }

  validatePassword() {
    this.passwordValidations.minLength = this.password.length >= 8;
    this.passwordValidations.uppercase = /[A-Z]/.test(this.password);
    this.passwordValidations.lowercase = /[a-z]/.test(this.password);
    this.passwordValidations.number = /\d/.test(this.password);
    this.passwordValidations.specialChar = /[!@#$%^&*]/.test(this.password);
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
    const passwordInput = document.querySelector('input[name="password"]');
    if (passwordInput) {
      passwordInput.setAttribute('type', this.passwordVisible ? 'text' : 'password');
    }
  }
}