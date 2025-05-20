import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../login/usuario';
import { Permissao } from '../../login/Permissao';
import { TipoUsuario } from '../../login/enums/tipo-usuario';
import { TipoUsuarioDescricao } from '../../login/enums/tipo-usuario-descricao';

@Component({
  selector: 'app-pagina-inicial',
  templateUrl: './pagina-inicial.component.html',
  styleUrls: ['./pagina-inicial.component.css']
})
export class PaginaInicialComponent implements OnInit {
  password: string = '';
  confirmPassword: string = '';
  nome: string = '';
  email: string = '';
  telefone: string = '';
  cidade: string = '';
  estado: string = '';
  tipoDeEstudante: string = '';
  consentimento: boolean = false;

  permissaoUsuario: Permissao = Permissao.USER;
  tiposUsuario = Object.keys(TipoUsuario).map(key => ({
    key,
    value: TipoUsuario[key as keyof typeof TipoUsuario],
    description: TipoUsuarioDescricao[TipoUsuario[key as keyof typeof TipoUsuario]]
  }));

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
  
  registerForm!: FormGroup;
  errors: string[] = [];
  mensagemSucesso: string = '';
  submitted = false;

  depoimentos = [
    {
      name: 'Dr. Carlos Mendes',
      role: 'Oftalmologista, São Paulo',
      content: 'A plataforma Oftlessons transformou minha preparação para as provas de residência. O conteúdo é muito bem organizado e as videoaulas são excelentes.',
      image: 'assets/imagens/perfil-d.svg'
    },
    {
      name: 'Dra. Amanda Silva',
      role: 'Residente R3, Belo Horizonte',
      content: 'As questões disponíveis são de alta qualidade e os simulados me ajudaram muito a identificar pontos de melhoria no meu estudo.',
      image: 'assets/imagens/perfil-d.svg'
    },
    {
      name: 'Dr. Rafael Oliveira',
      role: 'Especialista em Retina, Rio de Janeiro',
      content: 'O módulo de Retina é excepcional. Os vídeos são claros e objetivos, e o material complementar é muito útil para a prática clínica.',
      image: 'assets/imagens/perfil-d.svg'
    }
  ];

  plans = [
    {
      title: 'Mensal',
      price: 'R$ 397,00',
      features: [
        'Acesso a todos os módulos de aulas',
        'Banco de questões completo',
        'Simulados personalizados',
        'Acesso via aplicativo e web'
      ],
      recommended: false,
      slug: 'mensal'
    },
    {
      title: 'Semestral',
      price: 'R$ 1.797,00',
      features: [
        'Todos os benefícios do plano Mensal',
        'Economia de 25%',
        'Material de apoio exclusivo',
        'Suporte premium'
      ],
      recommended: true,
      slug: 'semestral'
    },
    {
      title: 'Anual',
      price: 'R$ 2.997,00',
      features: [
        'Todos os benefícios do plano Semestral',
        'Economia de 37%',
        'Mentorias exclusivas',
        'Acesso vitalício a atualizações do período'
      ],
      recommended: false,
      slug: 'anual'
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', Validators.required],
      tipoDeEstudante: ['RESIDENTE', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  cadastrar() {
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

  if (!this.email) {
    passwordValidationErrors.push("O campo de email é obrigatório.");
  }
  if (!this.nome) {
    passwordValidationErrors.push("O campo de nome é obrigatório.");
  }
  if (!this.cidade) {
    passwordValidationErrors.push("O campo de cidade é obrigatório.");
  }
  if (!this.estado) {
    passwordValidationErrors.push("O campo de estado é obrigatório.");
  }
  if (!this.telefone) {
    passwordValidationErrors.push("O campo de telefone é obrigatório.");
  }
  if (!this.tipoDeEstudante) {
    passwordValidationErrors.push("Selecione o tipo de usuário.");
  }

  // Se houver erros de validação, armazene-os e não prossiga
  if (passwordValidationErrors.length > 0) {
    this.errors = passwordValidationErrors;
    return;
  }

  // Validação de confirmação de senha
  if (this.password !== this.confirmPassword) {
    this.errors.push("As senhas não coincidem.");
    return;
  }

  const usuario: Usuario = new Usuario();
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
    .subscribe({
      next: (response) => {
        this.mensagemSucesso = "Cadastro realizado com sucesso! Efetue o login.";

        this.password = '';
        this.email = '';
        this.nome = '';
        this.confirmPassword = '';
        this.telefone = '';
        this.cidade = '';
        this.estado = '';
        this.errors = [];
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (errorResponse) => {
        if (errorResponse.status === 401) {
          this.errors = ['Sessão expirada. Por favor, faça login novamente.'];
          localStorage.removeItem('access_token');
          this.router.navigate(['/login']);
        } else if (errorResponse.status === 400) {
          this.errors = [errorResponse.error];
        } else {
          this.errors = ['Erro ao cadastrar o usuário.'];
        }
      }
    });
  }

  navigateToPlans() {
    this.router.navigate(['/planos']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  scrollToSection(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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

}
