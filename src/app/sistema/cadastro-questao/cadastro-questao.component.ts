import { Component, OnInit,  AfterViewInit } from '@angular/core';
import { Questao } from '../page-questoes/questao';
import { Ano } from '../page-questoes/enums/ano';
import { Tema } from '../page-questoes/enums/tema';
import { Dificuldade } from '../page-questoes/enums/dificuldade';
import { TipoDeProva } from '../page-questoes/enums/tipoDeProva';
import { Subtema } from '../page-questoes/enums/subtema';
import { Relevancia } from '../page-questoes/enums/relevancia';
import { QuestoesService } from 'src/app/services/questoes.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Alternativa } from '../alternativa';
import { TinymceService } from 'src/app/services/tinymce.service';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Usuario } from 'src/app/login/usuario';
import { Permissao } from 'src/app/login/Permissao';
import { AuthService } from 'src/app/services/auth.service';

import Quill from 'quill';
import { AnoDescricoes } from '../page-questoes/enums/ano-descricoes';
import { DificuldadeDescricoes } from '../page-questoes/enums/dificuldade-descricao';
import { TemaDescricoes } from '../page-questoes/enums/tema-descricao';
import { SubtemaDescricoes } from '../page-questoes/enums/subtema-descricao';
import { TipoDeProvaDescricoes } from '../page-questoes/enums/tipodeprova-descricao';
import { RelevanciaDescricao } from '../page-questoes/enums/relevancia-descricao';

@Component({
  selector: 'app-cadastro-questao',
  templateUrl: './cadastro-questao.component.html',
  styleUrls: ['./cadastro-questao.component.css']
})

export class CadastroQuestaoComponent implements OnInit,  AfterViewInit {
  loading: boolean = false;
  usuario: Usuario | null = null;
  Permissao = Permissao;
  formData = new FormData();
  questaoDTO = new Questao();
  successMessage: string | null = null;
  errorMessage: string | null = null;
  fotoDaQuestao: File | null = null;
  fotoDaQuestaoDois: File | null = null;
  fotoDaQuestaoTres: File | null = null;
  fotoDaRespostaUm: File | null = null;
  fotoDaRespostaDois: File | null = null;
  fotoDaRespostaTres: File | null = null;
  fotoDaRespostaQuatro: File | null = null;
  videoDaQuestao: File | null = null;
  imagePreviews: { [key: string]: string | ArrayBuffer | null } = {};
  id!: number;
  selectedAlternativa: number | undefined;

  selectedAlternativeIndex: number = -3;

  anos: string[] = Object.values(AnoDescricoes);
  dificuldades: string[] = Object.values(DificuldadeDescricoes);
  temas: string[] = Object.values(TemaDescricoes);
  subtemas: string[] = Object.values(SubtemaDescricoes);
  tiposDeProva: string[] = Object.values(TipoDeProvaDescricoes);
  relevancias: string[] = Object.values(RelevanciaDescricao);

  selectedImage: string='';
  uploadedImage: string='';
  fotoPreviews: { [key: string]: string | ArrayBuffer | null } = {};

  // editorConfig: any;

  editorContent: string = '';
  editorConfig = {
  toolbar: '#toolbar'
};

editorConfig1 = {
  toolbar: '#toolbar1'
};

editorConfig2 = {
  toolbar: '#toolbar2'
};

editorConfig3 = {
  toolbar: '#toolbar3'
};

editorConfig4 = {
  toolbar: '#toolbar4'
};

