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
  nome: string = '';
  email: string = '';
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
    password: false
  };

  registerForm!: FormGroup;
  errors: string[] = [];
  camposComErro: string[] = [];
  mensagensDeErro: { [campo: string]: string } = {};
  mensagemSucesso: string = '';
  submitted = false;
  anoAtual: number = new Date().getFullYear();

  currentDepoimentoIndex = 0;
  depoimentosExibidos: any[] = [];
  carouselInterval: any;
  autoPlayInterval = 8000;
  isMobile = false;

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

  professoresAulas = [
    {
      nome: 'Gustavo Paz',
      foto: 'assets/imagens/professores/gustavo-paz.png',
      especialidade: 'Catarata', 
      experiencia: 'Oftalmologista pela Obras Sociais Irmã Dulce - Salvador. Fellowship de Catarata pelo Hospital Humberto Castro Lima.'
    },
    {
      nome: 'Mariana Melo',
      foto: 'assets/imagens/professores/mariana-melo.png',
      especialidade: 'Retina e Vítreo', 
      experiencia: 'Oftalmologista pela FAV. Fellowship de Retina e Vítreo pela FAV.'
    },
    {
      nome: 'Mariana Gurgel',
      foto: 'assets/imagens/professores/mariana-gurgel.png',
      especialidade: 'Glaucoma', 
      experiencia: 'Oftalmologista pela Fundação Altino Ventura. Fellowship em Glaucoma pela Fundação Altino Ventura.'
    },
    {
      nome: 'Sarah Nápoli',
      foto: 'assets/imagens/professores/sarah-napoli.png',
      especialidade: 'Uveíte', 
      experiencia: 'Oftalmologista pelo CLIHON - BA. Fellowship em Retina Clínica, Oncologia e Uveítes pela Unifesp - SP.'
    },
    {
      nome: 'Marcela Raposo',
      foto: 'assets/imagens/professores/marcela-raposo.png',
      especialidade: 'Córnea, Cirurgia Refrativa e Transplante', 
      experiencia: 'Oftalmologista pela Fundação Altino Ventura - Recife. Fellowship em Córnea pelo Banco de Olhos de Sorocaba.'
    },
    {
      nome: 'Lyvia Nunes',
      foto: 'assets/imagens/professores/lyvia-nunes.png',
      especialidade: 'Retina e Vítreo', 
      experiencia: 'Oftalmologista pelo Cenoft - João Pessoa. Fellowship em Retina Cirúrgica pela Fundação Altino Ventura'
    },
    {
      nome: 'Lídia Guedes',
      foto: 'assets/imagens/professores/lidia-guedes.png',
      especialidade: 'Oncologia', 
      experiencia: 'Oftalmologista pelo HC-UFPE. Fellowship em Oncologia e Ultrassonografia Ocular pela Unifesp.'
    },
    {
      nome: 'Carla Tavares',
      foto: 'assets/imagens/professores/carla-tavares.png',
      especialidade: 'Lentes de Contato', 
      experiencia: 'Oftalmologista pela Unicamp - São Paulo. Fellowship em Lentes de Contato pela Unifesp.'
    },
    {
      nome: 'Gabriela Gusmão',
      foto: 'assets/imagens/professores/gabriela-gusmao.png',
      especialidade: 'Oftalmopediatria e Estrabismo', 
      experiencia: 'Oftalmologista pela Unifesp. Fellowship em Oftalmopediatria e Estrabismo pela Unifesp.'
    },
    {
      nome: 'Letícia da Fonte',
      foto: 'assets/imagens/professores/leticia-da-fonte.png',
      especialidade: 'Retina e Vítreo',
      experiencia: 'Oftalmologista pela FAV. Fellowship em Retina e Vítreo pela FAV.'
    },
    {
      nome: 'Letícia Amorim',
      foto: 'assets/imagens/professores/leticia-amorim.png',
      especialidade: 'Glaucoma e Neuroftalmologia',
      experiencia: 'Oftalmologista pela Fundação Altino Ventura - Recife. Fellowship Glaucoma e Neuroftalmologia - Unifesp.'
    }
  ];

  professoresComentadores = [
    {
      nome: 'Antônio Cassiano',
      foto: 'assets/imagens/professores/antonio-cassiano.png',
      especialidade: 'Retina e Vítreo', 
      experiencia: 'Oftalmologista pela FAV. Fellowship de Retina e Vítreo pela FAV.'
    },
    {
      nome: 'Lyndon Serra',
      foto: 'assets/imagens/professores/lyndon-serra.png',
      especialidade: 'Glaucoma', 
      experiencia: 'Oftalmologista pela FAMENE. Fellowship em Glaucoma pela FAV.'
    },
    {
      nome: 'Clara Menezes',
      foto: 'assets/imagens/professores/clara-menezes.png',
      especialidade: 'Q-Bank Team', 
      experiencia: 'Residente de Oftalmologia na Escola Cearense'
    },
    {
      nome: 'Hélio Ferreira',
      foto: 'assets/imagens/professores/helio-ferreira.png',
      especialidade: 'Q-Bank Team', 
      experiencia: 'Residente de Oftalmologia - SEOPE'
    },
    {
      nome: 'Matheus Leal',
      foto: 'assets/imagens/professores/matheus-leal.png',
      especialidade: 'Q-Bank Team', 
      experiencia: 'Residente de Oftalmologia - FAV'
    },
    {
      nome: 'Mateus Araújo',
      foto: 'assets/imagens/professores/mateus-araujo.png',
      especialidade: 'Córnea e Refrativa', 
      experiencia: 'Oftalmologista pelo Hospital Universitário Onofre Lopes - Natal. Fellowship Córnea e Refrativa pela Fundação Altino Ventura.'
    },
    {
      nome: 'Taíse Araújo',
      foto: 'assets/imagens/professores/taise-araujo.png',
      especialidade: 'Q-Bank Team',
      experiencia: 'Residente de Oftalmologia - FAV'
    }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    //localStorage.removeItem('access_token');
    this.checkActiveSection();
    this.registerForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      tipoDeEstudante: ['RESIDENTE', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.checkScreenSize();
    this.initCarousel();

    window.addEventListener('resize', () => {
      this.checkScreenSize();
      this.initCarousel();
    });

    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }



  cadastrar() {
    this.errors = [];
    this.camposComErro = [];
    this.mensagensDeErro = {};

    // this.validarCampoObrigatorio('nome', 'O campo nome é obrigatório');
    this.validarCampoObrigatorio('email', 'O campo e-mail é obrigatório');

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

    if (this.camposComErro.length > 0) {
      return;
    }

    const usuario: Usuario = new Usuario();
    usuario.password = this.password;
    usuario.email = this.email;
    // usuario.nome = this.nome;
    usuario.tipoDeEstudante = this.tipoDeEstudante;

    this.authService
      .salvar(usuario, this.permissaoUsuario)
      .subscribe({
        next: (response) => {
          this.mensagemSucesso = "Cadastro realizado com sucesso! Efetue o login.";
          this.password = '';
          this.email = '';
          // this.nome = '';
          this.tipoDeEstudante = '';
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

  onPlanoSelecionado(plano: string) {
    this.scrollToSection('hero');
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

  @HostListener('window:scroll')
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

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  initCarousel() {
    const itemsToShow = this.isMobile ? 1 : 2;

    this.depoimentosExibidos = this.depoimentos.slice(0, itemsToShow);
    this.currentDepoimentoIndex = 0;
  }

  nextDepoimento() {
    this.stopAutoPlay();
    const itemsToShow = this.isMobile ? 1 : 2;


    const gridElement = document.querySelector('.depoimentos-grid') as HTMLElement;
    if (gridElement) {
      gridElement.style.opacity = '0';
      gridElement.style.transform = 'translateX(-15px)';

      setTimeout(() => {

        this.currentDepoimentoIndex = (this.currentDepoimentoIndex + 1) % (this.depoimentos.length - itemsToShow + 1);
        this.depoimentosExibidos = this.depoimentos.slice(this.currentDepoimentoIndex, this.currentDepoimentoIndex + itemsToShow);


        setTimeout(() => {
          gridElement.style.opacity = '1';
          gridElement.style.transform = 'translateX(0)';
        }, 50);
      }, 300);
    } else {

      this.currentDepoimentoIndex = (this.currentDepoimentoIndex + 1) % (this.depoimentos.length - itemsToShow + 1);
      this.depoimentosExibidos = this.depoimentos.slice(this.currentDepoimentoIndex, this.currentDepoimentoIndex + itemsToShow);
    }

    this.startAutoPlay();
  }

  prevDepoimento() {
    this.stopAutoPlay();
    const itemsToShow = this.isMobile ? 1 : 2;


    const gridElement = document.querySelector('.depoimentos-grid') as HTMLElement;
    if (gridElement) {
      gridElement.style.opacity = '0';
      gridElement.style.transform = 'translateX(15px)';

      setTimeout(() => {

        this.currentDepoimentoIndex = (this.currentDepoimentoIndex - 1 + this.depoimentos.length - itemsToShow + 1) % (this.depoimentos.length - itemsToShow + 1);
        this.depoimentosExibidos = this.depoimentos.slice(this.currentDepoimentoIndex, this.currentDepoimentoIndex + itemsToShow);


        setTimeout(() => {
          gridElement.style.opacity = '1';
          gridElement.style.transform = 'translateX(0)';
        }, 50);
      }, 300);
    } else {

      this.currentDepoimentoIndex = (this.currentDepoimentoIndex - 1 + this.depoimentos.length - itemsToShow + 1) % (this.depoimentos.length - itemsToShow + 1);
      this.depoimentosExibidos = this.depoimentos.slice(this.currentDepoimentoIndex, this.currentDepoimentoIndex + itemsToShow);
    }

    this.startAutoPlay();
  }

  goToDepoimento(index: number) {
    this.stopAutoPlay();
    const itemsToShow = this.isMobile ? 1 : 2;


    if (index >= 0 && index <= this.depoimentos.length - itemsToShow) {

      const gridElement = document.querySelector('.depoimentos-grid') as HTMLElement;
      if (gridElement) {
        gridElement.style.opacity = '0';

        setTimeout(() => {

          this.currentDepoimentoIndex = index;
          this.depoimentosExibidos = this.depoimentos.slice(this.currentDepoimentoIndex, this.currentDepoimentoIndex + itemsToShow);


          setTimeout(() => {
            gridElement.style.opacity = '1';
            gridElement.style.transform = 'translateX(0)';
          }, 50);
        }, 300);
      } else {

        this.currentDepoimentoIndex = index;
        this.depoimentosExibidos = this.depoimentos.slice(this.currentDepoimentoIndex, this.currentDepoimentoIndex + itemsToShow);
      }
    }

    this.startAutoPlay();
  }

  startAutoPlay() {
    this.carouselInterval = setInterval(() => {
      this.nextDepoimento();
    }, this.autoPlayInterval);
  }

  stopAutoPlay() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }
}
