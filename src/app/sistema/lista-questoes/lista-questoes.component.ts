import { Component, OnInit } from '@angular/core';
import { QuestoesService } from 'src/app/services/questoes.service';
import { Questao } from '../page-questoes/questao';
import { Ano } from '../page-questoes/enums/ano';
import { TipoDeProva } from '../page-questoes/enums/tipoDeProva';
import { PageEvent } from '@angular/material/paginator';


@Component({
  selector: 'app-lista-questoes',
  templateUrl: './lista-questoes.component.html',
  styleUrls: ['./lista-questoes.component.css']
})
export class ListaQuestoesComponent implements OnInit {
  questoes: Questao[] = [];
  anos: Ano[] = [];// Exemplo de anos, substituir pelos anos reais
  tiposDeProva: string[] = ['Tipo 1', 'Tipo 2', 'Tipo 3']; // Exemplo de tipos de prova, substituir pelos tipos reais
  selectedAno!: Ano;
  selectedTipoDeProva!: string;
  termoBusca: string = ''; // Propriedade para armazenar o termo de busca
  p: number = 1; // Página atual
  message: string = ''; // Propriedade para armazenar mensagens de aviso
  mensagemSucesso: string = ''; // Mensagem de sucesso
  mensagemErro: string = ''; // Mensagem de erro

  constructor(private questoesService: QuestoesService) { }

  ngOnInit(): void {
    // Inicializa os filtros com valores padrão
    this.selectedAno = this.anos[0]; // Seleciona o primeiro ano como padrão
    this.selectedTipoDeProva = this.tiposDeProva[0]; // Seleciona o primeiro tipo de prova como padrão
    this.filtrarQuestoes(); // Carrega as questões ao iniciar a página
  }

  filtrarQuestoes(): void {
    const filtros = {
      ano: this.selectedAno,
      tipoDeProva: this.selectedTipoDeProva
    };

    this.questoesService.filtrarQuestoes(filtros).subscribe(
      (questoes: Questao[]) => {
        this.questoes = questoes;
      },
      (error) => {
        console.error('Erro ao buscar questões:', error);
        // Tratar erro aqui
      }
    );
  }

  buscarQuestoes(): void {
    // Implemente a lógica de busca de questões com base em this.termoBusca
    // Exemplo:
    // this.questoesService.buscarQuestoes(this.termoBusca).subscribe(
    //   (questoes: Questao[]) => {
    //     this.questoes = questoes;
    //   },
    //   (error) => {
    //     console.error('Erro ao buscar questões:', error);
    //     // Tratar erro aqui
    //   }
    // );
  }

  editarQuestao(id: number): void {
    // Implemente a lógica para editar a questão com o ID fornecido
    // Exemplo:
    // this.questoesService.getQuestaoById(id).subscribe(
    //   (questao: Questao) => {
    //     // Lógica para abrir modal de edição ou navegar para página de edição
    //   },
    //   (error) => {
    //     console.error('Erro ao buscar questão por ID:', error);
    //     // Tratar erro aqui
    //   }
    // );
  }

  confirmarExclusao(id: number): void {
    // Implemente a lógica para confirmar a exclusão da questão com o ID fornecido
    // Exemplo:
    // if (confirm(`Tem certeza que deseja excluir a questão com ID ${id}?`)) {
    //   this.questoesService.deletarQuestao(id).subscribe(
    //     () => {
    //       // Lógica para atualizar a lista de questões após a exclusão
    //       this.filtrarQuestoes(); // Exemplo: Atualizar a lista após a exclusão
    //     },
    //     (error) => {
    //       console.error('Erro ao deletar questão:', error);
    //       // Tratar erro aqui
    //     }
    //   );
    // }
  }

  
}