  constructor(
    private questoesService: QuestoesService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public tinymceService: TinymceService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    // this.editorConfig = this.tinymceService.getEditorConfig();

    this.questaoDTO.alternativas = [
      {
        id: 1, texto: 'A', correta: false,
        comentario: ''
      },
      {
        id: 2, texto: 'B', correta: false,
        comentario: ''
      },
      {
        id: 3, texto: 'C', correta: false,
        comentario: ''
      },
      {
        id: 4, texto: 'D', correta: false,
        comentario: ''
      }
    ];

    this.questaoDTO.alternativaImagems = [
      { id: 1, texto: 'A', correta: false },
      { id: 2, texto: 'B', correta: false },
      { id: 3, texto: 'C', correta: false },
      { id: 4, texto: 'D', correta: false }
    ];
    
    this.usuario = this.authService.getUsuarioAutenticado();

    //Selecion o tem texto por defaault
    this.questaoDTO.tipoItemQuestao='texto'
    this.questaoDTO.tipoItemQuestaoImagem='texto'

    this.activatedRoute.params.subscribe(params => {
      this.questaoDTO.id = +params['id'];
      if (this.questaoDTO.id){
        this.questoesService.getQuestaoById(this.questaoDTO.id).subscribe(
          (questao) => {
            console.log("QUESTAO RETORNADA PELO ID: ")
            console.log(questao)
            this.questaoDTO = questao;
            this.atualizarEditoresComDados();
            this.questaoDTO.alternativas = this.questaoDTO.alternativas || [];
            if (this.questaoDTO.fotoDaQuestaoUrl) {
              this.fotoPreviews['fotoDaQuestao'] = this.questaoDTO.fotoDaQuestaoUrl;
            }
            for (let i = 0; i < this.questaoDTO.alternativas.length; i++) {
              const imagemUrl = this.questaoDTO.alternativas[i].imagemUrl;
              if (imagemUrl) {
                this.fotoPreviews['fotoDaAlternativa' + i] = imagemUrl;
              } else {
                this.fotoPreviews['fotoDaAlternativa' + i] = null;
              }
            }
            
            if (this.questaoDTO.fotoDaRespostaUmUrl){
              this.fotoPreviews['fotoDaRespostaUm'] = this.questaoDTO.fotoDaRespostaUmUrl;
            }
            if (this.questaoDTO.fotoDaRespostaDoisUrl){
              this.fotoPreviews['fotoDaRespostaDois'] = this.questaoDTO.fotoDaRespostaDoisUrl;
            }
            if (this.questaoDTO.fotoDaRespostaTresUrl){
              this.fotoPreviews['fotoDaRespostaTres'] = this.questaoDTO.fotoDaRespostaTresUrl;
            }
            if (this.questaoDTO.fotoDaRespostaQuatroUrl){
              this.fotoPreviews['fotoDaRespostaQuatro'] = this.questaoDTO.fotoDaRespostaQuatroUrl;
            }
            if (this.questaoDTO.videoDaQuestaoUrl){
              this.fotoPreviews['videoDaQuestao'] = this.questaoDTO.videoDaQuestaoUrl;
            }
          },
          (error) => {
            console.error('Erro ao carregar questão:', error);
          }
        )
      }
    });

  }

  ngAfterViewInit(): void {
    const quill4 = new Quill('#editor4', {
      modules: {
        toolbar: this.editorConfig4.toolbar
      },
      theme: 'snow'
    });
    quill4.root.innerHTML = this.questaoDTO.comentarioDaQuestaoQuatro || '';
    quill4.on('text-change', () => {
      this.questaoDTO.comentarioDaQuestaoQuatro = quill4.root.innerHTML;
    });
  
    const quill3 = new Quill('#editor3', {
      modules: {
        toolbar: this.editorConfig3.toolbar
      },
      theme: 'snow'
    });
    quill3.root.innerHTML = this.questaoDTO.comentarioDaQuestaoTres || '';
    quill3.on('text-change', () => {
      this.questaoDTO.comentarioDaQuestaoTres = quill3.root.innerHTML;
    });
  
    const quill2 = new Quill('#editor2', {
      modules: {
        toolbar: this.editorConfig2.toolbar
      },
      theme: 'snow'
    });
    quill2.root.innerHTML = this.questaoDTO.comentarioDaQuestaoDois || '';
    quill2.on('text-change', () => {
      this.questaoDTO.comentarioDaQuestaoDois = quill2.root.innerHTML;
    });
  
    const quill = new Quill('#editor', {
      modules: {
        toolbar: this.editorConfig.toolbar
      },
      theme: 'snow'
    });
    quill.root.innerHTML = this.questaoDTO.comentarioDaQuestao || '';
    quill.on('text-change', () => {
      this.questaoDTO.comentarioDaQuestao = quill.root.innerHTML;
    });
  
    const quill1 = new Quill('#editor1', {
      modules: {
        toolbar: this.editorConfig1.toolbar
      },
      theme: 'snow'
    });
    quill1.root.innerHTML = this.questaoDTO.enunciadoDaQuestao || '';
    quill1.on('text-change', () => {
      this.questaoDTO.enunciadoDaQuestao = quill1.root.innerHTML;
    });
  }

