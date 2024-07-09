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

    this.activatedRoute.params.subscribe(params => {
      this.id = params['id'];
      if (this.id) {
        this.carregarQuestao(this.id);
      }
    });
  }

  carregarQuestao(id: number): void {
    this.questoesService.getQuestaoById(id).subscribe(
      questao => {
        this.questao = questao;
        this.questao.alternativas = this.questao.alternativas || [];  // Inicializa alternativas se for undefined
        this.selectedAlternativeIndex = this.questao.alternativas.findIndex(alt => alt.correta);
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
      };
      reader.readAsDataURL(file);
    }
  }

  updateCorrectAlternative(): void {
    if (this.selectedAlternativeIndex !== null) {
      this.questao.alternativas.forEach((alt, index) => {
        alt.correta = index === this.selectedAlternativeIndex;
      });
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }



  markCorrect(index: number): void {
    // Reset all alternativas to false
    this.questao.alternativas.forEach(alt => alt.correta = false);
  
    // Set the clicked alternativa to true
    this.questao.alternativas[index].correta = true;
  }
  


  onSubmit(): void {
    if (!this.questao.alternativas) {
      this.questao.alternativas = [];
    }

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
    formData.append('ano', this.questao.ano.toString());  // Converte enum para string
    formData.append('tema', this.questao.tema.toString());
    formData.append('dificuldade', this.questao.dificuldade.toString());
    formData.append('tipoDeProva', this.questao.tipoDeProva.toString());
    formData.append('subtema', this.questao.subtema.toString());
    formData.append('relevancia', this.questao.relevancia.toString());
    formData.append('palavraChave', this.questao.palavraChave);

    this.questao.alternativas.forEach((alternativa, index) => {
      formData.append(`alternativas[${index}].texto`, alternativa.texto);
      formData.append(`alternativas[${index}].correta`, alternativa.correta.toString());
    });

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

    this.questoesService.salvar(formData).subscribe(
      response => {
        this.successMessage = 'Questão salva com sucesso!';
        this.errorMessage = null;
      },
      error => {
        this.errorMessage = 'Erro ao salvar a questão.';
        this.successMessage = null;
      }
    );
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

  getAlternativaLabel(index: number): string {
    return String.fromCharCode(65 + index); // A = 65 na tabela ASCII
  }
}
