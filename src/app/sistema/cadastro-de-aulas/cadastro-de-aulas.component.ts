import { Component, OnInit, AfterViewInit } from '@angular/core';
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

  usuario: Usuario | null = null;
  Permissao = Permissao;
  formData = new FormData();
  aulaDTO = new Aula();
  successMessage: string | null = null;
  errorMessage: string | null = null;

  video: File | null = null;
  selectedImage: string = '';
  uploadedImage: string = '';
  fotoPreviews: { [key: string]: string | ArrayBuffer | null } = {};

  categoria: string[] = Object.values(Categoria);
  arquivos: File[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private aulasService: AulasService
  ) {}

  ngOnInit(): void {

    this.usuario = this.authService.getUsuarioAutenticado();
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
    console.log('Form submitted');
    this.formData = new FormData();
    const objetoJson = JSON.stringify(this.aulaDTO);

    if (this.video) {
      console.log('Vídeo selecionado:', this.video);
      this.formData.append('video', this.video);
    }
    this.formData.append('aulaDTO', objetoJson);

    if (this.arquivos.length > 0) {
      this.arquivos.forEach((arquivo) => {
        this.formData.append(`arquivos`, arquivo);
      });
    }

    if (!this.aulaDTO.id) {
      this.aulasService.salvar(this.formData).subscribe(
        (response) => {
          this.successMessage = 'Aula salva com sucesso!';
          this.errorMessage = null;
          console.debug('Aula salva com sucesso:', response);
        },
        (error) => {
          this.errorMessage = 'Erro ao salvar a aula.';
          this.successMessage = null;
          console.error('Erro ao salvar a aula:', error);
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
}
