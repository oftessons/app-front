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

@Component({
  selector: 'app-cadastro-questao',
  templateUrl: './cadastro-questao.component.html',
  styleUrls: ['./cadastro-questao.component.css']
})
export class CadastroQuestaoComponent implements OnInit {
  questao: Questao = new Questao();
  success: boolean = false;
  errors: string[] = [];
  fotoDaQuestao: File | null = null; 
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

  onSubmit(): void {
    if (this.id) {
      this.questoesService.atualizar(this.questao).subscribe(
        response => {
          this.success = true;
          this.errors = [];
        },
        errorResponse => {
          this.errors = ['Erro ao atualizar a questão.'];
        }
      );
    } else {
      this.questoesService.salvar(this.questao).subscribe(
        response => {
          this.success = true;
          this.errors = [];
          this.questao = response;
        },
        errorResponse => {
          this.success = false;
          this.errors = errorResponse.error.errors;
        }
      );
    }
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.fotoDaQuestao = files[0];
    } else {
      this.fotoDaQuestao = null;
    }
  }

  voltarParaListagem(): void {
    this.router.navigate(['/usuario/questoes']);
  }
}
