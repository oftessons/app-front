import { Alternativa, AlternativaImagen } from '../alternativa';
import { Ano } from './enums/ano';
import { Tema } from './enums/tema';
import { Dificuldade } from './enums/dificuldade';
import { TipoDeProva } from './enums/tipoDeProva';
import { Subtema } from './enums/subtema';
import { Relevancia } from './enums/relevancia';
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
  fotoAfirmacaoUm!: string;
  fotoAfirmacaoDois!: string;
  fotoAfirmacaoTres!: string;
  fotoAfirmacaoQuatro!: string;
  assinale!: string;
  fotoDaQuestao!: File;
  fotoDaResposta!: File;
  comentarioDaQuestaoUm!: string;
  comentarioDaQuestaoDois!: string;
  comentarioDaQuestaoTres!: string;
  comentarioDaQuestaoQuatro!: string;
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
  alternativaImagems?:AlternativaImagen[];
  tipoItemQuestao!:string;
  tipoItemQuestaoImagem!: string;
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
      fotoAfirmacaoUm: this.fotoAfirmacaoUm,
      fotoAfirmacaoDois: this.fotoAfirmacaoDois,
      fotoAfirmacaoTres: this.fotoAfirmacaoTres,
      fotoAfirmacaoQuatro: this.fotoAfirmacaoQuatro,
      assinale: this.assinale,
      fotoDaQuestao: this.fotoDaQuestao,
      fotoDaResposta: this.fotoDaResposta,
      comentarioDaQuestaoUm: this.comentarioDaQuestaoUm,
      comentarioDaQuestaoDois: this.comentarioDaQuestaoDois,
      comentarioDaQuestaoTres: this.comentarioDaQuestaoTres,
      comentarioDaQuestaoQuatro: this.comentarioDaQuestaoQuatro,
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
      alternativaCorreta: this.alternativaCorreta,
      tipoQuestao:this.tipoItemQuestao,
      tipoIntemQestaoImagem:this.tipoItemQuestaoImagem,
      alternativaImagems:this.alternativaImagems
    });
  }
}