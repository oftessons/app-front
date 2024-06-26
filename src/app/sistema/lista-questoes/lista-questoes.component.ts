import { Component, OnInit } from '@angular/core';
import { Questao } from '../page-questoes/questao';
import { Ano } from '../page-questoes/enums/ano';
import { TipoDeProva } from '../page-questoes/enums/tipoDeProva';
import { QuestoesService } from 'src/app/services/questoes.service';

@Component({
  selector: 'app-lista-questoes',
  templateUrl: './lista-questoes.component.html',
  styleUrls: ['./lista-questoes.component.css']
})
export class ListaQuestoesComponent implements OnInit {
  questoes: Questao[] = [];
  anos: Ano[] = []; // Exemplo de anos, substituir pelos anos reais
  tiposDeProva: TipoDeProva[] = [];
  selectedAno!: Ano;
  selectedTipoDeProva!: TipoDeProva;
  termoBusca: string = ''; // Propriedade para armazenar o termo de busca
  p: number = 1; // Página atual
  message: string = ''; // Propriedade para armazenar mensagens de aviso
  mensagemSucesso: string = ''; // Mensagem de sucesso
  mensagemErro: string = ''; // Mensagem de erro

  constructor(private questoesService: QuestoesService) {}

  ngOnInit(): void {
    this.obterTodasQuestoes();
    this.anos = Object.values(Ano);
    this.tiposDeProva = Object.values(TipoDeProva);
  }

  buscarQuestoes(): void {
    const filtros = {
      ano: this.selectedAno,
      tipoDeProva: this.selectedTipoDeProva
    };
  
    this.questoesService.filtrarQuestoes(filtros).subscribe(
      (questoes: Questao[]) => {
        console.log('Questões recebidas:', questoes);
        this.questoes = questoes;
        if (questoes.length === 0) {
          this.message = 'Nenhuma questão encontrada com os filtros aplicados.';
        } else {
          this.message = '';
        }
      },
      (error) => {
        console.error('Erro ao buscar questões:', error);
        this.message = 'Erro ao buscar questões. Por favor, tente novamente.';
      }
    );
  }
  

  obterTodasQuestoes(): void {
    this.questoesService.obterTodasQuestoes().subscribe(
      (questoes: Questao[]) => {
        this.questoes = questoes;
      },
      (error) => {
        console.error('Erro ao buscar todas as questões:', error);
        this.message = 'Erro ao buscar todas as questões. Por favor, tente novamente.';
      }
    );
  }

  editarQuestao(id: number): void {
    // Implementar lógica de edição
  }

  confirmarExclusao(id: number): void {
    if (confirm('Tem certeza que deseja deletar esta questão?')) {
      this.deletarQuestao(id);
    }
  }

  deletarQuestao(id: number): void {
    this.questoesService.deletar(id).subscribe(
      () => {
        this.mensagemSucesso = 'Questão deletada com sucesso!';
        this.obterTodasQuestoes(); // Atualiza a lista de questões
      },
      (error) => {
        console.error('Erro ao deletar questão:', error);
        this.mensagemErro = 'Erro ao deletar questão.';
      }
    );
  }
}
