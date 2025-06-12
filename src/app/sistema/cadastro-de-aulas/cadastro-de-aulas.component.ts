import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Usuario } from 'src/app/login/usuario';
import { Permissao } from 'src/app/login/Permissao';
import { AuthService } from 'src/app/services/auth.service';

import { Categoria } from '../painel-de-aulas/enums/categoria';
import { Aula } from '../painel-de-aulas/aula';
import { AulasService } from 'src/app/services/aulas.service';

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

  aula: Aula = new Aula();
  idAula: number | null = null;

  video: File | null = null;
  selectedImage: string = '';
  uploadedImage: string = '';
  fotoPreviews: { [key: string]: string | ArrayBuffer | null } = {};

  categoria: string[] = Object.values(Categoria);
  arquivos: File[] = [];

  isEditMode: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private aulasService: AulasService
  ) {}

  ngOnInit(): void {
    console.log('ngOnInit chamado');
    this.usuario = this.authService.getUsuarioAutenticado();
    console.log('Usuário autenticado:', this.usuario);

    this.activatedRoute.params.subscribe(params => {
      this.idAula = params['id'];
      console.log('ID da aula:', this.idAula);
      if (this.idAula) {
        this.isEditMode = true;
        console.log('Modo de edição ativado');
        this.carregarAula(this.idAula);
      }
    });
  }

  onFileSelected(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      if (field === 'video') {
        this.video = file;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreviews[field] = reader.result;
      };
      reader.readAsDataURL(file);
    }
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
      (this.isVideo(preview) || this.urlIsVideo(preview))
    );
  }

  onDrop(event: DragEvent, field: string) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreviews[field] = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onSubmit(): void {
    console.log('FormulÃ¡rio enviado');
    this.isLoading = true; 
    this.successMessage = null;
    this.errorMessage = null;

    this.formData = new FormData();
    
    const objetoJson = this.aulaDTO.id 
      ? this.aulaDTO.toJsonUpdate() 
      : JSON.stringify(this.aulaDTO);

    console.log('Objeto JSON', objetoJson);

    if (this.video) {
      this.formData.append('video', this.video);
    }

    if(!this.aulaDTO.id){
      this.formData.append('aulaDTO', objetoJson);
    }else{
      const jsonBlob = new Blob([objetoJson], { type: 'application/json' });
      this.formData.append('aulaDTO', jsonBlob);
      console.log('Objeto JSON Blob', jsonBlob);
    }

    if (this.arquivos.length > 0) {
      this.arquivos.forEach((arquivo) => {
        this.formData.append(`arquivos`, arquivo);
      });
    }

    // Log the formData content
    this.formData.forEach((value, key) => {
      console.log(key, value);
    });

    if (!this.aulaDTO.id) {
      this.aulasService.salvar(this.formData).subscribe(
        (response) => {
          this.isLoading = false; // Finaliza o carregamento
          this.successMessage = 'Aula salva com sucesso!';
          this.errorMessage = null;
          console.debug('Aula salva com sucesso:', response);
        },
        (error) => {
          this.isLoading = false; // Finaliza o carregamento
          this.errorMessage = 'Erro ao salvar a aula.';
          this.successMessage = null;
          console.error('Erro ao salvar a aula:', error);
        }
      );
    } else {
      console.log('Atualizando aula com ID:', this.aulaDTO);
      console.log('FormData:', this.formData);
      this.aulasService.atualizar(this.aulaDTO.id, this.formData).subscribe(
        (response) => {
          this.isLoading = false; // Finaliza o carregamento
          this.successMessage = 'Aula atualizada com sucesso!';
          this.errorMessage = null;
          console.debug('Aula atualizada com sucesso:', response);
        },
        (error) => {
          this.isLoading = false; // Finaliza o carregamento
          this.errorMessage = 'Erro ao atualizar a aula.';
          this.successMessage = null;
          console.error('Erro ao atualizar a aula:', error);
        }
      );
    }
  }

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

        // Carregar documentos existentes
        if (this.aula.documentos && this.aula.documentos.length > 0) {
          this.aula.documentos.forEach((doc) => {
            const file = new File([doc.url], doc.key, { type: 'application/pdf' });
            this.arquivos.push(file);
          });
        }
      },
      (error) => {
        console.error('Erro ao carregar aula:', error);
      }
    );
  }

  removeFile(field: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if(this.aulaDTO.id){
      if (field === 'video') {
        this.video = null;
        this.aulaDTO.urlVideo = null;
        this.fotoPreviews[field] = null;
        this.videoInput.nativeElement.value = '';
      }
    }else{
      if (field === 'video') {
        this.video = null;
        this.fotoPreviews[field] = null;
        this.videoInput.nativeElement.value = '';
      }
    }
  }
}