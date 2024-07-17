import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-cadastro-questao',
  templateUrl: './cadastro-questao.component.html',
  styleUrls: ['./cadastro-questao.component.css']
})
export class CadastroQuestaoComponent implements OnInit {
  formData = new FormData();

  questaoDTO = new Questao();
  successMessage: string | null = null;
  errorMessage: string | null = null;
  fotoDaQuestao: File | null = null;
  fotoDaQuestaoDois: File | null = null;
  fotoDaQuestaoTres: File | null = null;
  fotoDaResposta: File | null = null;
  fotoDaRespostaDois: File | null = null;
  fotoDaRespostaTres: File | null = null;
  imagePreviews: { [key: string]: string | ArrayBuffer | null } = {};
  id!: number;

  selectedAlternativeIndex: number = -3;

  anos: string[] = Object.values(Ano);
  dificuldades: string[] = Object.values(Dificuldade);
  temas: string[] = Object.values(Tema);
  subtemas: string[] = Object.values(Subtema);
  tiposDeProva: string[] = Object.values(TipoDeProva);
  relevancias: string[] = Object.values(Relevancia);

  constructor(
    private questoesService: QuestoesService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.questaoDTO.alternativas = [
      { id: 1, texto: 'A', correta: false },
      { id: 2, texto: 'B', correta: false },
      { id: 3, texto: 'C', correta: false },
      { id: 4, texto: 'D', correta: false }
    ];
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
        case 'fotoDaQuestaoDois':
          this.fotoDaQuestaoDois = file;
          break;
        case 'fotoDaQuestaoTres':
          this.fotoDaQuestaoTres = file;
          break;
        case 'fotoDaResposta':
          this.fotoDaResposta = file;
          break;
        case 'fotoDaRespostaDois':
          this.fotoDaRespostaDois = file;
          break;
        case 'fotoDaRespostaTres':
          this.fotoDaRespostaTres = file;
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

  onSubmit(): void {
    const onjetojson = this.questaoDTO.toJson();

    if (this.fotoDaQuestao) {
      this.formData.append('fotoDaQuestaoArquivo', this.fotoDaQuestao);
    }
    if (this.fotoDaQuestaoDois) {
      this.formData.append('fotoDaQuestaoDoisArquivo', this.fotoDaQuestaoDois);
    }
    if (this.fotoDaQuestaoTres) {
      this.formData.append('fotoDaQuestaoTres', this.fotoDaQuestaoTres);
    }
    if (this.fotoDaResposta) {
      this.formData.append('fotoDaRespostaArquivo', this.fotoDaResposta);
    }
    if (this.fotoDaRespostaDois) {
      this.formData.append('fotoDaRespostaDoisArquivo', this.fotoDaRespostaDois);
    }
    if (this.fotoDaRespostaTres) {
      this.formData.append('fotoDaRespostaTresArquivo', this.fotoDaRespostaTres);
    }

    console.debug('Enviando formulário com dados da questão:', this.formData);
    console.log('CLASSE ', JSON.stringify(this.questaoDTO));
    this.formData.append('questaoDTO', onjetojson);

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
}
