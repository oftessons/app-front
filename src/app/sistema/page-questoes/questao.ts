import { Alternativa, AlternativaImagen } from '../alternativa';
import { Ano } from './enums/ano';
import { Dificuldade } from './enums/dificuldade';
import { TipoDeProva } from './enums/tipoDeProva';
import { Relevancia } from './enums/relevancia';
import { Tema } from './enums/tema';
import { Subtema } from './enums/subtema';
import { IQuestaoAssunto } from './iQuestaoAssunto';

export class Questao {
  id!: number;
  diaDoCadastro!: string;
  idUser!: number;
  title!: string;
  videoUrl?: string;
  enunciadoDaQuestao!: string;
  descricaoDaImagemDoEnunciado!: string;
  afirmacaoUm!: string;
  afirmacaoDois!: string;
  afirmacaoTres!: string;
  afirmacaoQuatro!: string;
  fotoAfirmacaoUm!: string | null;
  fotoAfirmacaoDois!: string | null;
  fotoAfirmacaoTres!: string | null;
  fotoAfirmacaoQuatro!: string | null;
  fotoAfirmacaoCinco!: string | null;
  assinale!: string;
  fotoDaQuestao!: File;
  fotoDaQuestaoUrl!: string | null;
  fotoDaRespostaUmUrl!: string | null;
  fotoDaRespostaDoisUrl!: string | null;
  fotoDaRespostaTresUrl!: string | null;
  fotoDaRespostaQuatroUrl!: string | null;
  fotoDaRespostaCincoUrl!: string | null;
  videoDaQuestaoUrl!: string | null;
  videoDaQuestao!: File;
  fotoDaRespostaUm!: File;
  fotoDaRespostaDois!: File;
  fotoDaRespostaTres!: File;
  fotoDaRespostaQuatro!: File;
  comentarioDaQuestao!: string;
  // comentarioDaQuestaoUm!: string;
  comentarioDaQuestaoDois!: string;
  comentarioDaQuestaoTres!: string;
  comentarioDaQuestaoQuatro!: string;
  comentarioDaQuestaoCinco!: string;
  comentarioDaQuestaoSeis!: string;
  // comentarioDaQuestaoGeral!: string;
  referenciaBi!: string;
  comentadorDaQuestao!: string;
  ano!: Ano;
  tema?: Tema;
  dificuldade!: Dificuldade;
  relevancia!: Relevancia;
  tipoDeProva!: TipoDeProva;
  subtema?: Subtema;
  assunto!: IQuestaoAssunto;
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
      fotoDaRespostaUm: this.fotoDaRespostaUm,
      fotoDaRespostaDois: this.fotoDaRespostaDois,
      fotoDaRespopstaTres: this.fotoDaRespostaTres,
      fotoDaRespostaQuatro: this.fotoAfirmacaoQuatro,
      videoDaQuestao: this.videoDaQuestao,


      fotoDaQuestaoUrl: this.fotoDaQuestaoUrl,
      fotoDaRespostaUmUrl: this.fotoDaRespostaUmUrl,
      fotoDaRespostaDoisUrl: this.fotoDaRespostaDoisUrl,
      fotoDaRespostaTresUrl: this.fotoDaRespostaTresUrl,
      fotoDaRespostaQuatroUrl: this.fotoDaRespostaQuatroUrl,
      videoDaQuestaoUrl: this.videoDaQuestaoUrl,

      // fotoDaResposta: this.fotoDaResposta,
      comentarioDaQuestao: this.comentadorDaQuestao,
      // comentarioDaQuestaoUm: this.comentarioDaQuestaoUm,
      comentarioDaQuestaoDois: this.comentarioDaQuestaoDois,
      comentarioDaQuestaoTres: this.comentarioDaQuestaoTres,
      comentarioDaQuestaoQuatro: this.comentarioDaQuestaoQuatro,
      // comentarioDaQuestaoGeral: this.comentarioDaQuestaoGeral,
      referenciaBi: this.referenciaBi,
      comentadorDaQuestao: this.comentadorDaQuestao,
      ano: this.ano,
      // tema: this.tema,
      dificuldade: this.dificuldade,
      relevancia: this.relevancia,
      tipoDeProva: this.tipoDeProva,
      // subtema: this.subtema,
      assunto: this.assunto,
      palavraChave: this.palavraChave,
      alternativas: this.alternativas,
      alternativaCorreta: this.alternativaCorreta,
      tipoQuestao:this.tipoItemQuestao,
      tipoIntemQestaoImagem:this.tipoItemQuestaoImagem,
      alternativaImagems:this.alternativaImagems
    });
  }
}