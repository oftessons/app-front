import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core'; // Adicionado OnDestroy
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Usuario } from 'src/app/login/usuario';
import { Permissao } from 'src/app/login/Permissao';
import { AuthService } from 'src/app/services/auth.service';
import { ThemeService } from 'src/app/services/theme.service';
import { Categoria } from '../painel-de-aulas/enums/categoria';
import { Aula } from '../painel-de-aulas/aula';
import { AulasService } from 'src/app/services/aulas.service';

import { HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { of, Subscription } from 'rxjs';
import { CadastroAulaResponse } from './cadastro-aulas-response';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-cadastro-de-aulas',
  templateUrl: './cadastro-de-aulas.component.html',
  styleUrls: ['./cadastro-de-aulas.component.css']
})
export class CadastroDeAulasComponent implements OnInit {
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;

  usuario: Usuario | null = null;
  Permissao = Permissao;
  formData = new FormData();
  aulaDTO = new Aula();
  successMessage: string | null = null;
  errorMessage: string | null = null;

  isLoading: boolean = false;
  uploadProgress: number = 0;
  currentUploadState: string = 'Aguardando...';
  isVideoLoading: boolean = false;
  private uploadSubscription: Subscription | null = null;

  aula: Aula = new Aula();
  idAula: number | null = null;
  idAulaCadastrando: number | null = null;

  video: File | null = null;
  selectedImage: string = '';
  uploadedImage: string = '';
  fotoPreviews: { [key: string]: string | ArrayBuffer | null } = {};

