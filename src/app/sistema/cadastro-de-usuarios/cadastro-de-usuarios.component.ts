import { Component, ViewChild } from "@angular/core";
import { Usuario } from "src/app/login/usuario";
import { Permissao } from "src/app/login/Permissao";
import { Router } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { StripeService } from "src/app/services/stripe.service";

@Component({
  selector: 'app-cadastro-de-usuarios',
  templateUrl: './cadastro-de-usuarios.component.html',
  styleUrls: ['./cadastro-de-usuarios.component.css']
})


export class CadastroUsuariosComponent {
  username: string = '';
  password: string = '';
  nome: string = '';
  email: string = '';
  telefone: string = '';
  cidade: string = '';
  estado: string = '';
  mensagemSucesso: string = '';
  errors: string[] = [];
  usuario!: Usuario;
  tiposPermissao = [ Permissao.USER, Permissao.PROFESSOR ];
  confirmPassword: string = '';
  tipoUsuario: string = '';
  filtro: string = ''; 
  consentimento: boolean = false;
  idUsuario!: number;
  editando: boolean = false;
  usuarioEdit: Usuario = new Usuario();


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
    confirmPassword: false,
  };

  constructor(private router: Router, private authService: AuthService, private stripeService: StripeService) {}


  togglePasswordVisibility(field: string) {
    this.passwordVisible[field] = !this.passwordVisible[field];
    const passwordInput = document.querySelector(`input[name="${field}"]`);
    if (passwordInput) {
      passwordInput.setAttribute('type', this.passwordVisible[field] ? 'text' : 'password');
    }
  }

  
  cadastrar(): void {
    
    this.errors = [];
    const passwordValidationErrors: string[] = [];

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

    if (!this.username) {
      passwordValidationErrors.push("O campo de login é obrigatório.");
    }


    if (!this.email) {
      passwordValidationErrors.push("O campo de email é obrigatório.");
    }


    if (!this.nome) {
      passwordValidationErrors.push("O campo de nome é obrigatório.");
    }

    if (passwordValidationErrors.length > 0) {
      this.errors = passwordValidationErrors;
      return; 
    }

    if (this.password !== this.confirmPassword) {
      this.errors.push("As senhas não coincidem.");
      return; 
    }

    if(!this.tipoUsuario) {
      this.errors.push("O campo de permissão de usuário é obrigatório");
    }

    const novoUsuario: Usuario = new Usuario;

    novoUsuario.username = this.username;
    novoUsuario.password = this.password;
    novoUsuario.email = this.email;
    novoUsuario.nome = this.nome;
    novoUsuario.confirmPassword = this.confirmPassword;
    novoUsuario.telefone = this.telefone;
    novoUsuario.cidade = this.cidade;
    novoUsuario.estado = this.estado;

    this.authService.salvar(novoUsuario, this.tipoUsuario) 
    .subscribe( response =>  {
        this.mensagemSucesso = "Usuário cadastrado com sucesso";
        this.limparFormulario();
    
    }, errorResponse => {
        if (errorResponse.status === 401) {
            // Trata o erro de token expirado
            this.errors = ['Sessão expirada. Por favor, faça login novamente.'];
            localStorage.removeItem('access_token'); // Remove o token expirado
            this.router.navigate(['/login']); // Redireciona para a página de login
        }else if (errorResponse.status === 400) {
          // Exibe a mensagem de erro vinda do back-end
          this.errors = [errorResponse.error];
        }else {
            this.errors = ['Erro ao cadastrar o usuário.'];
        }
    } )

  }

  consultarUsuario(id: number): void {
    this.authService.obterUsuario(id).subscribe(
      (user: Usuario) => {
        console.log(user);
        this.usuario = user;
        this.usuarioEdit = {... user};

      }, (error) => {
        console.error('Erro ao consultar usuário:', error);
      })
  }

  preparaEdit(event: Event): void {
    event.preventDefault();
    this.editando = true;
  }
  
 
  cancelaEdit(): void{
    this.editando = false;
  }

 
  editarUsuario(): void {
    	this.authService
        .atualizarUsuario(this.usuarioEdit)
        .subscribe((data) => {
          console.log("Atualizado com sucesso");
          this.consultarUsuario(this.usuarioEdit.id as unknown as number);
          this.cancelaEdit();
          this.limpaCampos();

        }, (error) => { 
          console.error("Houve algum erro ", error);
        })
  }

  removerUsuario(): void {
    if (confirm("Você tem certeza que deseja remover este usuário?")) {
        this.authService.removerUsuario(this.usuario).subscribe(
            (response) => {
                console.log("Removido com sucesso", response);
                this.limpaCampos(); // Limpa os campos após a remoção
            },
            (error) => {
                if (error.status === 404) {
                    console.error("Usuário não encontrado:", error.message);
                } else {
                    console.error("Houve algum erro:", error.message);
                }
            }
        );
    }
}


  limpaCampos(): void {
    this.usuarioEdit = new Usuario(); 

}


  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  validatePassword() {
    this.passwordValidations.minLength = this.password.length >= 8;
    this.passwordValidations.uppercase = /[A-Z]/.test(this.password);
    this.passwordValidations.lowercase = /[a-z]/.test(this.password);
    this.passwordValidations.number = /\d/.test(this.password);
    this.passwordValidations.specialChar = /[!@#$%^&*]/.test(this.password);
  }

  limparFormulario(): void {
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.nome = '';
    this.email = '';
    this.telefone = '';
    this.cidade = '';
    this.estado = '';
    this.tipoUsuario = '';
    this.errors = [];
  }
}
