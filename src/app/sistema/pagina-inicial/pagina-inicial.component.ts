import { Component, OnInit, HostListener, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../login/usuario';
import { Permissao } from '../../login/Permissao';
import { TipoUsuario } from '../../login/enums/tipo-usuario';
import { TipoUsuarioDescricao } from '../../login/enums/tipo-usuario-descricao';
import { CardPlanoComponent } from '../../shared/card-plano/card-plano.component';
import { FaqItem, FAQLIST, FEATURES, LISTA_MATERIAL, Professor, PROFESSORESAULAS, PROFESSORESCOMENTADORES, RESULTADOS } from './info_mock';


@Component({
  selector: 'app-pagina-inicial',
  templateUrl: './pagina-inicial.component.html',
  styleUrls: ['./pagina-inicial.component.css']
})
export class PaginaInicialComponent implements OnInit {

  resultados = RESULTADOS;
  faqList: FaqItem[] = FAQLIST;
  features = FEATURES;
  professoresAulas = PROFESSORESAULAS;
  professoresComentadores = PROFESSORESCOMENTADORES;
  materiais = LISTA_MATERIAL;


  password: string = '';
  nome: string = '';
  telefone: string = '';
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

  transformStyle = 'translateX(0%)';
  transitionStyle = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
  isAnimating = false;

  todosProfessores: Professor[] = [];
  startIndexProfessores = 0;
  itemsPorSlide = 6;
  rotationInterval: any;

  modalAberto: boolean = false;
  materialSelecionado: any = null;

  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChildren('featureVideoPlayer') featureVideos!: QueryList<ElementRef>;
  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {

    this.checkActiveSection();
    this.registerForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.required],
      tipoDeEstudante: ['RESIDENTE', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.todosProfessores = [...this.professoresAulas, ...this.professoresComentadores];
    this.checkItemsPerSlide();
    window.addEventListener('resize', () => this.checkItemsPerSlide());
    this.startRotation();

    this.checkScreenSize();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    this.stopRotation();
  }


  ngAfterViewInit(): void {

    if (this.heroVideo && this.heroVideo.nativeElement) {
      this.heroVideo.nativeElement.muted = true;
      this.heroVideo.nativeElement.play().catch(err => {
        console.log('Autoplay Hero bloqueado:', err);
      });
    }

    if (this.videoPlayer && this.videoPlayer.nativeElement) {
      this.videoPlayer.nativeElement.muted = true;
      this.videoPlayer.nativeElement.play().catch(error => {
        console.log('Autoplay hero bloqueado:', error);
      });
    }
    this.playAllFeatureVideos();
    
    this.featureVideos.changes.subscribe(() => {
      this.playAllFeatureVideos();
    });
  }


  cadastrar() {
    this.errors = [];
    this.camposComErro = [];
    this.mensagensDeErro = {};

    // this.validarCampoObrigatorio('nome', 'O campo nome é obrigatório');
    this.validarCampoObrigatorio('email', 'O campo e-mail é obrigatório');
    this.validarCampoObrigatorio('telefone', 'O campo telefone é obrigatório');

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
    usuario.telefone = this.telefone;
    // usuario.nome = this.nome;
    usuario.tipoDeEstudante = this.tipoDeEstudante;

    this.authService
      .salvar(usuario, this.permissaoUsuario)
      .subscribe({
        next: (response) => {
          this.mensagemSucesso = "Cadastro realizado com sucesso! Efetue o login.";
          this.password = '';
          this.email = '';
          this.telefone = '';
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
      setTimeout(() => {
        section.scrollIntoView({ behavior: 'smooth' });
      }, 100);

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


  playAllFeatureVideos() {
    this.featureVideos.forEach((videoRef) => {
      const video = videoRef.nativeElement;
      video.muted = true;
      video.play().catch((err: any) => {
         console.log('Autoplay feature bloqueado:', err);
      });
    });
  }

  stopAutoPlay() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }


  checkItemsPerSlide() {
    const width = window.innerWidth;
    if (width < 768) {
      this.itemsPorSlide = 1;
    } else if (width < 1200) {
      this.itemsPorSlide = 4;
    } else {
      this.itemsPorSlide = 6;
    }
  }


  get professoresVisiveis() {
    if (!this.todosProfessores.length) return [];
    return this.todosProfessores.slice(this.startIndexProfessores, this.startIndexProfessores + this.itemsPorSlide);
  }

  get cardWidthPercentage(): number {
    return 100 / this.itemsPorSlide;
  }


  nextProfessor() {
    if (this.isAnimating) return;
    this.stopRotation();
    this.isAnimating = true;
    this.transitionStyle = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
    this.transformStyle = `translateX(-${this.cardWidthPercentage}%)`;
    setTimeout(() => {
      const firstItem = this.todosProfessores.shift();
      if (firstItem) {
        this.todosProfessores.push(firstItem);
      }
      this.transitionStyle = 'none';
      this.transformStyle = 'translateX(0%)';
      this.isAnimating = false;
      this.startRotation();
    }, 600);
  }


  prevProfessor() {
    if (this.isAnimating) return;
    this.stopRotation();
    this.isAnimating = true;
    this.transitionStyle = 'none';
    const lastItem = this.todosProfessores.pop();
    if (lastItem) {
      this.todosProfessores.unshift(lastItem);
    }
    this.transformStyle = `translateX(-${this.cardWidthPercentage}%)`;

    setTimeout(() => {

      this.transitionStyle = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
      this.transformStyle = 'translateX(0%)';

      setTimeout(() => {
        this.isAnimating = false;
        this.startRotation();
      }, 600);
    }, 20);
  }


  startRotation() {
    this.stopRotation();
    this.rotationInterval = setInterval(() => {

      if (!document.hidden) {
        this.nextProfessor();
      }
    }, 4000);
  }

  stopRotation() {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
    }
  }

  toggleFaq(index: number) {
    this.faqList[index].open = !this.faqList[index].open;
  }


  abrirModal(item: any) {
    this.materialSelecionado = item;
    this.modalAberto = true;
  }

  fecharModal() {
    this.modalAberto = false;
    this.materialSelecionado = null;
  }


  processarDownload(dados: any) {
    this.enviarParaGoogleSheets(dados);
    this.baixarArquivoReal();
    this.fecharModal();
  }

  enviarParaGoogleSheets(dados: any) {
    // URL de envio (Note que termina com /formResponse)
    const urlForm = 'https://docs.google.com/forms/d/e/1FAIpQLSdUQ5SvQGL-_2KDHoEmhT38GdgOCaDplhuvXvQZvF-KX5fmjA/formResponse';

    const formData = new FormData();

    formData.append('entry.1146452729', dados.nome);
    formData.append('entry.2052748158', dados.telefone);
    formData.append('entry.1482741367', dados.email || 'Não informado');
    formData.append('entry.811351103', this.materialSelecionado?.title || 'Material Desconhecido');

    fetch(urlForm, {
      method: 'POST',
      body: formData,
      mode: 'no-cors'
    })
      .then(() => {
        console.log('Lead salvo na planilha com sucesso!');
      })
      .catch(err => console.error('Erro ao salvar na planilha:', err));
  }

  baixarArquivoReal() {
    if (this.materialSelecionado && this.materialSelecionado.linkDownload) {
      const link = document.createElement('a');
      link.href = this.materialSelecionado.linkDownload;
      link.download = this.materialSelecionado.title;
      link.target = '_blank';
      link.click();
    }
  }

}
