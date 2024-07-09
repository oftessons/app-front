import { Ano } from './enums/ano';
import { Tema } from './enums/tema';
import { Dificuldade } from './enums/dificuldade';
import { TipoDeProva } from './enums/tipoDeProva';
import { Subtema } from './enums/subtema';
import { Relevancia } from './enums/relevancia';
import { Alternativa } from '../alternativa'; 

export class Questao {
  id!: number;
  diaDoCadastro!: string;
  idUser!: number;
  title!: string;
  enunciadoDaQuestao!: string;
  afirmacaoUm!: string;
  afirmacaoDois!: string;
  afirmacaoTres!: string;
  afirmacaoQuatro!: string;
  assinale!: string;
  fotoDaQuestao!: string;
  fotoDaQuestaoDois!: string;
  fotoDaQuestaoTres!: string;
  fotoDaResposta!: string;
  fotoDaRespostaDois!: string;
  fotoDaRespostaTres!: string;
  comentarioDaQuestaoUm!: string;
  comentarioDaQuestaoDois!: string;
  referenciaBi!: string;
  comentadorDaQuestao!: string;
  ano!: Ano;
  tema!: Tema;
  dificuldade!: Dificuldade;
  relevancia!: Relevancia;
  tipoDeProva!: TipoDeProva;
  subtema!: Subtema;
  palavraChave!: string;
  alternativas!: Alternativa[];
  alternativaCorreta: Alternativa | null = null; // Agora guarda a Alternativa correta diretamente
}
