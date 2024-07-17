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
  fotoDaQuestao!:File;
  fotoDaQuestaoDois!:File ;
  fotoDaQuestaoTres!: File;
  fotoDaResposta!: File;
  fotoDaRespostaDois!: File;
  fotoDaRespostaTres!: File;
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
  alternativaCorreta?: Alternativa[];

  toJson(): string {
    return JSON.stringify({
      id: this.id,
      diaDoCadastro: this.diaDoCadastro,
      idUser: this.idUser,
      title: this.title,
      enunciadoDaQuestao: this.enunciadoDaQuestao,
      afirmacaoUm: this.afirmacaoUm,
      afirmacaoDois: this.afirmacaoDois,
      afirmacaoTres: this.afirmacaoTres,
      afirmacaoQuatro: this.afirmacaoQuatro,
      assinale: this.assinale,
      fotoDaQuestao: this.fotoDaQuestao,
      fotoDaQuestaoDois: this.fotoDaQuestaoDois,
      fotoDaQuestaoTres: this.fotoDaQuestaoTres,
      fotoDaResposta: this.fotoDaResposta,
      fotoDaRespostaDois: this.fotoDaRespostaDois,
      fotoDaRespostaTres: this.fotoDaRespostaTres,
      comentarioDaQuestaoUm: this.comentarioDaQuestaoUm,
      comentarioDaQuestaoDois: this.comentarioDaQuestaoDois,
      referenciaBi: this.referenciaBi,
      comentadorDaQuestao: this.comentadorDaQuestao,
      ano: this.ano,
      tema: this.tema,
      dificuldade: this.dificuldade,
      relevancia: this.relevancia,
      tipoDeProva: this.tipoDeProva,
      subtema: this.subtema,
      palavraChave: this.palavraChave,
      alternativas: this.alternativas,
      alternativaCorreta: this.alternativaCorreta
    });
  }
}

