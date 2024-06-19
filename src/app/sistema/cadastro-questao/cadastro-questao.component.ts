import { Component, OnInit } from '@angular/core';
import { Questao } from '../page-questoes/questao';
import { Ano } from '../page-questoes/enums/ano';
import { Tema } from '../page-questoes/enums/tema';
import { Dificuldade } from '../page-questoes/enums/dificuldade';
import { TipoDeProva } from '../page-questoes/enums/tipoDeProva';
import { Subtema } from '../page-questoes/enums/subtema';
import { FiltroService } from 'src/app/services/filtro.service';
import { QuestoesService } from 'src/app/services/questoes.service';

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
  

  anos: string[] = Object.values(Ano);
  dificuldades: string[] = Object.values(Dificuldade);
  temas: string[] = Object.values(Tema);
  subtemas: string[] = Object.values(Subtema);
  tiposDeProva: string[] = Object.values(TipoDeProva);

  constructor(
    private questoesService: QuestoesService,
    private filtroService: FiltroService
  ) { }

  ngOnInit(): void {
  }

  
  confirmarCadastro() {
    if (this.fotoDaQuestao !== null) {
      this.questoesService.cadastrarQuestao(this.questao, this.fotoDaQuestao)
        .subscribe(
          response => {
            console.log('Questão cadastrada com sucesso!', response);
            this.success = true;
            // Lógica adicional após o sucesso, como limpar o formulário ou redirecionar
          },
          error => {
            console.error('Erro ao cadastrar questão:', error);
            this.errors.push('Erro ao cadastrar a questão. Por favor, tente novamente.');
            // Lógica para lidar com erros, como exibir mensagens para o usuário
          }
        );
    } else {
      console.error('Nenhuma foto selecionada para cadastro.');
      // Lógica adicional para lidar com a falta de foto selecionada, se necessário
    }
  }

  onFileChange(event: any) {
    const files = event.target.files;
    if (files.length > 0) {
      this.fotoDaQuestao = files[0];
    } else {
      this.fotoDaQuestao = null; // Reseta a foto da questão se nenhum arquivo for selecionado
    }
  }

  voltar() {
    // Implementação para voltar
  }

}
