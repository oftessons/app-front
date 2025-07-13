import { TipoDeProva } from "./tipoDeProva" 
import { TipoDeProvaDescricoes } from "./tipodeprova-descricao" 
import { Tema } from "./tema" 
import { TemaDescricoes } from "./tema-descricao" 
import { Subtema } from "./subtema" 
import { SubtemaDescricoes } from "./subtema-descricao" 
import { Dificuldade } from "./dificuldade" 
import { DificuldadeDescricoes } from "./dificuldade-descricao" 
import { Ano } from "./ano"
import { CertasErradas } from "./certas-erradas"
import { AnoDescricoes } from "./ano-descricoes" 
import { Relevancia } from "./relevancia"
import { RelevanciaDescricao } from "./relevancia-descricao"
import { QuantidadeDeQuestoesSelecionadas } from "./quant-questoes"
import { QuantidadeDeQuestõesSelecionadasDescricoes } from "./quant-que-descricao"
import { RespostasSimulado } from "./resp-simu"
import { RespostasSimuladosDescricao } from "./resp-simu-descricao"
import { CertasErradasDescricao } from "./certas-erradas-descricao"

export function getQuantidadeDeQuestõesSelecionadasDescricoes( quantidadeDeQuestoesSelecionadas:QuantidadeDeQuestoesSelecionadas): string{
  return QuantidadeDeQuestõesSelecionadasDescricoes[quantidadeDeQuestoesSelecionadas];
}

export function getDescricaoRelevancia(relevancia: Relevancia): string{
  return RelevanciaDescricao[relevancia];
}
export function getDescricaoAno(ano: Ano): string {
  return AnoDescricoes[ano];
}
export function getDescricaoDificuldade(dificuldade: Dificuldade): string {
  return DificuldadeDescricoes[dificuldade];
}
export function getDescricaoSubtema(subtema: Subtema): string {
  return SubtemaDescricoes[subtema];
}
export function getDescricaoTema(tema: Tema): string {
  return TemaDescricoes[tema];
}
export function getDescricaoTipoDeProva(tipoDeProva: TipoDeProva): string {
  return TipoDeProvaDescricoes[tipoDeProva];
}

export function getDescricaoQuantidadeDeQuestoesSelecionadas(quantidadeDeQuestoesSelecionadas: QuantidadeDeQuestoesSelecionadas): string {
  return QuantidadeDeQuestõesSelecionadasDescricoes[quantidadeDeQuestoesSelecionadas];
}

export function getDescricaoRespostasSimulado(respostasSimulado: RespostasSimulado): string {
  return RespostasSimuladosDescricao[respostasSimulado];
}

export function getDescricaoCertoErrado(certoErrado: CertasErradas): string {
  return CertasErradasDescricao[certoErrado];
}