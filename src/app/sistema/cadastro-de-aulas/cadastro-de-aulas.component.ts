import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Usuario } from 'src/app/login/usuario';
import { Permissao } from 'src/app/login/Permissao';
import { AuthService } from 'src/app/services/auth.service';

import { CategoriaAula } from '../painel-de-aulas/enums/categoriaaula';

@Component({
  selector: 'app-cadastro-de-aulas',
  templateUrl: './cadastro-de-aulas.component.html',
  styleUrls: ['./cadastro-de-aulas.component.css']
})
export class CadastroDeAulasComponent implements OnInit {

  usuario: Usuario | null = null;
  Permissao = Permissao;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  fotoDaQuestao: File | null = null;
  selectedImage: string='';
  uploadedImage: string='';
  fotoPreviews: { [key: string]: string | ArrayBuffer | null } = {};

   categoriaAula: string[] = Object.values(CategoriaAula);

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {

    this.usuario = this.authService.getUsuarioAutenticado();
  }

  onFileSelected(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      switch (field) {
        case 'fotoDaQuestao':
          this.fotoDaQuestao = file;
          break;
        default:
          break;
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
  }

}
