import { TipoDeProva } from "./tipoDeProva" 
import { TipoDeProvaDescricoes } from "./tipodeprova-descricao" 
import { Tema } from "./tema" 
import { TemaDescricoes } from "./tema-descricao" 
import { Subtema } from "./subtema" 
import { SubtemaDescricoes } from "./subtema-descricao" 
import { Dificuldade } from "./dificuldade" 
import { DificuldadeDescricoes } from "./dificuldade-descricao" 
import { Ano } from "./ano"
import { AnoDescricoes } from "./ano-descricoes" 

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