  atualizarEditoresComDados(): void {
    setTimeout(() => {
      const editor1 = document.querySelector('#editor')?.querySelector('.ql-editor');
      if (editor1) {
        editor1.innerHTML = this.questaoDTO.comentarioDaQuestao || '';
      }
  
      const editor2 = document.querySelector('#editor2')?.querySelector('.ql-editor');
      if (editor2) {
        editor2.innerHTML = this.questaoDTO.comentarioDaQuestaoDois || '';
      }
  
      const editor3 = document.querySelector('#editor3')?.querySelector('.ql-editor');
      if (editor3) {
        editor3.innerHTML = this.questaoDTO.comentarioDaQuestaoTres || '';
      }
  
      const editor4 = document.querySelector('#editor4')?.querySelector('.ql-editor');
      if (editor4) {
        editor4.innerHTML = this.questaoDTO.comentarioDaQuestaoQuatro || '';
      }
  
      const editor5 = document.querySelector('#editor1')?.querySelector('.ql-editor');
      if (editor5) {
        editor5.innerHTML = this.questaoDTO.enunciadoDaQuestao || '';
      }
    });
  }
  

    // Função para obter o conteúdo do editor
    getEditorContent() {
     // console.log(this.editorContent);
    }

   onAlternativaChange(index: number) {
    this.selectedAlternativa = index;
  }

