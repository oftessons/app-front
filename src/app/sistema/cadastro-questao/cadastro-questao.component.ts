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
import { getDescricaoAno, getDescricaoDificuldade, getDescricaoSubtema, getDescricaoTema, getDescricaoTipoDeProva } from '../page-questoes/enums/enum-utils';

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

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  markCorrect(index: number): void {
    this.questao.alternativas.forEach((alt, i) => {
      alt.correta = (i === index);
    });
  }

  onSubmit(): void {
    const formData = new FormData();
    formData.append('title', this.questao.title);
    formData.append('enunciadoDaQuestao', this.questao.enunciadoDaQuestao);
    formData.append('assinale', this.questao.assinale);
    formData.append('comentarioDaQuestaoUm', this.questao.comentarioDaQuestaoUm);
    formData.append('comentarioDaQuestaoDois', this.questao.comentarioDaQuestaoDois);
    formData.append('referenciaBi', this.questao.referenciaBi);
    formData.append('comentadorDaQuestao', this.questao.comentadorDaQuestao);
    formData.append('ano', this.questao.ano);
    formData.append('tema', this.questao.tema);
    formData.append('dificuldade', this.questao.dificuldade);
    formData.append('tipoDeProva', this.questao.tipoDeProva);
    formData.append('subtema', this.questao.subtema);
    formData.append('relevancia', this.questao.relevancia);
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

  getDescricaoTipoDeProva(tipoDeProva: TipoDeProva): string {
    return getDescricaoTipoDeProva(tipoDeProva);
  }

  getDescricaoAno(ano: Ano): string {
    return getDescricaoAno(ano);
  }

  getDescricaoDificuldade(dificuldade: Dificuldade): string {
    return getDescricaoDificuldade(dificuldade);
  }

  getDescricaoSubtema(subtema: Subtema): string {
    return getDescricaoSubtema(subtema);
  }

  getDescricaoTema(tema: Tema): string {
    return getDescricaoTema(tema);
  }

  onFileChange(event: any, fieldName: string): void {
    const files = event.target.files;
    if (files.length > 0) {
      (this as any)[fieldName] = files[0];
    } else {
      (this as any)[fieldName] = null;
    }
  }

  voltarParaListagem(): void {
    this.router.navigate(['/usuario/questoes']);
  }
}
