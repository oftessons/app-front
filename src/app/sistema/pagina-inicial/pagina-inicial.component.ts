import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../login/usuario';
import { Permissao } from '../../login/Permissao';
import { TipoUsuario } from '../../login/enums/tipo-usuario';
import { TipoUsuarioDescricao } from '../../login/enums/tipo-usuario-descricao';
import { CardPlanoComponent } from '../../shared/card-plano/card-plano.component';

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
  camposComErro: string[] = [];
  mensagensDeErro: { [campo: string]: string } = {};
  mensagemSucesso: string = '';
  submitted = false;
  anoAtual: number = new Date().getFullYear();

  depoimentos = [
    {
      name: 'Paloma Schürmann Ribeiro',
      role: 'Santa Catarina',
      content: 'A plataforma da Oftlessons têm auxiliado muito na sedimentação do conteúdo estudado, desde a grande variedade de temas, até a organização de questões em diferentes níveis de dificuldade, de forma que possa identificar minhas fragilidades e entender melhor com os comentários das questões.',
      image: 'assets/imagens/depoimentos/paloma.jpg'
    },
    {
      name: 'Carla Tavares',
      role: 'Pernambuco',
      content: 'Através das questões e comentários, é possível fazer uma boa revisão dos assuntos mais contemplados na prova do CBO. Ótima ferramenta de estudo 👏!',
      image: 'assets/imagens/depoimentos/carla.jpg'
    },
    {
      name: 'Dhiego Carvalho',
      role: 'Ceará',
      content: 'Estou extremamente satisfeito com o aplicativo de questões. O conteúdo é bem organizado, com muitas questões, de todos os assuntos, atualizadas e comentadas de forma clara e objetiva. Além disso, a interface é intuitiva e facilita muito o estudo no dia a dia. Tem sido uma ferramenta essencial na minha preparação e formação, pois ajuda a fixar os principais temas cobrados. Recomendo para todos que estão se preparando para a prova de título!',
      image: 'assets/imagens/depoimentos/dhiego.jpeg'
    },
    {
      name: 'Caio Barros',
      role: 'Pernambuco',
      content: 'Com as questões do Oftlessons, eu consigo não só me preparar para a prova do CBO como também revisar temas importantes para a prática do dia-a-dia da oftalmologia.',
      image: 'assets/imagens/depoimentos/caio.jpg'
    }
  ];

  planos = [
    {
      titulo: 'Gratuito',
      preco: 0.00,
      descricao: [
        'Acesso a um número limitado de questões.',
        'Ideal para quem está começando ou quer experimentar a plataforma.',
        'Sem compromisso, totalmente gratuito.'
      ],
      corCabecalho: '#253c66',
      recomendado: false,
      mostrarPlanoGratuito: true,
      monstrarPreco: false,
    },
    {
      titulo: 'Mensal',
      preco: 397.00,
      descricao: [
        'Revisão rápida sobre qualquer tema ou assunto.',
        'Ideal para quem busca agilidade no aprendizado.',
        'Acesso flexível ao conteúdo essencial.'
      ],
      corCabecalho: '#253c66',
      recomendado: false,
    },
    {
      titulo: 'Semestral',
      preco: 116.16,
      mostrarPorMes: true,
      descricao: [
        'Exploração detalhada do acervo da plataforma.',
        'Estudo com tempo para absorver conhecimento.',
        'Perfeito para uma aprendizagem profunda e completa.'
      ],
      corCabecalho: '#041E4E',
      textoAdicional: 'R$697,00 por 6 meses',
      recomendado: false,
    },
    {
      titulo: 'Anual',
      preco: 99.75,
      mostrarPorMes: true,
      descricao: [
        'Utilize todas as funcionalidades da plataforma.',
        'Melhore seu aprendizado de forma abrangente.',
        'Acesso ao banco de questões com reset duas vezes ao ano.'
      ],
      corCabecalho: '#0F1934',
      textoAdicional: 'R$1.197,00 por 1 ano',
      recomendado: true,
    },
    //{
    //  titulo: 'Banco + Flashcards',
    //  preco: 132.50,
    //  mostrarPorMes: true,
    //  descricao: [
    //    'Acesso completo a todos os módulos e conteúdos.',
    //    'Estude de forma rápida e eficiente com cartões de memorização.',
    //    'Ideal para quem busca uma formação abrangente e eficiente.',
    //  ],
    //  corCabecalho: '#253c66',
    //  textoAdicional: 'R$ 1.590,00 por 1 ano',
    //  recomendado: false,
    //},
    //{
    //  titulo: 'Flashcards',
    //  preco: 65.83,
    //  descricao: [
    //    'Estude de forma rápida e eficiente com cartões de memorização.',
    //    'Ideal para revisar conceitos importantes em poucos minutos.',
    //    'Método comprovado para melhorar a fixação e a recordação de informações.',
    //  ],
    //  corCabecalho: '#041E4E',
    //  textoAdicional: 'R$789,99 por 1 ano',
    //  recomendado: false,
    //}
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    localStorage.removeItem('access_token');
    this.checkActiveSection();
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
    this.errors = [];
    this.camposComErro = [];
    this.mensagensDeErro = {};

    this.validarCampoObrigatorio('nome', 'O campo nome é obrigatório');
    this.validarCampoObrigatorio('email', 'O campo e-mail é obrigatório');
    this.validarCampoObrigatorio('telefone', 'O campo telefone é obrigatório');
    this.validarCampoObrigatorio('cidade', 'O campo cidade é obrigatório');
    this.validarCampoObrigatorio('estado', 'O campo estado é obrigatório');

    if (!this.tipoDeEstudante) {
      this.adicionarErro('tipoDeEstudante', 'Selecione o tipo de usuário');
    }

    if (this.password.length < 8) {
      this.adicionarErro('password', 'A senha deve ter pelo menos 8 caracteres');
    } else if (!/[A-Z]/.test(this.password)) {
      this.adicionarErro('password', 'A senha deve conter pelo menos uma letra maiúscula');
    } else if (!/[a-z]/.test(this.password)) {
      this.adicionarErro('password', 'A senha deve conter pelo menos uma letra minúscula');
    } else if (!/[0-9]/.test(this.password)) {
      this.adicionarErro('password', 'A senha deve conter pelo menos um número');
    } else if (!/[!@#$%^&*]/.test(this.password)) {
      this.adicionarErro('password', 'A senha deve conter pelo menos um caractere especial');
    }
    
    if (this.password !== this.confirmPassword) {
      this.adicionarErro('confirmPassword', 'As senhas não coincidem');
    }

    if (this.camposComErro.length > 0) {
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
          this.mensagemSucesso = '';
          this.errors = [];
          if (errorResponse.includes('Email já cadastrado')) {
            this.adicionarErro('email', 'Email já cadastrado');
          } else {
            this.errors.push(errorResponse);
          }
        }
      });
  }

  validarCampoObrigatorio(campo: string, mensagem: string) {
    const valor = this[campo as keyof PaginaInicialComponent];
    if (!valor || (typeof valor === 'string' && valor.trim() === '')) {
      this.adicionarErro(campo, mensagem);
    }
  }

  adicionarErro(campo: string, mensagem: string) {
    if (!this.camposComErro.includes(campo)) {
      this.camposComErro.push(campo);
    }
    this.mensagensDeErro[campo] = mensagem;
  }

  obterMensagemErro(campo: string): string {
    return this.mensagensDeErro[campo] || '';
  }

  navigateToPlans() {
    this.router.navigate(['/planos']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  scrollToSection(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
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

  @HostListener('window:scroll', ['$event'])
  checkActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + window.innerHeight / 3;
    
    sections.forEach(section => {
      const sectionTop = (section as HTMLElement).offsetTop;
      const sectionHeight = (section as HTMLElement).offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-links a').forEach(link => {
          link.classList.remove('active');
        });
        
        document.querySelectorAll('.section-dot').forEach(dot => {
          dot.classList.remove('active');
        });
        
        const navLink = document.querySelector(`.nav-links a[href*="${sectionId}"]`);
        const sectionDot = document.querySelector(`.section-dot[href*="${sectionId}"]`);
        
        if (navLink) navLink.classList.add('active');

        if (sectionDot) sectionDot.classList.add('active');
      }
    });
  }
}
