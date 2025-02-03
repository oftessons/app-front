import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Permissao } from 'src/app/login/Permissao';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-permissao-professor',
  templateUrl: './permissao-professor.component.html',
  styleUrls: ['./permissao-professor.component.css']
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
  apiErrors: string[] = [];
  
  showModalCadastro: boolean = false;
  showModalAtualizar: boolean = false;

  submited: boolean = false;

  usuarioForm =  this.formBuilder.group({
      id: null,
      username: new FormControl('', {validators: [Validators.required]}),
      password: new FormControl('', {validators: [Validators.required]}),
      confirmPassword: new FormControl('', {validators: [Validators.required]}),
      nome: new FormControl('', {validators: [Validators.required]}),
      email: new FormControl('', {validators: [Validators.required]}),
      telefone: new FormControl('', {validators: [Validators.required]}),
      cidade: new FormControl('', ),
      estado: new FormControl('', ),
    });


    constructor(private formBuilder: FormBuilder, private authService: AuthService) { 
      this.usuarioForm = this.formBuilder.group({
        id: [null],
        username: [''],
        password: [''],
        confirmPassword: [''],
        nome: [''],
        email: [''],
        telefone: [''],
        cidade: [''],
        estado: [''],
      });
    }

  ngOnInit(): void {
    this.updatePaginatedAlunos();
    this.carregarAlunos();
    
   }

   
  cadastrarAlunos() {
    const userData = this.usuarioForm.value;
    this.errors = [];
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
  
    if (!userData.username) {
      passwordValidationErrors.push("O campo de login é obrigatório.");
    }
  
    if (!userData.email) {
      passwordValidationErrors.push("O campo de email é obrigatório.");
      console.log(this.errors);

    }
  
    if (!userData.nome) {
      passwordValidationErrors.push("O campo de nome é obrigatório.");
    }
    
    
    if (passwordValidationErrors.length > 0) {
      this.errors = passwordValidationErrors;
      return; 
    }
  
    if (userData.password !== userData.confirmPassword) {
        this.errors.push("As senhas não coincidem.");
        return; 
    }

    let usuario: Usuario = new Usuario();
    usuario.username = userData.username;
    usuario.password = userData.password;
    usuario.confirmPassword = userData.confirmPassword;
    usuario.nome = userData.nome;
    usuario.email = userData.email;
    usuario.telefone = userData.telefone;
    usuario.cidade = userData.cidade;
    usuario.estado = userData.estado;
    
    this.authService.salvar(usuario, this.permissaoAluno).subscribe((response) => {
      this.mensagemSucesso = "Cadastro realizado com sucesso!";
      this.usuarioForm.setValue({
        username:  '',
        password: '',
        confirmPassword: '',
        nome: '',
        email: '',
        telefone: '',
        cidade: '',
        estado: ''
      })
      this.errors = []

      
    }, (error) => {
      console.error(error);
    })  
  } 

  consultarUsuario(id: string): void {
    this.authService.visualizarUsuarioPorId(id).subscribe((data: Usuario) => {
      this.usuarioForm.patchValue({
        id: id,
        username:  data.username,
        nome: data.nome,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        telefone: data.telefone,
        cidade: data.cidade,
        estado: data.estado        
      })
      
    }, (error) => {
      console.error("Não foi possível fazer essa manipulacao ", error);
    } )
  }
 

  carregarAlunos() {
    this.authService.visualizarAlunos().subscribe((data) => {
      this.alunos = [... data];
      this.paginatedAlunos = this.alunos;
      this.totalPagesAlunos = Math.ceil(this.alunos.length / this.pageSizeAlunos);  

    }, (error) => {
      if(error.status === 404) {
        this.apiErrors.push("Nenhum usuário encontrado na base de dados");
      } 

    })
  }

  editarUsuario() {    
    this.userData = { ... this.usuarioForm.value };

    this.authService.atualizarUsuario(this.userData).subscribe((response) => {
      this.closeModalAtualizar();

    }, (error) => {
      console.error("Houve algum erro ao atualizar o usuário");
    })
  }

  removerUsuario(id: string): void {
    if (confirm("Você tem certeza que deseja remover este usuário?")) {
        this.authService.removerUsuario(id).subscribe(
            (response) => {
                console.log("Removido com sucesso", response);
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

  updatePaginatedAlunos(): void {
    const startIndex = this.pageIndexAlunos * this.pageSizeAlunos;
    const endIndex = startIndex + this.pageSizeAlunos;
    this.paginatedAlunos = this.alunos.slice(startIndex, endIndex);
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
    console.log("Valor de showModal:", this.showModalCadastro);
  }

  closeModalCadastro() {
    console.log("Fechando modal...");
    this.showModalCadastro = false;
  }

  openModalAtualizar(id: string) {
    this.consultarUsuario(id);
    this.showModalAtualizar = true;
    console.log("Valor de showModal:", this.showModalAtualizar);
  }

  closeModalAtualizar() {
    console.log("Fechando modal...");
    this.showModalAtualizar = false;
  }
}
