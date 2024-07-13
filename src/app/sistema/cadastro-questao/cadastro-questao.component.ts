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

  questao: Questao = new Questao();
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
    this.questao.alternativas = [
      { id: 1, texto: 'A', correta: false, questoes: this.questao },
      { id: 2, texto: 'B', correta: false, questoes: this.questao },
      { id: 3, texto: 'C', correta: false, questoes: this.questao },
      { id: 4, texto: 'D', correta: false, questoes: this.questao }
    ];
  }

  carregarQuestao(id: number): void {
    console.log('Carregando questão com ID:', id);
    this.questoesService.getQuestaoById(id).subscribe(
      questao => {
        this.questao = questao;
        this.questao.alternativas = this.questao.alternativas || [];  // Inicializa alternativas se for undefined
        this.selectedAlternativeIndex = this.questao.alternativas.findIndex(alt => alt.correta);
        console.log('Questão carregada:', this.questao);
      },
      error => {
        console.error('Erro ao carregar questão:', error);
      }
    );
  }

  onFileSelected(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
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
    this.questao.alternativas.forEach((alt, i) => {
      alt.correta = i === index;
    });
    console.log('Alternativa correta atualizada:', this.questao.alternativas);
  }

  markCorrect(index: number): void {
    this.updateCorrectAlternative(index);
    console.log('Alternativa correta marcada:', this.questao.alternativas);
    console.log('Alternativa correta selecionada:', index);
  }
  
  onSubmit(): void {
    this.updateCorrectAlternative(this.selectedAlternativeIndex);

    const formData = new FormData();
    formData.append('title', this.questao.title);
    formData.append('enunciadoDaQuestao', this.questao.enunciadoDaQuestao);
    formData.append('afirmacaoUm', this.questao.afirmacaoUm);
    formData.append('afirmacaoDois', this.questao.afirmacaoDois);
    formData.append('afirmacaoTres', this.questao.afirmacaoTres);
    formData.append('afirmacaoQuatro', this.questao.afirmacaoQuatro);
    formData.append('assinale', this.questao.assinale);
    formData.append('comentarioDaQuestaoUm', this.questao.comentarioDaQuestaoUm);
    formData.append('comentarioDaQuestaoDois', this.questao.comentarioDaQuestaoDois);
    formData.append('referenciaBi', this.questao.referenciaBi);
    formData.append('comentadorDaQuestao', this.questao.comentadorDaQuestao);
    formData.append('ano', this.questao.ano.toString());
    formData.append('tema', this.questao.tema.toString());
    formData.append('dificuldade', this.questao.dificuldade.toString());
    formData.append('tipoDeProva', this.questao.tipoDeProva.toString());
    formData.append('subtema', this.questao.subtema.toString());
    formData.append('relevancia', this.questao.relevancia.toString());
    formData.append('palavraChave', this.questao.palavraChave);

      // Adiciona cada alternativa individualmente ao FormData
      if (this.questao.alternativas) {
        this.questao.alternativas.forEach((alternativa, index) => {
            formData.append(`alternativas[${index}].texto`, alternativa.texto);
            formData.append(`alternativas[${index}].correta`, alternativa.correta.toString());
            // Adicione outros campos da alternativa conforme necessário
        });
    }

    if (this.fotoDaQuestao) {
        formData.append('fotoDaQuestao', this.fotoDaQuestao);
    }
    if (this.fotoDaQuestaoDois) {
        formData.append('fotoDaQuestaoDois', this.fotoDaQuestaoDois);
    }
    if (this.fotoDaQuestaoTres) {
        formData.append('fotoDaQuestaoTres', this.fotoDaQuestaoTres);
    }
    if (this.fotoDaResposta) {
        formData.append('fotoDaResposta', this.fotoDaResposta);
    }
    if (this.fotoDaRespostaDois) {
        formData.append('fotoDaRespostaDois', this.fotoDaRespostaDois);
    }
    if (this.fotoDaRespostaTres) {
        formData.append('fotoDaRespostaTres', this.fotoDaRespostaTres);
    }

    console.debug('Enviando formulário com dados da questão:', this.questao);

    this.questoesService.salvar(formData).subscribe(
        response => {
            this.successMessage = 'Questão salva com sucesso!';
            this.errorMessage = null;
            console.debug('Questão salva com sucesso:', response);
        },
        error => {
            this.errorMessage = 'Erro ao salvar a questão.';
            this.successMessage = null;
            console.error('Erro ao salvar a questão:', error);
        }
    );

    console.log('Dados da questão antes de enviar:', {
        title: this.questao.title,
        alternativas: this.questao.alternativas
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
