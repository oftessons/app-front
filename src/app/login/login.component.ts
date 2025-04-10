import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Usuario } from './usuario';
import { Permissao } from './Permissao';
import { TipoUsuario } from './enums/tipo-usuario';
import { TipoUsuarioDescricao } from './enums/tipo-usuario-descricao';

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
  forgotEmail: string = '';
  showForgotPassword: boolean = false;
  tipoDeEstudante: string = '';
  usuario!: Usuario | null;
  permissaoUsuario: Permissao = Permissao.USER;
  
  tiposUsuario = Object.keys(TipoUsuario).map(key => ({
    key,
    value: TipoUsuario[key as keyof typeof TipoUsuario],
    description: TipoUsuarioDescricao[TipoUsuario[key as keyof typeof TipoUsuario]]
  }));
  
  confirmPasswordError: string | null = null;
  confirmPassword: string = '';
  consentimento: boolean = false;  

  showTooltip: boolean = false;
  passwordValidations = {
    minLength: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  };

  
  passwordVisible: { [key: string]: boolean } = {
    password: false,
    confirmPassword: false
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  onSubmit() {
    this.authService.tentarLogar(this.username, this.password).subscribe(
        (response: any) => {
          
            // Salva o token de acesso no localStorage
            const access_token = response.access_token;
            localStorage.setItem('access_token', access_token);

            // Obtém e salva o ID do usuário
            const userId = this.authService.getUserIdFromToken() ?? ''; // Garante que será uma string vazia se for null
            localStorage.setItem('user_id', userId || '');

            // Cria o objeto usuário
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
            
            // Redireciona com base na permissão do usuário
            if (usuario.permissao === 'ROLE_ADMIN' || usuario.permissao === 'ROLE_USER' || 
              usuario.permissao === 'ROLE_PROFESSOR') {
              this.router.navigate(['/usuario/inicio']);
            } else {
              this.router.navigate(['/forbidden']); // Caso não tenha permissão
            }

        },
        errorResponse => {
          if (errorResponse.status === 401 && errorResponse.error === 'CadastroIncompleto') {
            this.errors = ['Faça o seu cadastro, entre e ative o seu plano para acessar a plataforma.'];
          } else {
            this.errors = ['Usuário e/ou senha incorreto(s).'];
          }
        }        
    );
}

  preparaCadastrar(event: Event) {
    event.preventDefault();
    this.cadastrando = true;
    this.showForgotPassword = false; 
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

  // Validação de campo de login
  if (!this.username) {
    passwordValidationErrors.push("O campo de login é obrigatório.");
  }

  // Validação de campo de email
  if (!this.email) {
    passwordValidationErrors.push("O campo de email é obrigatório.");
  }

  // Validação de campo de nome
  if (!this.nome) {
    passwordValidationErrors.push("O campo de nome é obrigatório.");
  }

  if(!this.tipoDeEstudante) {
    passwordValidationErrors.push("Selecione o tipo de usuário.");
  }

  // Se houver erros de validação, armazene-os em this.errors e não prossiga
  if (passwordValidationErrors.length > 0) {
    this.errors = passwordValidationErrors;
    return; // Interrompe a execução do método
  }

  // Validação de confirmação de senha
  if (this.password !== this.confirmPassword) {
      this.errors.push("As senhas não coincidem.");
      return; // Interrompe a execução do método
  }

    const usuario: Usuario = new Usuario();
    usuario.username = this.username;
    usuario.password = this.password;
    usuario.email = this.email;
    usuario.nome = this.nome;
    usuario.confirmPassword = this.confirmPassword;
    usuario.telefone = this.telefone;
    usuario.cidade = this.cidade;
    usuario.estado = this.estado;
    usuario.tipoDeEstudante = this.tipoDeEstudante;

    this.authService
        .salvar(usuario, this.permissaoUsuario)
        .subscribe( response => {
          this.mensagemSucesso = "Cadastro realizado com sucesso! Efetue o login.";
          this.cadastrando = false;
          this.username = '';
          this.password = '';
          this.email = '';
          this.nome = '';
          this.confirmPassword = '';
          this.telefone = '';
          this.cidade = '';
          this.estado = '';
          this.errors = [];
        },  errorResponse => {
          if (errorResponse.status === 401) {
              // Trata o erro de token expirado
              this.errors = ['Sessão expirada. Por favor, faça login novamente.'];
              localStorage.removeItem('access_token'); // Remove o token expirado
              this.router.navigate(['/login']); // Redireciona para a página de login
          } else if (errorResponse.status === 400) {
            // Exibe a mensagem de erro vinda do back-end
            this.errors = [errorResponse.error];
          } else {
              this.errors = ['Erro ao cadastrar o usuário.'];
          }
      }
    );
  }

  salvaUserLocal() {
    this.authService.obterUsuarioAutenticadoDoBackend().subscribe(
      (usuario: Usuario) => {
        this.usuario = usuario;
        localStorage.setItem('idUser', usuario.id);
        this.router.navigate(['/usuario/inicio']);
        localStorage.setItem('usuario', usuario.username);
      },
      error => {
       // console.error('Erro ao obter dados do usuário:', error);
      }
    );
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    this.showForgotPassword = true;
    this.cadastrando = false; 
  }

  sendForgotPasswordEmail() {
    this.authService.forgotPassword(this.forgotEmail).subscribe(
      (response: any) => {
        this.mensagemSucesso = response.message;
        this.showForgotPassword = false; 
        this.forgotEmail = '';
      },
      (error) => {
        console.log(error);
        if (error.status === 400) {
          this.errors = ['E-mail não encontrado ou inválido.'];
        } else if (error.status === 500) {
          this.errors = ['Erro ao enviar e-mail de recuperação de senha.'];
        } else {
          this.errors = ['Erro desconhecido ao enviar e-mail de recuperação de senha.'];
        }
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

  togglePasswordVisibility(field: string) {
    this.passwordVisible[field] = !this.passwordVisible[field];
    const passwordInput = document.querySelector(`input[name="${field}"]`);
    if (passwordInput) {
      passwordInput.setAttribute('type', this.passwordVisible[field] ? 'text' : 'password');
    }
  }

  validateConfirmPassword() {
    if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'As senhas não coincidem';
    } else {
      this.confirmPasswordError = null;
    }
  }
}