  carregarQuestao(id: number): void {
   // console.log('Carregando questão com ID:', id);
    this.questoesService.getQuestaoById(id).subscribe(
      questao => {
        this.questaoDTO = questao;
        this.questaoDTO.alternativas = this.questaoDTO.alternativas || [];  // Inicializa alternativas se for undefined
        this.selectedAlternativeIndex = this.questaoDTO.alternativas.findIndex(alt => alt.correta);
       // console.log('Questão carregada:', this.questaoDTO);
      },
      error => {
      //  console.error('Erro ao carregar questão:', error);
      }
    );
  }
  onFileSelected(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      switch (field) {
        case 'fotoDaQuestao':
          this.fotoDaQuestao = file;
          break;
        case 'fotoDaRespostaUm':
          this.fotoDaRespostaUm = file;
          break;
        case 'fotoDaRespostaDois':
          this.fotoDaRespostaDois = file;
          break;
          case 'fotoDaRespostaTres':
          this.fotoDaRespostaTres = file;
          break;
          case 'fotoDaRespostaQuatro':
          this.fotoDaRespostaQuatro = file;
          break;
          case 'videoDaQuestao':
            this.videoDaQuestao = file;
          break;
        default:
          break;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoPreviews[field] = reader.result;
      //  console.log(`Arquivo carregado para o campo ${field}.`);
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
  
  urlIsImage(url: string | null): boolean {
    return typeof url === 'string' && /\.(jpeg|jpg|png|gif)$/i.test(url);
  }
  
  urlIsVideo(url: string | null): boolean {
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
        this.imagePreviews[field] = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  updateCorrectAlternative(index: number): void {
    this.questaoDTO.alternativas.forEach((alt, i) => {
      alt.correta = i === index;
    });
  }

  markCorrect(index: number): void {
    this.updateCorrectAlternative(index);
    this.questaoDTO.alternativaCorreta = [this.questaoDTO.alternativas[index]];
  }

    markCorrectImage(index: number): void {
    this.updateCorrectAlternative(index);
    this.questaoDTO.alternativaCorreta = [this.questaoDTO.alternativas[index]];
  }

onSubmit(): void {
  this.loading = true; 
    const quillEditor4 = document.querySelector('#editor4 .ql-editor');
    if (quillEditor4) {
      this.questaoDTO.comentarioDaQuestaoQuatro = quillEditor4.innerHTML;
    }

    const quillEditor3 = document.querySelector('#editor3 .ql-editor');
    if (quillEditor3) {
      this.questaoDTO.comentarioDaQuestaoTres = quillEditor3.innerHTML;
    }
  
    const quillEditor2 = document.querySelector('#editor2 .ql-editor');
    if (quillEditor2) {
      this.questaoDTO.comentarioDaQuestaoDois = quillEditor2.innerHTML;
    }

    const quillEditor = document.querySelector('#editor .ql-editor');
    if (quillEditor) {
      this.questaoDTO.comentarioDaQuestao = quillEditor.innerHTML;
    }

    const quillEditor1 = document.querySelector('#editor1 .ql-editor');
    if (quillEditor1) {
      this.questaoDTO.enunciadoDaQuestao = quillEditor1.innerHTML;
    }
    console.log("Alernativas: ", this.questaoDTO.alternativas);
    const objetoJson = JSON.stringify(this.questaoDTO);
    this.formData = new FormData();
  
    if (this.fotoDaQuestao) {
      this.formData.append('fotoDaQuestaoArquivo', this.fotoDaQuestao);
    }
    if (this.fotoDaRespostaUm) {
    //  console.log("fotoDaRespostaUm: passo");
      this.formData.append('fotoDaRespostaUmArquivo', this.fotoDaRespostaUm);
    }
    if (this.fotoDaRespostaDois) {
     // console.log("fotoDaRespostaDois: passo");
      this.formData.append('fotoDaRespostaDoisArquivo', this.fotoDaRespostaDois);
    }
    if (this.fotoDaRespostaTres) {
     // console.log("fotoDaRespostaTres: passo");
      this.formData.append('fotoDaRespostaTresArquivo', this.fotoDaRespostaTres);
    }
    if (this.fotoDaRespostaQuatro) {
     // console.log("fotoDaRespostaQuatro: passo");
      this.formData.append('fotoDaRespostaQuatroArquivo', this.fotoDaRespostaQuatro);
    }
    if (this.videoDaQuestao) {
      this.formData.append('videoDaQuestaoArquivo', this.videoDaQuestao);
    }
    if(this.questaoDTO.id != null){
      this.questaoDTO.alternativas.forEach((alt, index) => {
        if (alt.foto) {
          if(alt.texto == 'A'){
            this.formData.append('A', alt.foto);
          }
          if(alt.texto == 'B'){
            this.formData.append('B', alt.foto);
          }
          if(alt.texto == 'C'){
            this.formData.append('C', alt.foto);
          }
          if(alt.texto == 'D'){
            this.formData.append('D', alt.foto);
          }
        }
      });
    }else{
      if (this.questaoDTO.alternativas[0].foto) {
      this.formData.append('A', this.questaoDTO.alternativas[0].foto);
      }
      if (this.questaoDTO.alternativas[1].foto) {
        this.formData.append('B', this.questaoDTO.alternativas[1].foto);
      }
      if (this.questaoDTO.alternativas[2].foto) {
        this.formData.append('C', this.questaoDTO.alternativas[2].foto);
      }
      if (this.questaoDTO.alternativas[3].foto) {
        this.formData.append('D', this.questaoDTO.alternativas[3].foto);
      }
    }
  
    //console.debug('Enviando formulário com dados da questão:', this.formData);
   // console.log('CLASSE ', objetoJson);
    this.formData.append('questaoDTO', objetoJson);
    //console.log('objetoJson ', objetoJson);


    if(!this.questaoDTO.id){
      this.questoesService.salvar(this.formData).subscribe(
        response => {
          this.successMessage = 'Questão salva com sucesso!';
          this.errorMessage = null;
          this.loading = false; // Desativa carregamento
        //  console.debug('Questão salva com sucesso:', response);
        },
        error => {
          this.errorMessage = error;
          this.successMessage = null;
          this.loading = false; // Desativa carregamento
          console.error('Erro ao salvar a questão:', error);
        }
      );
    } else {
      console.log("Saida da Foto 0: ",this.questaoDTO.alternativas[0].foto);
      if(this.questaoDTO.alternativas[0].foto){
        console.log("Saida da Foto 0 diferente de null");
      }else{
        console.log("Saida da Foto 0 igual a null");
      }

      this.questaoDTO.alternativas.forEach((alt, index) => {
        if (alt.foto instanceof File) {
          console.log(`foto${index}`, alt.foto);
        }
      });
      console.log("Saida para o backend: ", this.questaoDTO);
      this.questoesService.atualizarQuestao(this.formData, this.questaoDTO.id).subscribe(
        response => {
          this.successMessage = 'Questão atualizada com sucesso!';
          this.errorMessage = null;
          this.loading = false; // Desativa carregamento
          console.debug('Questão atualizada com sucesso:', response);
          this.router.navigate(['/usuario/buscar-questão']);
        },
        error => {
          this.errorMessage = error;
          this.successMessage = null;
          this.loading = false; // Desativa carregamento
          console.error('Erro ao atualizar a questão:', error);
        }
      );
    }
  
    console.log('Dados da questão antes de enviar:', {
      title: this.questaoDTO.title,
      alternativas: this.questaoDTO.alternativas
    });
  }

  extractErrorMessage(errorResponse: any): string {
    if (errorResponse.error instanceof ErrorEvent) {
      return `Erro: ${errorResponse.error.message}`;
    } else if (errorResponse.error && errorResponse.error.message) {
      return `Erro: ${errorResponse.error.message}`;
    } else {
      return `Código de erro: ${errorResponse.status}\nMensagem: ${errorResponse.message}`;
    }
  }

  handleImageChange(event: any, index: number) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    this.uploadedImage = reader.result as string;
    this.questaoDTO.alternativas[index].imagemUrl = this.uploadedImage;
  };
  reader.readAsDataURL(file);
}


updateTipoItemQuestaoImagem(tipo: string) {
  this.questaoDTO.tipoItemQuestaoImagem = tipo;
}

onFileSelectedImage(event: any, alternativaIndex: string) {
  const file = event.target.files[0];

  if (file) {
    const index = parseInt(alternativaIndex.replace('afirmacao', ''));

    this.questaoDTO.alternativas[index].foto = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviews[alternativaIndex] = reader.result;
    };
    reader.readAsDataURL(file);
  }
}

onFileSelectedImageEditar(event: any, alternativaIndex: string) {
  const file = event.target.files[0];

  if (file) {
    // Atualiza a propriedade da alternativa correspondente
    const index = parseInt(alternativaIndex.replace('fotoDaAlternativa', ''), 10);
    this.questaoDTO.alternativas[index].foto = file;

    // Atualiza a pré-visualização
    const reader = new FileReader();
    reader.onload = () => {
      this.fotoPreviews[alternativaIndex] = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}

  cadastrarNovaQuestao(): void {
    this.successMessage = null;
    this.errorMessage = null;

    this.questaoDTO = new Questao();

    this.questaoDTO.alternativas = [
      {id: 1, texto: 'A', correta: false, comentario: ''},
      {id: 2, texto: 'B', correta: false, comentario: ''},
      {id: 3, texto: 'C', correta: false, comentario: ''},
      {id: 4, texto: 'D', correta: false, comentario: ''}
    ];

    this.questaoDTO.alternativaImagems = [
      { id: 1, texto: 'A', correta: false },
      { id: 2, texto: 'B', correta: false },
      { id: 3, texto: 'C', correta: false },
      { id: 4, texto: 'D', correta: false }
    ];

    this.questaoDTO.tipoItemQuestao = 'texto';
    this.questaoDTO.tipoItemQuestaoImagem = 'texto';
    this.fotoDaQuestao = null;
    this.fotoDaRespostaUm = null;
    this.fotoDaRespostaDois = null;
    this.fotoDaRespostaTres = null;
    this.fotoDaRespostaQuatro = null;
    this.videoDaQuestao = null;
    this.imagePreviews = {};
    this.fotoPreviews = {};

    this.formData = new FormData();

    this.limparEditores();

    
    setTimeout(() => {
      const drawerContentEl = document.querySelector('mat-drawer-content') as HTMLElement;
      const innerEl = drawerContentEl?.querySelector('.mat-drawer-content') as HTMLElement;
  
      if (drawerContentEl) {
        drawerContentEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (innerEl) {
        innerEl.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
      
    
  }

  private limparEditores(): void {
    setTimeout(() => {
      const editors = ['#editor', '#editor1', '#editor2', '#editor3', '#editor4'];
      editors.forEach(selector => {
        const editorElement = document.querySelector(selector);
        if (editorElement) {
          const quill = (editorElement as any).__quill;
          if (quill) {
            quill.setText('');
          }
        }
      });
    });
  }

  removeFile(fieldName: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    this.fotoPreviews[fieldName] = null;
    
    if (this.questaoDTO.id) {
      if (fieldName === 'fotoDaQuestao') {
        this.fotoPreviews['fotoDaQuestao'] = null;
        this.questaoDTO.fotoDaQuestaoUrl = null;
        this.fotoDaQuestao = null;
        
      } else if (fieldName === 'fotoDaRespostaUm') {
        this.questaoDTO.fotoDaRespostaUmUrl = null;
      } else if (fieldName === 'fotoDaRespostaDois') {
        this.questaoDTO.fotoDaRespostaDoisUrl = null;
      } else if (fieldName === 'fotoDaRespostaTres') {
        this.questaoDTO.fotoDaRespostaTresUrl = null;
      } else if (fieldName === 'fotoDaRespostaQuatro') {
        this.questaoDTO.fotoDaRespostaQuatroUrl = null;
      } else if (fieldName === 'videoDaQuestao') {
        this.questaoDTO.videoDaQuestaoUrl = null;
      } else if (fieldName.startsWith('fotoDaAlternativa')) {
        const index = parseInt(fieldName.replace('fotoDaAlternativa', ''), 10);
        if (!isNaN(index) && index >= 0 && index < 4) {
          if (index === 0) this.questaoDTO.alternativas[0].imagemUrl = null;
          if (index === 1) this.questaoDTO.alternativas[1].imagemUrl = null;
          if (index === 2) this.questaoDTO.alternativas[2].imagemUrl = null;
          if (index === 3) this.questaoDTO.alternativas[3].imagemUrl = null;
        }
      }
    }
    
    if (fieldName === 'fotoDaQuestao') {
      this.fotoDaQuestao = null;
    } else if (fieldName === 'videoDaQuestao') {
      this.videoDaQuestao = null;
    } else if (fieldName.startsWith('fotoDaResposta')) {
      if (fieldName === 'fotoDaRespostaUm') this.fotoDaRespostaUm = null;
      if (fieldName === 'fotoDaRespostaDois') this.fotoDaRespostaDois = null;
      if (fieldName === 'fotoDaRespostaTres') this.fotoDaRespostaTres = null;
      if (fieldName === 'fotoDaRespostaQuatro') this.fotoDaRespostaQuatro = null;
    } else if (fieldName.startsWith('afirmacao')) {
      const index = parseInt(fieldName.replace('afirmacao', ''), 10);
      if (!isNaN(index) && this.questaoDTO.alternativas[index]) {
        this.imagePreviews[fieldName] = null;
        this.questaoDTO.alternativas[index].foto = undefined;
      }
      
    } else if (fieldName.startsWith('fotoDaAlternativa')) {
      const index = parseInt(fieldName.replace('fotoDaAlternativa', ''), 10);
      if (!isNaN(index) && this.questaoDTO.alternativas[index]) {
        this.fotoPreviews[fieldName] = null;
        this.questaoDTO.alternativas[index].foto = undefined;
      }
    }
  }
}