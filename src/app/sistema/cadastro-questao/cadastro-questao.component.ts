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

@Component({
  selector: 'app-cadastro-questao',
  templateUrl: './cadastro-questao.component.html',
  styleUrls: ['./cadastro-questao.component.css']
})

export class CadastroQuestaoComponent implements OnInit,  AfterViewInit {
  usuario: Usuario | null = null;
  Permissao = Permissao; // Adicione esta linha
  formData = new FormData();
  questaoDTO = new Questao();
  successMessage: string | null = null;
  errorMessage: string | null = null;
  fotoDaQuestao: File | null = null;
  fotoDaQuestaoDois: File | null = null;
  fotoDaQuestaoTres: File | null = null;
  fotoDaRespostaUm: File | null = null;
  fotoDaRespostaDois: File | null = null;
  // fotoDaRespostaDois: File | null = null;
  // fotoDaRespostaTres: File | null = null;
  imagePreviews: { [key: string]: string | ArrayBuffer | null } = {};
  id!: number;
  selectedAlternativa: number | undefined;

  selectedAlternativeIndex: number = -3;

  anos: string[] = Object.values(Ano);
  dificuldades: string[] = Object.values(Dificuldade);
  temas: string[] = Object.values(Tema);
  subtemas: string[] = Object.values(Subtema);
  tiposDeProva: string[] = Object.values(TipoDeProva);
  relevancias: string[] = Object.values(Relevancia);

  selectedImage: string='';
  uploadedImage: string='';

  // editorConfig: any;

  editorContent: string = '';
  // Configuração da barra de ferramentas
  editorConfig = {
  toolbar: '#toolbar'
};

editorConfig1 = {
  toolbar: '#toolbar1'
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
      { id: 1, texto: '1', correta: false },
      { id: 2, texto: '2', correta: false },
      { id: 3, texto: '3', correta: false },
      { id: 4, texto: '4', correta: false }
    ];
    
    this.usuario = this.authService.getUsuarioAutenticado();

    //Selecion o tem texto por defaault
    this.questaoDTO.tipoItemQuestao='texto'
    this.questaoDTO.tipoItemQuestaoImagem='texto'

  }

  ngAfterViewInit(): void {
    const quill = new Quill('#editor', {
      modules: {
        toolbar: this.editorConfig.toolbar
      },
      theme: 'snow'
    });

    quill.on('text-change', () => {
      this.questaoDTO.comentarioDaQuestao = quill.root.innerHTML;
    });

    const quill1 = new Quill('#editor1', {
      modules: {
        toolbar: this.editorConfig1.toolbar
      },
      theme: 'snow'
    });

    quill1.on('text-change', () => {
      this.questaoDTO.enunciadoDaQuestao = quill1.root.innerHTML;
    });
  }

    // Função para obter o conteúdo do editor
    getEditorContent() {
      console.log(this.editorContent);
    }


  

   onAlternativaChange(index: number) {
    this.selectedAlternativa = index;
  }

  carregarQuestao(id: number): void {
    console.log('Carregando questão com ID:', id);
    this.questoesService.getQuestaoById(id).subscribe(
      questao => {
        this.questaoDTO = questao;
        this.questaoDTO.alternativas = this.questaoDTO.alternativas || [];  // Inicializa alternativas se for undefined
        this.selectedAlternativeIndex = this.questaoDTO.alternativas.findIndex(alt => alt.correta);
        console.log('Questão carregada:', this.questaoDTO);
      },
      error => {
        console.error('Erro ao carregar questão:', error);
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
        default:
          break;
      }
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews[field] = reader.result;
        console.log(`Imagem carregada para o campo ${field}.`);
      };
      reader.readAsDataURL(file);
    }
  }
  onDrop(event: DragEvent, field: string) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews[field] = reader.result;
        console.debug(`Imagem arrastada para o campo ${field}.`);
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
    console.log('Alternativa correta atualizada:', this.questaoDTO.alternativas);
  }

  markCorrect(index: number): void {
    this.updateCorrectAlternative(index);
    console.log('Alternativa correta marcada:', this.questaoDTO.alternativas);
    console.log('Alternativa correta selecionada:', index);
    this.questaoDTO.alternativaCorreta = [this.questaoDTO.alternativas[index]];
  }

    markCorrectImage(index: number): void {
    this.updateCorrectAlternative(index);
    console.log('Alternativa correta marcada:', this.questaoDTO.alternativas);
    console.log('Alternativa correta selecionada:', index);
    this.questaoDTO.alternativaCorreta = [this.questaoDTO.alternativas[index]];
  }

onSubmit(): void {
    console.log('Form data:', this.questaoDTO);
  
    // Ensure the editor content is up-to-date
    const quillEditor = document.querySelector('#editor .ql-editor');
    if (quillEditor) {
      this.questaoDTO.comentarioDaQuestao = quillEditor.innerHTML;
    }

    const quillEditor1 = document.querySelector('#editor1 .ql-editor');
    if (quillEditor1) {
      this.questaoDTO.enunciadoDaQuestao = quillEditor1.innerHTML;
    }
  
    const objetoJson = JSON.stringify(this.questaoDTO);
    this.formData = new FormData();
  
    if (this.fotoDaQuestao) {
      this.formData.append('fotoDaQuestaoArquivo', this.fotoDaQuestao);
    }
    if (this.fotoDaRespostaUm) {
      console.log("fotoDaRespostaUm: passo");
      this.formData.append('fotoDaRespostaUmArquivo', this.fotoDaRespostaUm);
    }
    if (this.fotoDaRespostaDois) {
      console.log("fotoDaRespostaDois: passo");
      this.formData.append('fotoDaRespostaDoisArquivo', this.fotoDaRespostaDois);
    }
  
    console.debug('Enviando formulário com dados da questão:', this.formData);
    console.log('CLASSE ', objetoJson);
    this.formData.append('questaoDTO', objetoJson);
  
    this.questoesService.salvar(this.formData).subscribe(
      response => {
        this.successMessage = 'Questão salva com sucesso!';
        this.errorMessage = null;
        console.debug('Questão salva com sucesso:', response);
      },
      error => {
        this.errorMessage = error;
        this.successMessage = null;
        console.error('Erro ao salvar a questão:', error);
      }
    );
  
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

  // handleImageChange(event: any, index: number) {
  // const file = event.target.files[0];
  //   const reader = new FileReader();
  //   reader.onload = () => {
  //     this.questaoDTO.alternativas[index].imagemUrl = reader.result as string;
  //   };
  //   reader.readAsDataURL(file);
  // }

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


onFileSelectedImage(event: any, identifier: string) {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    this.imagePreviews[identifier] = reader.result;
  };
  reader.readAsDataURL(file);
}



}