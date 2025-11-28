import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Permissao } from 'src/app/login/Permissao';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-permissao-professor',
  templateUrl: './permissao-professor.component.html',
  styleUrls: ['./permissao-professor.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissaoProfessorComponent implements OnInit {


  alunos: Usuario[] = [];
  userData: Usuario = new Usuario;
  permissaoAluno: Permissao = Permissao.USER;
  paginatedAlunos = this.alunos.slice(0, 6);
  pageSizeAlunos = 12;
  pageIndexAlunos = 0;
  totalPagesAlunos = Math.ceil(this.alunos.length / this.pageSizeAlunos); 
  mensagemSucesso: string = ''; 
  errors: string[] = [];
  modalErrors: string[] = [];
  apiMessages: string[] = [];
  cadastrando: boolean = false;
  
  
  showModalCadastro: boolean = false;
  showModalAtualizar: boolean = false;

  submited: boolean = false;

  passwordVisible: { [key: string]: boolean } = {
    password: false,
    confirmPassword: false,
    currentPassword: false,
    newPassword: false
  };


  usuarioFormCadastro =  this.formBuilder.group({
      id: null,
      username: new FormControl('', {validators: [Validators.required]}),
      password: new FormControl('', {validators: [Validators.required]}),
      nome: new FormControl('', {validators: [Validators.required]}),
      email: new FormControl('', {validators: [Validators.required]}),
      bolsa: new FormControl(false),
      quantidadeDiasBolsa: new FormControl([null, [Validators.required, Validators.min(1)]])
    });

    usuarioFormAtualizar =  this.formBuilder.group({
      id: null,
      username: new FormControl('', {validators: [Validators.required]}),
      password: new FormControl('', {validators: [Validators.required]}),
      nome: new FormControl('', {validators: [Validators.required]}),
      email: new FormControl('', {validators: [Validators.required]})
    });


    constructor(private formBuilder: FormBuilder, private authService: AuthService,
      private cdRef: ChangeDetectorRef
    ) { 
      this.usuarioFormCadastro = this.formBuilder.group({
        id: [null],
        username: [''],
        password: [''],
        nome: [''],
        email: [''],
        bolsa: [''],
        quantidadeDiasBolsa: ['']
      })

      this.usuarioFormAtualizar = this.formBuilder.group({
        id: [null],
        username: [''],
        password: [''],
        nome: [''],
        email: ['']
      })
    }

  ngOnInit(): void {
    this.updatePaginatedAlunos();
    this.carregarAlunos();
    
   }
   
  cadastrarAlunos() {
    this.cadastrando = true; 
    const userData = this.usuarioFormCadastro.value;
    this.modalErrors = [];
    
    this.validadaoDeCadastro(userData)

    if(this.modalErrors.length > 0) {
      return;
    }
    
    let usuario: Usuario = new Usuario();
    usuario.password = userData.password;
    usuario.nome = userData.nome;
    usuario.email = userData.email;
    usuario.bolsaAssinatura = userData.bolsa;
    usuario.diasDeTeste = userData.quantidadeDiasBolsa;
    
    this.authService.salvar(usuario, this.permissaoAluno).subscribe((response) => {
      const novoUsuario = usuario;
      this.alunos.push(novoUsuario);
      this.carregarAlunos();
      this.limparTela();
      this.mensagemSucesso = response.message;
      this.modalErrors = [];
      this.closeModalCadastro();
      this.cdRef.markForCheck();

    }, (error) => {
      this.modalErrors.push(error);
      this.cdRef.markForCheck();
    })  
  } 

  consultarUsuario(id: string): void {
    this.authService.visualizarUsuarioPorId(id).subscribe((data: Usuario) => {
      
      this.usuarioFormAtualizar.patchValue({
        id: id,
        nome: data.nome,
        email: data.email,
        password: data.password
      });

      this.cdRef.markForCheck();
      
    }, (error) => {
      this.errors.push(error);
      this.cdRef.markForCheck();
      
    } )
  }
 

  carregarAlunos() {
    this.authService.visualizarAlunos().subscribe((data: Usuario[] | null) => {
      this.errors = [];
      
      if(data) {
        this.alunos = data
        this.updatePaginatedAlunos();
        return;
       }
       
       this.errors.push("Nenhum aluno cadastrado.")
       this.cdRef.markForCheck();
       
    }, (error) => {
      this.errors.push(error);
      this.cdRef.markForCheck();
    })
  }

  editarUsuario() {  
    this.cadastrando = false;  
    this.modalErrors = [];
    this.errors = [];
    this.mensagemSucesso = "";
    this.userData = {... this.usuarioFormAtualizar.value};
    this.validadaoDeCadastro(this.userData);

    if(this.modalErrors.length > 0) {
      return;
    }
    
    this.authService.atualizarUsuario(this.userData).subscribe((response) => {
      const updateUser = response;
      const index = this.alunos.findIndex(user => user.id === updateUser.id);
      
      if(index != -1) { 
        this.alunos[index] = updateUser;
        this.updatePaginatedAlunos();
      }

      this.mensagemSucesso = "Editado com sucesso";

      this.closeModalAtualizar();

    }, (error) => {
        this.modalErrors.push(error);
        this.cdRef.markForCheck();
    })
  }

  removerUsuario(id: string): void {
    if (confirm("Você tem certeza que deseja remover este usuário?")) {
        this.authService.removerUsuario(id).subscribe((response) => {
          
          this.alunos = this.alunos.filter((user) => user.id !== id);
          this.updatePaginatedAlunos();
          this.mensagemSucesso = "Excluído com sucesso";
          this.cdRef.markForCheck();  
          
        },
        (error) => {
          this.errors.push(error);  
          this.cdRef.markForCheck();
        }
        );
    }
  }

  limparTela() {
    this.usuarioFormCadastro.patchValue({
      id: '',
      username: '',
      password: '',
      nome: '',
      email: ''
    });
  }

  validadaoDeCadastro(userData: Usuario) {
    const passwordValidationErrors: string[] = [];
    if (userData.password.length < 8) {
      passwordValidationErrors.push("A senha deve ter pelo menos 8 caracteres.");
    }
    if (!/[A-Z]/.test(userData.password)) {
      passwordValidationErrors.push("A senha deve conter pelo menos uma letra maiúscula.");
    }
    if (!/[a-z]/.test(userData.password)) {
      passwordValidationErrors.push("A senha deve conter pelo menos uma letra minúscula.");
    }
    if (!/[0-9]/.test(userData.password)) {
      passwordValidationErrors.push("A senha deve conter pelo menos um número.");
    }
    if (!/[!@#$%^&*]/.test(userData.password)) {
      passwordValidationErrors.push("A senha deve conter pelo menos um caractere especial (por exemplo, !@#$%^&*).");
    }
  
    if (!userData.email) {
      passwordValidationErrors.push("O campo de email é obrigatório.");

    }
  
    if (!userData.nome) {
      passwordValidationErrors.push("O campo de nome é obrigatório.");
    }
    
    if (passwordValidationErrors.length > 0) {
      this.modalErrors = passwordValidationErrors;
      return; 
    }
  }


  updatePaginatedAlunos(): void {
    const startIndex = this.pageIndexAlunos * this.pageSizeAlunos;
    const endIndex = startIndex + this.pageSizeAlunos;
    this.paginatedAlunos = this.alunos.slice(startIndex, endIndex);
    this.totalPagesAlunos = Math.ceil(this.alunos.length / this.pageSizeAlunos);
    this.cdRef.markForCheck();

  }

  nextPageAlunos(): void {
    if (this.pageIndexAlunos < this.totalPagesAlunos - 1) {
      this.pageIndexAlunos++;
      this.updatePaginatedAlunos();
    }
  }

  previousPageAlunos(): void {
    if (this.pageIndexAlunos > 0) {
      this.pageIndexAlunos--;
      this.updatePaginatedAlunos();
    }
  }

  goToPageAlunos(pageIndex: number): void {
    this.pageIndexAlunos = pageIndex;
    this.updatePaginatedAlunos();
  }

  openModalCadastro() {
    this.showModalCadastro = true;
  }

  closeModalCadastro() {
    this.limparTela();
    this.showModalCadastro = false;
  }

  openModalAtualizar(id: string) {
    this.consultarUsuario(id);
    this.showModalAtualizar = true;
  }

  closeModalAtualizar() {
    this.showModalAtualizar = false;
  }

  togglePasswordVisibility(field: string) {
    this.passwordVisible[field] = !this.passwordVisible[field];
    const passwordInput = document.querySelector(`input[name="${field}"]`);
    if (passwordInput) {
      passwordInput.setAttribute('type', this.passwordVisible[field] ? 'text' : 'password');
    }
  }
}
