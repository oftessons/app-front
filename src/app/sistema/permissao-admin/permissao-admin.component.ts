import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Permissao } from 'src/app/login/Permissao';
import { PermissaoDescricoes } from 'src/app/login/Permissao-descricao';
import { TipoUsuario } from 'src/app/login/enums/tipo-usuario';
import { Usuario } from 'src/app/login/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { Plano } from 'src/app/sistema/page-meu-perfil/plano';
import { VendasService } from 'src/app/services/vendas.service';
import { ModalDeleteComponent } from 'src/app/shared/modal-delete/modal-delete.component';
import { ModalDeleteService } from 'src/app/services/modal-delete.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-permissao-admin',
  templateUrl: './permissao-admin.component.html',
  styleUrls: ['./permissao-admin.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PermissaoAdminComponent implements OnInit {

  displayedColumns: string[] = ['nome', 'email', 'cidade', 'estado'];

  usuarios: Usuario[] = [];

  professores: Usuario[] = []
  paginatedProfessores = this.professores.slice(0, 6);
  pageSizeProfessores = 6;
  pageIndexProfessores = 0;
  totalPagesProfessores = Math.ceil(this.professores.length / this.pageSizeProfessores);

  alunos: Usuario[] = []
  paginatedAlunos = this.alunos.slice(0, 6);
  pageSizeAlunos = 6;
  pageIndexAlunos = 0;
  totalPagesAlunos = Math.ceil(this.alunos.length / this.pageSizeAlunos);

  bolsistas: Usuario[] = []
  paginatedBolsistas = this.bolsistas.slice(0, 6);
  pageSizeBolsistas = 6;
  pageIndexBolsistas = 0;
  totalPagesBolsistas = Math.ceil(this.bolsistas.length / this.pageSizeBolsistas);

  tiposPermissao = [PermissaoDescricoes.ROLE_PROFESSOR, PermissaoDescricoes.ROLE_USER, PermissaoDescricoes.ROLE_BOLSISTA];
  mensagemSucesso: string = '';
  cadastrando: boolean = false;
  userData: Usuario = new Usuario();

  usuarioFormCadastro = this.formBuilder.group({
    id: new FormControl(0,),
    username: new FormControl('', { validators: [Validators.required] }),
    password: new FormControl('', { validators: [Validators.required] }),
    confirmPassword: new FormControl('', { validators: [Validators.required] }),
    nome: new FormControl('', [Validators.required]),
    email: new FormControl('', { validators: [Validators.required] }),
    telefone: new FormControl('', { validators: [Validators.required] }),
    estado: new FormControl('',),
    cidade: new FormControl('',),
    tipoUsuario: new FormControl('', { validators: [Validators.required] }),
    bolsa: new FormControl(false),
    quantidadeDiasBolsa: new FormControl([null, [Validators.required, Validators.min(1)]])
  });

  usuarioFormUpdate = this.formBuilder.group({
    id: new FormControl(0,),
    username: new FormControl('', { validators: [Validators.required] }),
    password: new FormControl('', { validators: [Validators.required] }),
    confirmPassword: new FormControl('', { validators: [Validators.required] }),
    nome: new FormControl('', [Validators.required]),
    email: new FormControl('', { validators: [Validators.required] }),
    telefone: new FormControl('', { validators: [Validators.required] }),
    estado: new FormControl('',),
    cidade: new FormControl('',),
  });

  showModalCadastrar: boolean = false;
  showModalAtualizar: boolean = false;
  showModalPlano: boolean = false;
  selectedUser: Usuario | null = null;
  selectedUserPlan: Plano | null = null;
  loadingPlan: boolean = false;
  submited: boolean = false;
  errors: string[] = [];
  modalErrors: string[] = [];

  passwordVisible: { [key: string]: boolean } = {
    password: false,
    confirmPassword: false,
    currentPassword: false,
    newPassword: false
  };

  planosUsuarios: { [userId: string]: string } = {};
  planosStatus: { [userId: string]: string } = {};

  constructor(private formBuilder: FormBuilder, private authService: AuthService,
    private cdRef: ChangeDetectorRef, private vendasService: VendasService,
    private modalDeleteService: ModalDeleteService, private snackBar: MatSnackBar) {
    this.usuarioFormCadastro = this.formBuilder.group({
      id: null,
      username: [''],
      password: [''],
      confirmPassword: [''],
      nome: [''],
      email: [''],
      telefone: [''],
      cidade: [''],
      estado: [''],
      tipoUsuario: [''],
      bolsa: [''],
      quantidadeDiasBolsa: ['']
    });

    this.usuarioFormUpdate = this.formBuilder.group({
      id: null,
      username: [''],
      password: [''],
      confirmPassword: [''],
      nome: [''],
      email: [''],
      telefone: [''],
      cidade: [''],
      estado: [''],
    })
  }

  ngOnInit(): void {
    this.updatePaginatedData('professores');
    this.updatePaginatedData('alunos');
    this.updatePaginatedData('bolsistas');
    this.carregarUsuarios();
  }

  carregarUsuarios() {
    this.authService.visualizarUsuarios().subscribe((data: Usuario[] | null) => {
      if (!Array.isArray(data)) {
        this.errors.push("Nenhum aluno cadastrado.")
        this.cdRef.markForCheck();
        return;
      };

      this.usuarios = data;
      this.alunos = this.filtrarUsuariosPorPermissao('USER');
      this.professores = this.filtrarUsuariosPorPermissao('PROFESSOR');
      this.bolsistas = this.filtrarUsuariosPorPermissao('BOLSISTA');

      this.alunos.forEach(aluno => {
        this.planosUsuarios[aluno.id] = this.getPlanoUsuario(aluno);
      });

      this.updatePaginatedData('alunos');
      this.updatePaginatedData('professores');
      this.updatePaginatedData('bolsistas');

      this.cdRef.markForCheck();
    }, (error) => {
      this.errors.push(error);
      this.cdRef.markForCheck();
    })
  }

  cadastrarUsuarios() {
    this.cadastrando = true;
    const userData = this.usuarioFormCadastro.value;
    this.errors = [];
    this.modalErrors = [];
    this.validadaoDeCadastro(userData);

    if (this.modalErrors.length > 0) {
      return;
    }

    const usuario = new Usuario();
    usuario.password = userData.password;
    usuario.confirmPassword = userData.confirmPassword;
    usuario.nome = userData.nome;
    usuario.email = userData.email;
    usuario.telefone = userData.telefone;
    usuario.cidade = userData.cidade;
    usuario.estado = userData.estado;
    usuario.tipoUsuario = userData.tipoUsuario;
    usuario.bolsaAssinatura = userData.bolsa;
    usuario.diasDeTeste = userData.quantidadeDiasBolsa;
    usuario.dataInicioBolsa = userData.bolsa ? new Date() : undefined;
    const permissao = this.mapearDescricaoParaEnum(userData.tipoUsuario);


    this.authService.salvar(usuario, permissao).subscribe((response) => {
      this.mensagemSucesso = response.message;

      this.carregarUsuarios();

      this.limparTela();

      this.closeModalCadastrar();

      this.cdRef.detectChanges();


    }, (error => {
      this.modalErrors.push(error);
      this.cdRef.markForCheck();

    }))
  }


  consultarUsuario(id: string) {
    this.authService.visualizarUsuarioPorId(id).subscribe((response: Usuario) => {

      this.usuarioFormUpdate.patchValue({
        id: id,
        nome: response.nome,
        email: response.email,
        password: response.password,
        confirmPassword: undefined,
        telefone: response.telefone,
        cidade: response.cidade,
        estado: response.estado,
      })

      this.cdRef.markForCheck();
    })
  }


  editarUsuarios() {
    this.cadastrando = false;
    this.mensagemSucesso = "";
    this.errors = [];
    this.modalErrors = [];
    this.userData = { ... this.usuarioFormUpdate.value };
    this.validadaoDeCadastro(this.userData);

    if (this.modalErrors.length > 0) {
      return;
    }

    this.authService.atualizarUsuario(this.userData).subscribe((response) => {
      const updateUser = response;

      const tiposUsuarios = {
        alunos: this.alunos,
        professores: this.professores,
        bolsistas: this.bolsistas
      };

      for (const key of Object.keys(tiposUsuarios) as (keyof typeof tiposUsuarios)[]) {
        const usuarios = tiposUsuarios[key];
        const index = tiposUsuarios[key].findIndex((user) => user.id === updateUser.id);

        if (index != -1) {
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

  removerUsuario(id: string): void {
    this.authService.removerUsuario(id).subscribe({
      next: () => {
        this.alunos = this.alunos.filter(u => u.id !== id);
        this.professores = this.professores.filter(u => u.id !== id);
        this.bolsistas = this.bolsistas.filter(u => u.id !== id);

        this.updatePaginatedData('alunos');
        this.updatePaginatedData('professores');
        this.updatePaginatedData('bolsistas');

        // feedback de sucesso
        this.snackBar.open('Usuário removido com sucesso!', '✕', {
          duration: 5000,                   
          panelClass: ['snackbar-success'],
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        this.cdRef.markForCheck();
      },
      error: err => {
        this.errors.push(err);

        this.snackBar.open('Erro ao remover usuário.', '✕', {
          duration: 3000,
          panelClass: ['snackbar-error'],
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });

        this.cdRef.markForCheck();
      }
    });
  }


  openModalDeletar(usuario: Usuario): void {
    this.modalDeleteService.openModal(
      {
        title: 'Remoção de usuário',
        description: `
          Tem certeza que deseja excluir o usuário
          <strong>${usuario.nome}</strong>?`,
        item: usuario,
        deletarTextoBotao: 'Excluir',
        size: 'md'
      },
      () => this.removerUsuario(usuario.id) 
    );
  }


  mapearDescricaoParaEnum(selecao: string): Permissao {

    const enumeracao: Record<string, Permissao> = {
      "USER": Permissao.USER,
      "PROFESSOR": Permissao.PROFESSOR,
      "BOLSISTA": Permissao.BOLSISTA,
    }

    return enumeracao[selecao] || Permissao.USER;
  }

  limparTela() {
    this.usuarioFormCadastro.patchValue({
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

    if (!userData.email) {
      passwordValidationErrors.push("O campo de email é obrigatório.");

    }

    if (!userData.nome) {
      passwordValidationErrors.push("O campo de nome é obrigatório.");
    }

    if (!userData.tipoUsuario && this.cadastrando) {
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

  filtrarUsuariosPorPermissao(permissao: 'USER' | 'PROFESSOR' | 'BOLSISTA'): Usuario[] {
    return this.usuarios.filter(user => String(user.permissao) === permissao);
  }

  updatePaginatedData(type: 'professores' | 'alunos' | 'bolsistas'): void {
    if (type === 'alunos') {
      const startIndex = this.pageIndexAlunos * this.pageSizeAlunos;
      const endIndex = startIndex + this.pageSizeAlunos;
      this.paginatedAlunos = this.alunos.slice(startIndex, endIndex);
      this.totalPagesAlunos = Math.ceil(this.alunos.length / this.pageSizeAlunos);
    } else if (type === 'professores') {
      const startIndex = this.pageIndexProfessores * this.pageSizeProfessores;
      const endIndex = startIndex + this.pageSizeProfessores;
      this.paginatedProfessores = this.professores.slice(startIndex, endIndex);
      this.totalPagesProfessores = Math.ceil(this.professores.length / this.pageSizeProfessores);
    } else if (type === 'bolsistas') {
      const startIndex = this.pageIndexBolsistas * this.pageSizeBolsistas;
      const endIndex = startIndex + this.pageSizeBolsistas;
      this.paginatedBolsistas = this.bolsistas.slice(startIndex, endIndex);
      this.totalPagesBolsistas = Math.ceil(this.bolsistas.length / this.pageSizeBolsistas);
    }
  }

  nextPage(type: 'professores' | 'alunos' | 'bolsistas'): void {
    if (type === 'professores') {
      if (this.pageIndexProfessores < this.totalPagesProfessores - 1) {
        this.pageIndexProfessores++;
        this.updatePaginatedData(type);
      }
    } else if (type === 'alunos') {
      if (this.pageIndexAlunos < this.totalPagesAlunos - 1) {
        this.pageIndexAlunos++;
        this.updatePaginatedData(type);
      }
    } else if (type === 'bolsistas') {
      if (this.pageIndexBolsistas < this.totalPagesBolsistas - 1) {
        this.pageIndexBolsistas++;
        this.updatePaginatedData(type);
      }
    }
  }

  previousPage(type: 'professores' | 'alunos' | 'bolsistas'): void {
    if (type === 'professores') {
      if (this.pageIndexProfessores > 0) {
        this.pageIndexProfessores--;
        this.updatePaginatedData(type);
      }
    } else if (type === 'alunos') {
      if (this.pageIndexAlunos > 0) {
        this.pageIndexAlunos--;
        this.updatePaginatedData(type);
      }
    } else if (type === 'bolsistas') {
      if (this.pageIndexBolsistas > 0) {
        this.pageIndexBolsistas--;
        this.updatePaginatedData(type);
      }
    }
  }

  goToPage(type: 'professores' | 'alunos' | 'bolsistas', pageIndex: number): void {
    if (type === 'professores') {
      this.pageIndexProfessores = pageIndex;
    } else if (type === 'alunos') {
      this.pageIndexAlunos = pageIndex;
    } else if (type === 'bolsistas') {
      this.pageIndexBolsistas = pageIndex;
    }
    this.updatePaginatedData(type);
  }

  openModalCadastrar() {
    this.showModalCadastrar = true;
  }

  closeModalCadastrar() {
    this.limparTela();
    this.modalErrors = [];
    this.showModalCadastrar = false;
  }

  openModalAtualizar(id: string) {
    this.consultarUsuario(id);
    this.showModalPlano = false;
    this.showModalAtualizar = true;
  }

  closeModalAtualizar() {
    this.modalErrors = [];
    this.limparTela();
    this.showModalAtualizar = false;
  }

  exibirInformacaoPlano(userId: string) {
    this.loadingPlan = true;
    this.selectedUserPlan = null;

    this.vendasService.obterDadosAssinaturaPorUsuario(userId).subscribe(
      (response) => {
        const plano = new Plano();
        plano.name = response.name;
        plano.intervaloRenovacao = this.getPeriodoTraduzido(response.intervaloRenovacao);
        plano.status = this.getStatusTraduzido(response.status);
        plano.proximaRenovacao = this.converterDateTime(response.proximaRenovacao);
        plano.validoAte = this.converterDateTime(response.validoAte);
        this.selectedUserPlan = plano;
        this.loadingPlan = false;
        this.cdRef.markForCheck();
      },
      (error) => {
        console.error('Erro ao obter informações do plano:', error);
        this.loadingPlan = false;
        this.cdRef.markForCheck();
      }
    );
  }

  carregarPlanoUsuario(userId: string) {
    this.vendasService.obterDadosAssinaturaPorUsuario(userId).subscribe(
      (response) => {
        this.planosUsuarios[userId] = response.name || 'Sem plano';
        this.planosStatus[userId] = this.getStatusTraduzido(response.status) || 'Não disponível';
        this.cdRef.markForCheck();
      },
      (error) => {
        this.planosUsuarios[userId] = 'Não disponível';
        this.cdRef.markForCheck();
      }
    );
  }

  getPlanoUsuario(usuario: Usuario): string {
    if (!usuario || !usuario.id) {
      return 'Não disponível';
    }

    if (this.planosUsuarios[usuario.id]) {
      const plano = this.planosUsuarios[usuario.id];
      const status = this.planosStatus[usuario.id] || '';
      return plano + (status ? ` (${status})` : '');
    }

    this.carregarPlanoUsuario(usuario.id);
    return 'Carregando...';
  }

  getPeriodoTraduzido(periodo: string): string {
    const periodos: { [key: string]: string } = {
      'month': 'Mensal',
      'year': 'Anual',
      'semester': 'Semestral',
      'day': 'Diário'
    };
    return periodos[periodo] || periodo;
  }

  getStatusTraduzido(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Ativo',
      'expired': 'Expirado',
      'canceled': 'Cancelado',
      'incomplete': 'Incompleto',
      'incomplete_expired': 'Expirado',
      'past_due': 'Pagamento Pendente',
      'trialing': 'Em período de teste',
      'unpaid': 'Não pago'
    };
    return statusMap[status] || status;
  }

  getTipoUsuarioTraduzido(tipo: string): string {
    const tipos: { [key in TipoUsuario]: string } = {
      [TipoUsuario.RESIDENTE_R1]: 'Residente R1',
      [TipoUsuario.RESIDENTE_R2]: 'Residente R2',
      [TipoUsuario.RESIDENTE_R3]: 'Residente R3',
      [TipoUsuario.ESTUDANTE_MEDICINA]: 'Estudante de Medicina',
      [TipoUsuario.OFTALMOLOGISTA]: 'Oftalmologista'
    };
    return tipos[tipo as TipoUsuario] || 'Não disponível';
  }

  getPermissaoTraduzida(permissao: Permissao): string {
    if (permissao === undefined || permissao === null) {
      return 'Não disponível';
    }
    const permissoes: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'PROFESSOR': 'Professor',
      'USER': 'Aluno',
      'BOLSISTA': 'Bolsista'
    };
    return permissoes[permissao] || 'Não disponível';
  }

  converterDateTime(dateTime: string): string {
    if (!dateTime) return 'Não disponível';

    const data = new Date(dateTime);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  openModalPlano(id: string) {
    this.authService.visualizarUsuarioPorId(id).subscribe((response: Usuario) => {
      this.selectedUser = response;
      this.showModalPlano = true;
      this.exibirInformacaoPlano(id);
      this.cdRef.markForCheck();
    }, (error) => {
      this.errors.push(error);
      this.cdRef.markForCheck();
    });
  }

  closeModalPlano() {
    this.selectedUser = null;
    this.showModalPlano = false;
    this.cdRef.markForCheck();
  }

  togglePasswordVisibility(field: string) {
    this.passwordVisible[field] = !this.passwordVisible[field];
    const passwordInput = document.querySelector(`input[name="${field}"]`);
    if (passwordInput) {
      passwordInput.setAttribute('type', this.passwordVisible[field] ? 'text' : 'password');
    }
  }

  getDataExpiracaoBolsa(bolsista: Usuario): string {
    if (!bolsista.dataInicioBolsa || !bolsista.diasDeTeste) {
      return 'Não disponível';
    }

    const dataInicio = new Date(bolsista.dataInicioBolsa);
    dataInicio.setDate(dataInicio.getDate() + bolsista.diasDeTeste);
    let statusBolsa;

    if (dataInicio < new Date()) {
      statusBolsa = 'Expirado';
    } else if (dataInicio > new Date()) {
      statusBolsa = 'Ativo';
    }

    return `${dataInicio.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}  (${statusBolsa})`;
  }

  isBolsaExpirada(usuario: Usuario): boolean {
    if (!usuario.dataInicioBolsa || !usuario.diasDeTeste) {
      return true;
    }

    const dataInicio = new Date(usuario.dataInicioBolsa);
    const dataExpiracao = new Date(dataInicio);
    dataExpiracao.setDate(dataExpiracao.getDate() + usuario.diasDeTeste);

    return dataExpiracao < new Date();
  }

  getBolsaStatus(usuario: Usuario): string {
    if (this.isBolsaExpirada(usuario)) {
      return 'Expirado';
    } else {
      return 'Ativo';
    }
  }

  formatarDataBolsa(data: Date | string | undefined): string {
    if (!data) return 'Não definida';

    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  calcularDataExpiracao(usuario: Usuario): string {
    if (!usuario.dataInicioBolsa || !usuario.diasDeTeste) {
      return 'Não definida';
    }

    const dataInicio = new Date(usuario.dataInicioBolsa);
    const dataExpiracao = new Date(dataInicio);
    dataExpiracao.setDate(dataExpiracao.getDate() + usuario.diasDeTeste);

    return this.formatarDataBolsa(dataExpiracao);
  }

  calcularDiasRestantes(usuario: Usuario): string {
    if (!usuario.dataInicioBolsa || !usuario.diasDeTeste) {
      return 'Não disponível';
    }

    const dataInicio = new Date(usuario.dataInicioBolsa);
    const dataExpiracao = new Date(dataInicio);
    dataExpiracao.setDate(dataExpiracao.getDate() + usuario.diasDeTeste);

    const hoje = new Date();
    if (dataExpiracao < hoje) {
      return 'Expirado';
    }

    const diffTime = Math.abs(dataExpiracao.getTime() - hoje.getTime());
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${diasRestantes} dias`;
  }
}
