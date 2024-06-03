import { TipoDeProva } from "./tipoDeProva"; 

export const TipoDeProvaDescricoes: Record<TipoDeProva, string> = {
  [TipoDeProva.TEORICA_1]: 'Prova de Bases (Teórica 1)',
  [TipoDeProva.TEORICA_2]: 'Prova de Especialidades (Teórica 2)',
  [TipoDeProva.PRATICA]: 'Prova de Imagens (Teórico-prática)',
};
