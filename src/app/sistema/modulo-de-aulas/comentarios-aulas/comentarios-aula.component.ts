import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ComentariosAulasService,
  ComentarioAulaResponse,
  RespostaComentarioResponse,
  CursorPageResponse
} from 'src/app/services/comentarios-aulas.service';
import { AuthService } from 'src/app/services/auth.service';
import { ModalDeleteService } from 'src/app/services/modal-delete.service';
import { Permissao } from 'src/app/login/Permissao';
import { ComentariosQuestoesService } from 'src/app/services/comentarios-questoes.service';
import { NotificacaoService } from 'src/app/services/notificacoes.service';

interface RespostaUI extends RespostaComentarioResponse {
  editando?: boolean;
  textoEdicao?: string;
  textoOriginal?: string;
  isSalvando?: boolean;
}
interface ComentarioComRespostas extends ComentarioAulaResponse {
  respostas?: RespostaUI[];
  mostrarRespostas?: boolean;
  carregandoRespostas?: boolean;
  mostrarFormResposta?: boolean;
  editando?: boolean;
  textoOriginal?: string;
  textoResposta?: string;
  nextCursor?: string | null;
  hasMoreRespostas?: boolean;
  totalRespostas?: number;
}

@Component({
  selector: 'app-comentarios-aula',
  templateUrl: './comentarios-aula.component.html',
  styleUrls: ['./comentarios-aula.component.css']
})
export class ComentariosAulaComponent implements OnInit, OnDestroy, OnChanges {

  @Input() referenciaId!: number;
  @Input() tipo: 'AULA' | 'QUESTAO' = 'AULA';

  comentarios: ComentarioComRespostas[] = [];
  novoComentario: string = '';
  textoEdicao: string = '';

  isLoading: boolean = false;
  isEnviando: boolean = false;
  hasMore: boolean = false;
  nextCursor: string | null = null;
  permissaoUsuarioLogado: string = '';

  comentarioEditandoId: number | null = null;
  respostaEditandoId: number | null = null;

