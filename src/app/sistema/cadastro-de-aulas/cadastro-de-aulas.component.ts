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

// NOVAS IMPORTAÇÕES
import { HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-cadastro-de-aulas',
  templateUrl: './cadastro-de-aulas.component.html',
  styleUrls: ['./cadastro-de-aulas.component.css']
})
export class CadastroDeAulasComponent implements OnInit, OnDestroy { // Implemente OnDestroy
  @ViewChild('videoInput') videoInput!: ElementRef<HTMLInputElement>;

  usuario: Usuario | null = null;
  Permissao = Permissao;
  // formData = new FormData(); // Não é mais a principal fonte
  aulaDTO = new Aula();
  successMessage: string | null = null;
  errorMessage: string | null = null;

  isLoading: boolean = false;
  uploadProgress: number = 0;
  currentUploadState: string = 'Aguardando...'; // NOVO: Para UX
  isVideoLoading: boolean = false;

  aula: Aula = new Aula();
  idAula: number | null = null;

  video: File | null = null;
  selectedImage: string = '';
  uploadedImage: string = '';
  fotoPreviews: { [key: string]: string | ArrayBuffer | null } = {};

  categoria: string[] = Object.values(Categoria);
  arquivos: File[] = [];

  isEditMode: boolean = false;

  // Tamanho mínimo da parte do S3 (exceto a última) é 5MB
  private readonly CHUNK_SIZE = 5 * 1024 * 1024;

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private aulasService: AulasService,
    private themeService: ThemeService,
    private http: HttpClient // NOVO: Injetado para uploads S3
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
        this.aulaDTO.id = this.idAula; // Garante que o ID está no DTO para atualização
        console.log('Modo de edição ativado');
        this.carregarAula(this.idAula);
      }
    });
  }

  ngOnDestroy(): void {
    // Revoga o URL do blob ao sair do componente para evitar vazamento de memória
    this.revokePreviewUrl('video');
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  // =================================================================
  // NOVA LÓGICA DE SUBMISSÃO (MPU)
  // =================================================================

  async onSubmit(): Promise<void> {
    console.log('Formulário enviado');
    this.successMessage = null;
    this.errorMessage = null;

    // 1. Verifica se há um vídeo para o MPU
    if (!this.video && !this.isEditMode) {
      this.errorMessage = 'Por favor, anexe um vídeo para a aula.';
      return;
    }

    // ... (sua lógica de verificação de modo de edição) ...
    if (this.isEditMode && !this.video && this.aulaDTO.urlVideo) {
      console.warn('Fluxo de "atualizar metadados" não implementado.');
      this.errorMessage = "Para atualizar, selecione um novo vídeo ou crie um endpoint de atualização de metadados."
      return;
    }


    this.isLoading = true;
    this.uploadProgress = 0;

    try {
      // ==========================
      // PASSO 1: Iniciar Upload
      // ==========================
      this.currentUploadState = 'Iniciando upload e salvando dados...';

      if (!this.video) { // Verificação de tipo para o TypeScript
        throw new Error('Vídeo não encontrado para iniciar o upload.');
      }

      const initRequest = {
        // CORREÇÃO: Removida a lógica de `idUser: String()` que estava no seu
        // código anterior, pois pode causar erro. O spread `...this.aulaDTO`
        // já deve ser suficiente.
        aulaDTO: this.aulaDTO,
        fileName: this.video.name,
        contentType: this.video.type
      };

      // ▼▼▼ MUDANÇA AQUI ▼▼▼
      const initResponse = await this.aulasService.iniciarUpload(initRequest).toPromise();
      const { uploadId, key } = initResponse;
      console.log('Upload iniciado:', uploadId, key);

      // ==========================
      // PASSO 2: Upload das Partes
      // ==========================
      if (!this.video) { // Verificação de tipo
        throw new Error('Vídeo não encontrado para upload.');
      }
      const totalParts = Math.ceil(this.video.size / this.CHUNK_SIZE);
      const uploadedParts: { partNumber: number, eTag: string }[] = [];

      for (let i = 0; i < totalParts; i++) {
        const partNumber = i + 1;
        this.currentUploadState = `Enviando parte ${partNumber} de ${totalParts}...`;

        const start = i * this.CHUNK_SIZE;
        const end = Math.min(start + this.CHUNK_SIZE, this.video.size);
        const fileChunk = this.video.slice(start, end);

        // 2a. Pedir a URL pré-assinada
        // ▼▼▼ MUDANÇA AQUI ▼▼▼
        const urlResponse = await this.aulasService.gerarUrlParte(key, uploadId, partNumber).toPromise();
        const presignedUrl = urlResponse.presignedUrl;

        // 2b. Fazer o PUT para o S3 (diretamente)
        // ▼▼▼ MUDANÇA AQUI ▼▼▼
        const s3Response = await this.http.put(presignedUrl, fileChunk, {
          observe: 'response',
          reportProgress: false
        }).toPromise(); // <--- .toPromise()

        // 2c. Capturar o ETag
        // s3Response agora é a resposta completa, pois .toPromise() aguarda a conclusão.
        const etag = s3Response.headers.get('ETag')?.replace(/"/g, ""); // Limpa aspas
        if (!etag) {
          throw new Error(`Não foi possível obter o ETag para a parte ${partNumber}`);
        }

        uploadedParts.push({ partNumber: partNumber, eTag: etag });

        // 2d. Atualizar a barra de progresso
        this.uploadProgress = Math.round((partNumber / totalParts) * 100);
      }

      // ==========================
      // PASSO 3: Finalizar Upload
      // ==========================
      this.currentUploadState = 'Finalizando upload...';

      const finalizarDTO = { key, uploadId, parts: uploadedParts };
      const finalFormData = new FormData();

      // Adiciona o DTO de finalização como JSON
      finalFormData.append('finalizarDTO',
        new Blob([JSON.stringify(finalizarDTO)], { type: 'application/json' })
      );

      // Adiciona os PDFs (se houver)
      if (this.arquivos.length > 0) {
        this.arquivos.forEach((arquivo) => {
          finalFormData.append(`arquivos`, arquivo);
        });
      }

      // ▼▼▼ MUDANÇA AQUI ▼▼▼
      const aulaFinal = await this.aulasService.finalizarUpload(finalFormData).toPromise();

      // ==========================
      // SUCESSO!
      // ==========================
      this.isLoading = false;
      this.successMessage = this.isEditMode ? 'Aula atualizada com sucesso!' : 'Aula salva com sucesso!';
      this.errorMessage = null;
      console.log('Aula final salva:', aulaFinal);

      // Limpa os campos
      this.resetForm();

    } catch (error) {
      console.error('Erro no fluxo de upload:', error);
      this.isLoading = false;
      this.errorMessage = 'Erro ao salvar a aula. Verifique o console.';
      this.uploadProgress = 0;
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
    // Opcional: Redirecionar
    // this.router.navigate(['/usuario/dashboard']);
  }


  // =================================================================
  // MÉTODOS DE ANEXO DE ARQUIVO (JÁ CORRIGIDOS ANTERIORMENTE)
  // =================================================================

  onFileSelected(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      if (field === 'video') {
        this.video = file;
        this.isVideoLoading = true;
        this.revokePreviewUrl(field); // Limpa o blob anterior

        if (file.type.startsWith('video/')) {
          this.fotoPreviews[field] = URL.createObjectURL(file);
          this.isVideoLoading = false;
        } else if (file.type.startsWith('image/')) {
          // (Mantido por compatibilidade, mas o input aceita video/*)
          const reader = new FileReader();
          reader.onload = () => { this.fotoPreviews[field] = reader.result; };
          reader.onloadend = () => { this.isVideoLoading = false; };
          reader.onerror = () => { this.isVideoLoading = false; this.errorMessage = "Erro ao ler a imagem."; };
          reader.readAsDataURL(file);
        } else {
          this.isVideoLoading = false;
          this.errorMessage = "Formato de arquivo não suportado.";
          this.removeFile(field);
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
          // ... (lógica de imagem ou erro) ...
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
        this.aulaDTO.urlVideo = null; // Indica que o vídeo existente deve ser removido/substituído
      }
    }
  }

  // ... (onPdfSelected, removePdf, carregarAula, isDarkMode, etc.) ...
  // ... (isImage, isVideo, urlIsImage, urlIsVideo) ...
  // ... (isPreviewImage, isPreviewVideo) ...

  // Copiando os métodos que faltam do seu código original:

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

        // Carregar documentos existentes (Atenção: isso não os torna 'File's)
        // A lógica de 'atualizar PDFs' precisará ser tratada
        if (this.aula.documentos && this.aula.documentos.length > 0) {
          // Apenas para exibição, esta parte é complexa
          // Por enquanto, vamos limpar os arquivos
          this.arquivos = [];
          console.warn("Carregamento de PDFs existentes não implementado para re-upload.");
          // Se você quiser listar os PDFs existentes, precisará de outra UI
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
}