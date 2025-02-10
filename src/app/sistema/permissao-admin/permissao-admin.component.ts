import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Permissao } from 'src/app/login/Permissao';
import { PermissaoDescricoes } from 'src/app/login/Permissao-descricao';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { UnaryOperator } from '@angular/compiler';

@Component({
  selector: 'app-permissao-admin',
  templateUrl: './permissao-admin.component.html',
  styleUrls: ['./permissao-admin.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissaoAdminComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'email', 'cidade', 'estado'];

  usuarios: Usuario[] = [];

  professores: Usuario[]  = []
  paginatedProfessores = this.professores.slice(0, 6);
  pageSizeProfessores = 6;
  pageIndexProfessores = 0;
  totalPagesProfessores = Math.ceil(this.professores.length / this.pageSizeProfessores);

  alunos: Usuario[] = []
  paginatedAlunos = this.alunos.slice(0, 6);
  pageSizeAlunos = 6;
  pageIndexAlunos = 0;
  totalPagesAlunos = Math.ceil(this.alunos.length / this.pageSizeAlunos);
  tiposPermissao =  [PermissaoDescricoes.ROLE_PROFESSOR, PermissaoDescricoes.ROLE_USER];
  mensagemSucesso: string = '';
  cadastrando: boolean = false;
  userData: Usuario = new Usuario(); 
  
  usuarioForm =  this.formBuilder.group({
    id: new FormControl(0,),
    username: new FormControl('', {validators: [Validators.required]}),
    password: new FormControl('', {validators: [Validators.required]}),
    confirmPassword: new FormControl('', {validators: [Validators.required]}),
    nome: new FormControl('', [Validators.required]),
    email: new FormControl('', {validators: [Validators.required]}),
    telefone: new FormControl('', {validators: [Validators.required]}),
    estado: new FormControl('', ),
    cidade: new FormControl('', ),
    tipoUsuario: new FormControl('', {validators: [Validators.required]})
  });

  showModalCadastrar: boolean = false;
  showModalAtualizar: boolean = false;
  submited: boolean = false;
  errors: string[] = [];
  modalErrors: string[] = [];

  passwordVisible: { [key: string]: boolean } = {
    password: false,
    confirmPassword: false,
    currentPassword: false,
    newPassword: false
  };
  

  constructor(private formBuilder: FormBuilder, private authService: AuthService, 
    private cdRef: ChangeDetectorRef) { 
    this.usuarioForm = this.formBuilder.group({
      id: null,
      username: [''],
      password: [''],
      confirmPassword: [''],
      nome: [''],
      email: [''],
      telefone: [''],
      cidade: [''],
      estado: [''],
      tipoUsuario: ['']
    });
  }

  ngOnInit(): void {
    this.updatePaginatedData('professores');
    this.updatePaginatedData('alunos');
    this.carregarUsuarios();
  }

  carregarUsuarios() {
    this.authService.visualizarUsuarios().subscribe((data: Usuario[] | null) => {
      if(!Array.isArray(data)) {
        this.errors.push("Nenhum aluno cadastrado.")
        this.cdRef.markForCheck();
        return;
      };

      this.usuarios = data;
      this.alunos = this.filtrarUsuariosPorPermissao('USER'); 
      this.professores = this.filtrarUsuariosPorPermissao('PROFESSOR');

      this.updatePaginatedData('alunos');
      this.updatePaginatedData('professores');
      
      this.cdRef.markForCheck();
   
      
    }, (error) => {
      this.errors.push(error);
      this.cdRef.markForCheck();
    })
  }

  cadastrarUsuarios() {
    this.cadastrando = true;
    const userData = this.usuarioForm.value;
    this.errors = [];
    this.modalErrors = [];
    this.validadaoDeCadastro(userData);

    if(this.modalErrors.length > 0) {
      return;
    }

    const usuario = new Usuario();
    usuario.username = userData.username;
    usuario.password = userData.password;
    usuario.confirmPassword = userData.confirmPassword;
    usuario.nome = userData.nome;
    usuario.email = userData.email;
    usuario.telefone = userData.telefone;
    usuario.cidade = userData.cidade;
    usuario.estado = userData.estado;
    usuario.tipoUsuario = userData.tipoUsuario;
    const permissao = this.mapearDescricaoParaEnum(userData.tipoUsuario);

    this.authService.salvar(usuario, permissao).subscribe((response) => {
      this.mensagemSucesso = response.message;
  
      this.carregarUsuarios();

      this.limparTela();

      this.closeModalCadastrar();

      this.cdRef.detectChanges();
      

    },(error => {
      this.modalErrors.push(error);
      this.cdRef.markForCheck();
      
    }))
  }


  consultarUsuario(id: string) {
    this.authService.visualizarUsuarioPorId(id).subscribe((response: Usuario) => {
      
      this.usuarioForm.patchValue({
        id: id,
        username: response.username,
        nome: response.nome,
        email: response.email,
        password: response.password,
        confirmPassword: undefined,
        telefone: response.telefone,
        cidade: response.cidade,
        estado: response.estado,
        tipoUsuario: undefined
      })

      this.cdRef.markForCheck();
    })
  }


  editarUsuarios() {
    this.cadastrando = false;
    this.mensagemSucesso = "";
    this.errors = [];
    this.modalErrors = [];
    this.userData = {... this.usuarioForm.value};
    this.validadaoDeCadastro(this.userData);
    
    if(this.modalErrors.length > 0) {
      return;
    }

    this.authService.atualizarUsuario(this.userData).subscribe((response) => {
      const updateUser = response;

      const tiposUsuarios = {
        alunos: this.alunos,
        professores: this.professores
      };
           
      for (const key of Object.keys(tiposUsuarios) as (keyof typeof tiposUsuarios)[]) {
        const usuarios = tiposUsuarios[key];
        const index = tiposUsuarios[key].findIndex((user) => user.id === updateUser.id);

        if(index != -1) {
          usuarios[index] = updateUser;
          this.updatePaginatedData(key);

        }
      }

      this.mensagemSucesso = "Editado com sucesso";

      this.closeModalAtualizar();
      this.cdRef.markForCheck();

    }, (error) => {
      this.modalErrors.push(error);
      this.cdRef.markForCheck();
    })
  }

  removerUsuario(id: string) {
    if (confirm("Você tem certeza que deseja remover este usuário?")) {
      this.authService.removerUsuario(id).subscribe((response) => {
        
        this.alunos = this.alunos.filter((user) => user.id !== id);
        this.professores = this.professores.filter((prof) => prof.id !== id);
        this.updatePaginatedData('alunos');
        this.updatePaginatedData('professores');
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

  mapearDescricaoParaEnum(selecao: string): Permissao {

    const enumeracao: Record<string, Permissao> = {
      "USER": Permissao.USER,
      "PROFESSOR": Permissao.PROFESSOR
    }

    return enumeracao[selecao] || Permissao.USER;

  } 

  limparTela() {
    this.usuarioForm.patchValue({
      id: '',
      username: '',
      password: '',
      confirmPassword: '',
      nome: '',
      email: '',
      telefone: '',
      estado: '',
      cidade: '',
      tipoUsuario: ''
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
  
    if (!userData.username) {
      passwordValidationErrors.push("O campo de login é obrigatório.");
    }
  
    if (!userData.email) {
      passwordValidationErrors.push("O campo de email é obrigatório.");

    }
  
    if (!userData.nome) {
      passwordValidationErrors.push("O campo de nome é obrigatório.");
    }

    if(!userData.tipoUsuario && this.cadastrando) {
      passwordValidationErrors.push("O campo de seleção de permissão de usuário é obrigatório.");
    }
    
    if (passwordValidationErrors.length > 0) {
      this.modalErrors = passwordValidationErrors;
      return; 
    }
  
    if (userData.password !== userData.confirmPassword && this.cadastrando) {
        this.modalErrors.push("As senhas não coincidem.");
        return; 
    }

  }

  filtrarUsuariosPorPermissao(permissao: 'USER' | 'PROFESSOR'): Usuario[] {
    return this.usuarios.filter(user => String(user.permissao) === permissao);
  }

  updatePaginatedData(type: 'professores' | 'alunos'): void {
    const pageIndex = type === 'professores' ? this.pageIndexProfessores : this.pageIndexAlunos;
    const pageSize =  type === 'professores' ? this.pageSizeProfessores : this.pageSizeAlunos;
    const data = type === 'professores' ? this.professores : this.alunos;
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    if (type === 'professores') {
      this.paginatedProfessores = data.slice(startIndex, endIndex);
      this.totalPagesProfessores = Math.ceil(this.professores.length / this.pageSizeProfessores);
    } else {
      this.paginatedAlunos = data.slice(startIndex, endIndex);
      this.totalPagesAlunos = Math.ceil(this.alunos.length / this.pageSizeAlunos);

    }
  }

  nextPage(type: 'professores' | 'alunos'): void {
    const pageIndex = type === 'professores' ? this.pageIndexProfessores : this.pageIndexAlunos;
    const totalPages = type === 'professores' ? this.totalPagesProfessores : this.totalPagesAlunos;
    if (pageIndex < totalPages - 1) {
      if (type === 'professores') {
        this.pageIndexProfessores++;
      } else {
        this.pageIndexAlunos++;
      }
      this.updatePaginatedData(type);
    }
  }

  previousPage(type: 'professores' | 'alunos'): void {
    const pageIndex = type === 'professores' ? this.pageIndexProfessores : this.pageIndexAlunos;
    if (pageIndex > 0) {
      if (type === 'professores') {
        this.pageIndexProfessores--;
      } else {
        this.pageIndexAlunos--;
      }
      this.updatePaginatedData(type);
    }
  }

  goToPage(type: 'professores' | 'alunos', pageIndex: number): void {
    if (type === 'professores') {
      this.pageIndexProfessores = pageIndex;
    } else {
      this.pageIndexAlunos = pageIndex;
    }
    this.updatePaginatedData(type);
  }

  openModalCadastrar() {
    this.showModalCadastrar  = true;
  }

  closeModalCadastrar() {
    this.limparTela();
    this.modalErrors = [];
    this.showModalCadastrar = false;
  }

  openModalAtualizar(id: string) {
    this.consultarUsuario(id);
    this.showModalAtualizar = true;
  }

  closeModalAtualizar() {
    this.modalErrors = [];
    this.limparTela();
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