  nomeUsuarioLogado: string = '';
  fotoUsuarioLogado: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private comentariosService: ComentariosAulasService,
    private authService: AuthService,
    private modalDeleteService: ModalDeleteService,
    private comentariosQuestoesService: ComentariosQuestoesService,
    private notificacaoService: NotificacaoService,
  ) { }

  ngOnInit(): void {
    console.log('Referencia ID:', this.referenciaId);
    this.carregarUsuarioLogado();
    if (this.referenciaId) this.carregarComentarios();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['referenciaId'] && !changes['referenciaId'].firstChange) {
      this.resetarEstado();
      if (this.referenciaId) this.carregarComentarios();
    }
  }

  private resetarEstado() {
    this.comentarios = [];
    this.novoComentario = '';
    this.nextCursor = null;
    this.hasMore = false;
  }

  private carregarUsuarioLogado(): void {
    const usuarioLocal = this.authService.getUsuarioAutenticado();
    this.permissaoUsuarioLogado = usuarioLocal?.permissao || '';
    if (usuarioLocal?.nome) {
      this.nomeUsuarioLogado = usuarioLocal.nome;
      this.fotoUsuarioLogado = usuarioLocal.fotoUrl || null;
    } else {
      this.authService.obterNomeUsuario().subscribe({
        next: (nome) => { this.nomeUsuarioLogado = nome; },
        error: () => { this.nomeUsuarioLogado = ''; }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarComentarios(cursor?: string): void {
    if (this.isLoading) return;
    this.isLoading = true;

    const request$ = this.tipo === 'AULA'
      ? this.comentariosService.obterComentarios(this.referenciaId, cursor)
      : this.comentariosQuestoesService.obterComentariosQuestao(this.referenciaId, cursor);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: CursorPageResponse<ComentarioAulaResponse>) => {
        const novos = response.items.map((c, index) => ({
          ...c,
          id: c.id || index,
          respostas: [],
          mostrarRespostas: false,
          carregandoRespostas: false,
          mostrarFormResposta: false,
          editando: false,
          textoResposta: ''
        }));

        this.comentarios = cursor ? [...this.comentarios, ...novos] : novos;
        this.hasMore = response.hasNext;
        this.nextCursor = response.nextCursor;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar comentários:', err);
        this.isLoading = false;
      }
    });
  }

  carregarMais(): void {
    if (this.nextCursor) {
      this.carregarComentarios(this.nextCursor);
    }
  }

  enviarComentario(): void {
    if (!this.novoComentario.trim() || this.isEnviando) return;
    this.isEnviando = true;
    const body = { comentario: this.novoComentario.trim() };

    const request$ = this.tipo === 'AULA'
      ? this.comentariosService.comentar(this.referenciaId, body)
      : this.comentariosQuestoesService.comentarQuestao(this.referenciaId, body);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.novoComentario = '';
        this.isEnviando = false;
        const novoParaLista: ComentarioComRespostas = {
          ...response,
          respostas: [],
          mostrarRespostas: false,
          carregandoRespostas: false,
          mostrarFormResposta: false,
          editando: false,
          textoResposta: ''
        };

        // this.resetarEstado();
        // this.carregarComentarios();
        this.comentarios.unshift(novoParaLista)
        this.notificacaoService.atualizarNotificacoes();
      },
      error: (err) => {
        console.error(err);
        this.isEnviando = false;
      }
    });
  }

  toggleRespostas(c: ComentarioComRespostas): void {
    if (!c.mostrarRespostas) this.carregarRespostas(c);
    c.mostrarRespostas = !c.mostrarRespostas;
  }

  carregarRespostas(c: ComentarioComRespostas, cursor?: string): void {
    if (c.carregandoRespostas || !c.id) return;
    c.carregandoRespostas = true;

    const request$ = this.tipo === 'AULA'
      ? this.comentariosService.obterRespostas(this.referenciaId, c.id, cursor)
      : this.comentariosQuestoesService.obterRespostasQuestao(this.referenciaId, c.id, cursor);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        // Lógica para tratar se vem paginado ou array direto (igual seu código original)
        let novas = [];
        let hasNext = false;
        let nextCs = null;

        if (response && Array.isArray(response.items)) {
          novas = response.items;
          hasNext = response.hasNext;
          nextCs = response.nextCursor;
        } else if (Array.isArray(response)) {
          novas = response;
        }

        c.respostas = cursor ? [...(c.respostas || []), ...novas] : novas;
        c.hasMoreRespostas = hasNext;
        c.nextCursor = nextCs;
        c.carregandoRespostas = false;
      },
      error: (err) => {
        console.error(err);
        c.carregandoRespostas = false;
        if (!cursor) c.respostas = [];
      }
    });
  }

  carregarMaisRespostas(c: ComentarioComRespostas): void {
    if (c.nextCursor) this.carregarRespostas(c, c.nextCursor);
  }

  toggleFormResposta(comentario: ComentarioComRespostas): void {
    comentario.mostrarFormResposta = !comentario.mostrarFormResposta;
    if (!comentario.mostrarFormResposta) {
      comentario.textoResposta = '';
    }
  }

  enviarResposta(c: ComentarioComRespostas): void {
    if (!c.textoResposta?.trim() || !c.id) return;
    const body = { respostaComentario: c.textoResposta.trim() };

    const request$ = this.tipo === 'AULA'
      ? this.comentariosService.responderComentario(this.referenciaId, c.id, body)
      : this.comentariosQuestoesService.responderComentarioQuestao(this.referenciaId, c.id, body);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        c.textoResposta = '';
        c.mostrarFormResposta = false;
        this.carregarRespostas(c);
        if (!c.mostrarRespostas) c.mostrarRespostas = true;
        this.notificacaoService.atualizarNotificacoes();
      },
      error: (err) => console.error(err)
    });
  }

  iniciarEdicaoComentario(comentario: ComentarioComRespostas): void {
    comentario.editando = true;
    comentario.textoOriginal = comentario.texto;
    this.textoEdicao = comentario.texto;
    this.comentarioEditandoId = comentario.id || null;
  }

  cancelarEdicaoComentario(comentario: ComentarioComRespostas): void {
    comentario.editando = false;
    comentario.texto = comentario.textoOriginal || comentario.texto;
    this.textoEdicao = '';
    this.comentarioEditandoId = null;
  }

  iniciarEdicaoResposta(resposta: RespostaUI): void {
    resposta.editando = true;
    resposta.textoOriginal = resposta.texto;
    resposta.textoEdicao = resposta.texto;
  }

  cancelarEdicaoResposta(resposta: RespostaUI): void {
    resposta.editando = false;
    resposta.texto = resposta.textoOriginal || resposta.texto;
    resposta.textoEdicao = '';
  }

  salvarEdicaoComentario(c: ComentarioComRespostas) {
    if (!this.textoEdicao.trim() || !c.id) return;
    const body = { comentario: this.textoEdicao.trim() };
    const request$ = this.tipo === 'AULA'
      ? this.comentariosService.atualizarComentario(this.referenciaId, c.id, body)
      : this.comentariosQuestoesService.atualizarComentarioQuestao(this.referenciaId, c.id, body);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { c.texto = this.textoEdicao.trim(); c.editando = false; },
      error: (err) => console.error(err)
    });
  }

  salvarEdicaoResposta(c: ComentarioComRespostas, r: RespostaUI) {
    if (!r.textoEdicao?.trim() || !c.id || !r.id) return;
    r.isSalvando = true;
    const body = { respostaComentario: r.textoEdicao.trim() };

    // Assumindo método editarRespostaQuestao no service
    const request$ = this.tipo === 'AULA'
      ? this.comentariosService.editarResposta(this.referenciaId, c.id, r.id, body)
      : this.comentariosQuestoesService.editarResposta(this.referenciaId, c.id, r.id, body);

    request$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { r.texto = r.textoEdicao!; r.editando = false; r.isSalvando = false; },
      error: (err) => { console.error(err); r.isSalvando = false; }
    });
  }

  deletarComentario(c: ComentarioComRespostas): void {
    if (!c.id) return;
    this.modalDeleteService.openModal(
      { title: 'Excluir', description: 'Excluir comentário?', deletarTextoBotao: 'Excluir', size: 'sm' },
      () => {
        const request$ = this.tipo === 'AULA'
          ? this.comentariosService.deletarComentario(this.referenciaId, c.id!)
          : this.comentariosQuestoesService.deletarComentarioQuestao(this.referenciaId, c.id!);

        request$.pipe(takeUntil(this.destroy$)).subscribe({
          next: () => { this.comentarios = this.comentarios.filter(item => item.id !== c.id); },
          error: (err) => console.error(err)
        });
      }
    );
  }

  deletarResposta(c: ComentarioComRespostas, r: RespostaUI): void {
    if (!c.id || !r.id) return;
    this.modalDeleteService.openModal(
      { title: 'Excluir', description: 'Excluir resposta?', deletarTextoBotao: 'Excluir', size: 'sm' },
      () => {
        const request$ = this.tipo === 'AULA'
          ? this.comentariosService.deletarResposta(this.referenciaId, c.id!, r.id!)
          : this.comentariosQuestoesService.deletarRespostaQuestao(this.referenciaId, c.id!, r.id!);

        request$.pipe(takeUntil(this.destroy$)).subscribe({
          next: () => { if (c.respostas) c.respostas = c.respostas.filter(item => item.id !== r.id); },
          error: (err) => console.error(err)
        });
      }
    );
  }

  podeDeletar(autor: string) { return this.nomeUsuarioLogado === autor || this.permissaoUsuarioLogado === Permissao.ADMIN; }
  podeEditar(autor: string) { return this.nomeUsuarioLogado === autor; }

  getPermissaoClass(perm: string) { return perm === 'ADMIN' ? 'badge-admin' : (perm === 'PROFESSOR' ? 'badge-professor' : 'badge-aluno'); }

  getPermissaoLabel(perm: string) { return perm === 'ADMIN' ? 'Admin' : (perm === 'PROFESSOR' ? 'Professor' : 'Aluno'); }

  getInitials(nome: string): string {
    if (!nome) return '?';
    const p = nome.split(' ');
    return (p.length >= 2) ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : nome.substring(0, 2).toUpperCase();
  }
}
