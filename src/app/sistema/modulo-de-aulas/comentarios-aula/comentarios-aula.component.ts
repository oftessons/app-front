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

interface ComentarioComRespostas extends ComentarioAulaResponse {
  id?: number;
  respostas?: RespostaComentarioResponse[];
  mostrarRespostas?: boolean;
  carregandoRespostas?: boolean;
  mostrarFormResposta?: boolean;
  editando?: boolean;
  textoOriginal?: string;
  textoResposta?: string;
}

@Component({
  selector: 'app-comentarios-aula',
  templateUrl: './comentarios-aula.component.html',
  styleUrls: ['./comentarios-aula.component.css']
})
export class ComentariosAulaComponent implements OnInit, OnDestroy, OnChanges {

  @Input() aulaId!: number;

  comentarios: ComentarioComRespostas[] = [];
  novoComentario: string = '';
  textoEdicao: string = '';

  isLoading: boolean = false;
  isEnviando: boolean = false;
  hasMore: boolean = false;
  nextCursor: string | null = null;

  comentarioEditandoId: number | null = null;
  respostaEditandoId: number | null = null;

  nomeUsuarioLogado: string = '';
  fotoUsuarioLogado: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private comentariosService: ComentariosAulasService,
    private authService: AuthService,
    private modalDeleteService: ModalDeleteService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarioLogado();
    if (this.aulaId) {
      this.carregarComentarios();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['aulaId'] && !changes['aulaId'].firstChange) {
      this.comentarios = [];
      this.novoComentario = '';
      this.nextCursor = null;
      this.hasMore = false;
      if (this.aulaId) {
        this.carregarComentarios();
      }
    }
  }

  private carregarUsuarioLogado(): void {
    const usuarioLocal = this.authService.getUsuarioAutenticado();
    if (usuarioLocal?.nome) {
      this.nomeUsuarioLogado = usuarioLocal.nome;
      this.fotoUsuarioLogado = usuarioLocal.fotoUrl || null;
    } else {
      this.authService.obterNomeUsuario().subscribe({
        next: (nome) => {
          this.nomeUsuarioLogado = nome;
        },
        error: () => {
          this.nomeUsuarioLogado = '';
        }
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

    this.comentariosService.obterComentarios(this.aulaId, cursor)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CursorPageResponse<ComentarioAulaResponse>) => {
          const novosComentarios = response.items.map((c, index) => ({
            ...c,
            id: index + (this.comentarios.length),
            respostas: [],
            mostrarRespostas: false,
            carregandoRespostas: false,
            mostrarFormResposta: false,
            editando: false,
            textoResposta: ''
          }));

          if (cursor) {
            this.comentarios = [...this.comentarios, ...novosComentarios];
          } else {
            this.comentarios = novosComentarios;
          }

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

    this.comentariosService.comentar(this.aulaId, { comentario: this.novoComentario.trim() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.novoComentario = '';
          this.isEnviando = false;
          // Recarrega os comentários para mostrar o novo
          this.carregarComentarios();
        },
        error: (err) => {
          console.error('Erro ao enviar comentário:', err);
          this.isEnviando = false;
        }
      });
  }

  toggleRespostas(comentario: ComentarioComRespostas): void {
    if (!comentario.mostrarRespostas) {
      this.carregarRespostas(comentario);
    }
    comentario.mostrarRespostas = !comentario.mostrarRespostas;
  }

  carregarRespostas(comentario: ComentarioComRespostas): void {
    if (comentario.carregandoRespostas || !comentario.id) return;

    comentario.carregandoRespostas = true;

    this.comentariosService.obterRespostas(this.aulaId, comentario.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respostas) => {
          comentario.respostas = respostas;
          comentario.carregandoRespostas = false;
        },
        error: (err) => {
          console.error('Erro ao carregar respostas:', err);
          comentario.carregandoRespostas = false;
        }
      });
  }

  toggleFormResposta(comentario: ComentarioComRespostas): void {
    comentario.mostrarFormResposta = !comentario.mostrarFormResposta;
    if (!comentario.mostrarFormResposta) {
      comentario.textoResposta = '';
    }
  }

  enviarResposta(comentario: ComentarioComRespostas): void {
    if (!comentario.textoResposta?.trim() || !comentario.id) return;

    this.comentariosService.responderComentario(this.aulaId, comentario.id, {
      respostaComentario: comentario.textoResposta.trim()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          comentario.textoResposta = '';
          comentario.mostrarFormResposta = false;
          this.carregarRespostas(comentario);
          if (!comentario.mostrarRespostas) {
            comentario.mostrarRespostas = true;
          }
        },
        error: (err) => {
          console.error('Erro ao enviar resposta:', err);
        }
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

  salvarEdicaoComentario(comentario: ComentarioComRespostas): void {
    if (!this.textoEdicao.trim() || !comentario.id) return;

    this.comentariosService.atualizarComentario(this.aulaId, comentario.id, {
      comentario: this.textoEdicao.trim()
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          comentario.texto = this.textoEdicao.trim();
          comentario.editando = false;
          this.textoEdicao = '';
          this.comentarioEditandoId = null;
        },
        error: (err) => {
          console.error('Erro ao editar comentário:', err);
        }
      });
  }

  deletarComentario(comentario: ComentarioComRespostas): void {
    if (!comentario.id) return;

    this.modalDeleteService.openModal(
      {
        title: 'Excluir comentário',
        description: `Tem certeza que deseja excluir este comentário de <strong>${comentario.nomeAutor}</strong>?`,
        deletarTextoBotao: 'Excluir',
        size: 'md'
      },
      () => {
        this.comentariosService.deletarComentario(this.aulaId, comentario.id!)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.comentarios = this.comentarios.filter(c => c.id !== comentario.id);
            },
            error: (err) => {
              console.error('Erro ao deletar comentário:', err);
            }
          });
      }
    );
  }

  deletarResposta(comentario: ComentarioComRespostas, resposta: RespostaComentarioResponse): void {
    if (!comentario.id) return;

    this.modalDeleteService.openModal(
      {
        title: 'Excluir resposta',
        description: 'Tem certeza que deseja excluir esta resposta?',
        deletarTextoBotao: 'Excluir',
        size: 'sm'
      },
      () => {
        this.comentariosService.deletarResposta(this.aulaId, comentario.id!, resposta.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              if (comentario.respostas) {
                comentario.respostas = comentario.respostas.filter(r => r.id !== resposta.id);
              }
            },
            error: (err) => {
              console.error('Erro ao deletar resposta:', err);
            }
          });
      }
    );
  }

  podeEditar(nomeAutor: string): boolean {
    return this.nomeUsuarioLogado === nomeAutor;
  }

  getPermissaoClass(permissao: string): string {
    switch (permissao) {
      case 'ADMIN':
        return 'badge-admin';
      case 'PROFESSOR':
        return 'badge-professor';
      default:
        return 'badge-aluno';
    }
  }

  getPermissaoLabel(permissao: string): string {
    switch (permissao) {
      case 'ADMIN':
        return 'Admin';
      case 'PROFESSOR':
        return 'Professor';
      default:
        return 'Aluno';
    }
  }

  getInitials(nome: string): string {
    if (!nome) return '?';
    const parts = nome.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return nome.substring(0, 2).toUpperCase();
  }
}