  categoria: string[] = Object.values(Categoria);
  categoriaFormatada: string[] = Object.values(Categoria).map(cat =>
    cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase())
  );

  arquivos: File[] = [];

  isEditMode: boolean = false;

  // private readonly CHUNK_SIZE = 5 * 1024 * 1024;

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private aulasService: AulasService,
    private themeService: ThemeService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    console.log('ngOnInit chamado');
    this.usuario = this.authService.getUsuarioAutenticado();
    console.log('Usuário autenticado:', this.usuario);

    this.activatedRoute.params.subscribe(params => {
      this.idAula = params['id'];
      console.log('ID da aula:', this.idAula);
      if (this.idAula) {
        this.isEditMode = true;
        this.aulaDTO.id = this.idAula;
        // console.log('Modo de edição ativado');
        this.carregarAula(this.idAula);
      }
    });
  }

  // ngOnDestroy(): void {
  //   this.revokePreviewUrl('video');
  // }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  cancelUpload(): void {
    if (this.uploadSubscription) {
      this.uploadSubscription.unsubscribe();
      this.uploadSubscription = null;

      if (this.idAulaCadastrando) {
        this.aulasService.deletar(this.idAulaCadastrando).subscribe({
          next: () => {
            console.log('Aula deletada com sucesso após cancelamento do upload.');
          },
          error: (error) => {
            console.error('Erro ao deletar a aula após cancelamento do upload:', error);
          }

        });
      }
    }
    this.isLoading = false;
    this.uploadProgress = 0;
    this.errorMessage = 'Upload cancelado pelo usuário.';
    this.successMessage = null;
  }

  onSubmit(): void {
    this.successMessage = null;
    this.errorMessage = null;

    if (!this.aulaDTO.titulo || this.aulaDTO.titulo.trim() === '') {
      this.errorMessage = 'Por favor, informe o título da aula antes de salvar.';
      window.scrollTo(0, 0);
      return;
    }
    if (!this.aulaDTO.descricao || this.aulaDTO.descricao.trim() === '') {
      this.errorMessage = 'Por favor, informe a descrição da aula antes de salvar.';
      window.scrollTo(0, 0);
      return;
    }

    if (!this.isEditMode && !this.video) {
      this.errorMessage = 'Por favor, selecione um arquivo de vídeo para cadastrar a aula.';
      window.scrollTo(0, 0);
      return;
    }


    this.isLoading = true;
    this.uploadProgress = 0;


    if (this.video) {
      this.aulaDTO.keyVideo = this.video.name;
      this.aulaDTO.contentTypeVideo = this.video.type || 'application/octet-stream';
      this.aulaDTO.videoContentLength = this.video.size;
    }

    if (this.usuario) {
      this.aulaDTO.idUser = this.usuario.id;
    }

    this.aulaDTO.categoria = this.getCategoriaEnum(this.aulaDTO.categoria) as Categoria;

    const formData = new FormData();

    formData.append('aulaDTO', JSON.stringify(this.aulaDTO));

    if (this.arquivos.length > 0) {
      this.arquivos.forEach((arquivo) => {
        formData.append(`arquivos`, arquivo);
      });
    }


    if (!this.isEditMode) {

      this.currentUploadState = 'Cadastrando metadados da aula...';

      this.aulasService.cadastrarAula(formData).pipe(

        switchMap((event: HttpEvent<any>) => {
          if (event.type === HttpEventType.Response) {

            this.currentUploadState = 'Enviando vídeo para o S3...';
            const response = event.body as CadastroAulaResponse;

            this.idAulaCadastrando = response.aulaId;

            console.log('URL pré-assinada recebida:', response.presignedUrl);

            const uploadObservable = this.aulasService.uploadVideoS3(
              response.presignedUrl,
              this.video!,
              this.aulaDTO.contentTypeVideo!,
            );

            this.uploadSubscription = uploadObservable.subscribe();

            return uploadObservable;
          }
          return of(null);
        })

      ).subscribe({
        next: (event: HttpEvent<any> | null) => {

          if (event === null) {
            return;
          }

          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round(100 * (event.loaded / event.total));
          } else if (event instanceof HttpResponse) {

            this.uploadProgress = 100;
            this.currentUploadState = 'Concluído!';
            this.successMessage = 'Aula salva e vídeo enviado com sucesso! Estamos processando o vídeo, isso pode levar alguns minutos.';
            this.isLoading = false;
            this.resetForm();
          }
        },
        error: (err) => {
          console.error('Erro em uma das etapas do upload:', err);
          this.errorMessage = `Erro no upload: ${err.message || 'Verifique o console.'}`;
          this.isLoading = false;
          this.uploadProgress = 0;
          this.currentUploadState = 'Falhou';
        }
      });

    } else {

      if (this.video) {
        formData.append('video', this.video);
      }

      this.currentUploadState = 'Atualizando aula...';
      this.uploadSubscription = this.aulasService.atualizar(this.aulaDTO.id!, formData).subscribe({
        next: (event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.Sent:
              console.log('Requisição de atualização enviada!');
              break;
            case HttpEventType.UploadProgress:
              if (event.total) {
                this.uploadProgress = Math.round((100 * event.loaded) / event.total);
              }
              break;
            case HttpEventType.Response:
              this.isLoading = false;
              this.successMessage = 'Aula atualizada com sucesso!';
              this.currentUploadState = 'Concluído!';
              console.log('Atualização concluída!', event.body);
              break;
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.currentUploadState = 'Falhou';
          this.errorMessage = 'Erro ao atualizar a aula.';
          console.error('Erro ao atualizar:', error);
        }
      });
    }
  }

  private resetForm() {
    this.aulaDTO = new Aula();
    this.video = null;
    this.arquivos = [];
    this.fotoPreviews = {};
    if (this.videoInput) {
      this.videoInput.nativeElement.value = '';
    }
    this.uploadProgress = 0;
    this.currentUploadState = 'Aguardando...';
    this.isEditMode = false;
    this.idAula = null;
  }


  onFileSelected(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      if (field === 'video') {
        this.isVideoLoading = true;

        if (file.type.startsWith('video/')) {
          const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB

          if (file.size > MAX_FILE_SIZE) {
            this.isVideoLoading = false;
            this.errorMessage = `O vídeo excede o tamanho máximo permitido de 5GB. Tamanho atual: ${(file.size / (1024 * 1024 * 1024)).toFixed(2)}GB`;
            this.removeFile(field);
            return;
          }

          this.revokePreviewUrl(field);
          this.video = file; // Armazena o arquivo de vídeo

          // Sua lógica de preview para vídeos grandes está ótima, vamos manter
          const MAX_PREVIEW_SIZE = 100 * 1024 * 1024; // 100MB

          if (file.size <= MAX_PREVIEW_SIZE) {
            this.fotoPreviews[field] = URL.createObjectURL(file);
          } else {
            this.fotoPreviews[field] = 'large-video-selected';
          }

          this.isVideoLoading = false;
        } else {
          // (Mantida sua lógica para lidar com imagens como "vídeo")
          this.revokePreviewUrl(field);
          this.video = file;
          const reader = new FileReader();
          reader.onload = () => { this.fotoPreviews[field] = reader.result; };
          reader.onloadend = () => { this.isVideoLoading = false; };
          reader.onerror = () => { this.isVideoLoading = false; this.errorMessage = "Erro ao ler a imagem."; };
          reader.readAsDataURL(file);
        }
      }
    }
  }


  onDrop(event: DragEvent, field: string) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      if (field === 'video') {
        this.video = file;
        this.isVideoLoading = true;
        this.revokePreviewUrl(field);

        if (file.type.startsWith('video/')) {
          this.fotoPreviews[field] = URL.createObjectURL(file);
          this.isVideoLoading = false;
        } else {
          this.isVideoLoading = false;
          this.errorMessage = "Formato de arquivo não suportado.";
          this.video = null;
          this.fotoPreviews[field] = null;
        }
      }
    }
  }

  private revokePreviewUrl(field: string): void {
    const currentPreview = this.fotoPreviews[field];
    if (typeof currentPreview === 'string' && currentPreview.startsWith('blob:')) {
      URL.revokeObjectURL(currentPreview);
    }
  }

  removeFile(field: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (field === 'video') {
      this.revokePreviewUrl(field);
      this.video = null;
      this.fotoPreviews[field] = null;
      this.videoInput.nativeElement.value = '';
      this.isVideoLoading = false;
      if (this.aulaDTO.id) {
        this.aulaDTO.urlVideo = null;
      }
    }
  }

  // ... (onPdfSelected, removePdf, carregarAula, isDarkMode, etc.) ...
  // ... (isImage, isVideo, urlIsImage, urlIsVideo) ...
  // ... (isPreviewImage, isPreviewVideo) ...

  onPdfSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      for (let i = 0; i < input.files.length; i++) {
        if (this.arquivos.length < 3) {
          this.arquivos.push(input.files[i]);
        } else {
          this.errorMessage = 'Você pode enviar no máximo 3 arquivos PDF.';
          break;
        }
      }
    }
  }

  removePdf(index: number): void {
    this.arquivos.splice(index, 1);
  }

  carregarAula(id: number): void {
    console.log('carregarAula chamado com id:', id);
    this.aulasService.buscarAulaPorId(id).subscribe(
      (response: Aula) => {
        console.log('Dados da aula recebidos:', response);
        this.aula = response;
        this.aulaDTO = new Aula();
        Object.assign(this.aulaDTO, response);

        if (this.aula.urlVideo) {
          this.fotoPreviews['video'] = this.aula.urlVideo;
        }
        this.video = null;
        this.arquivos = [];

        if (this.aula.documentos && this.aula.documentos.length > 0) {
          this.arquivos = [];
          console.warn("Carregamento de PDFs existentes não implementado para re-upload.");
        }
      },
      (error) => {
        console.error('Erro ao carregar aula:', error);
      }
    );
  }

  isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  isImage(fileUrl: string | ArrayBuffer | null): boolean {
    return typeof fileUrl === 'string' && fileUrl.startsWith('data:image/');
  }

  isVideo(fileUrl: string | ArrayBuffer | null): boolean {
    return typeof fileUrl === 'string' && fileUrl.startsWith('data:video/');
  }

  urlIsImage(url: string): boolean {
    return typeof url === 'string' && /\.(jpeg|jpg|png|gif)$/i.test(url);
  }

  urlIsVideo(url: string): boolean {
    return typeof url === 'string' && /\.(mp4|webm|ogg)$/i.test(url);
  }

  isPreviewImage(preview: string | ArrayBuffer | null): boolean {
    return (
      typeof preview === 'string' &&
      (this.isImage(preview) || this.urlIsImage(preview))
    );
  }

  isPreviewVideo(preview: string | ArrayBuffer | null): boolean {
    return (
      typeof preview === 'string' &&
      (this.isVideo(preview) || this.urlIsVideo(preview) || preview.startsWith('blob:'))
    );
  }


  getCategoriaEnum(categoria: string): Categoria | null {
    const categoriaEnum = Object.values(Categoria).find(
      cat => cat === categoria || cat.replace(/_/g, ' ').toLowerCase() === categoria.toLowerCase()
    );
    return categoriaEnum || null;
  }
}