export class FiltroDTO {
  id?: number;
  nome!: string;
  assunto!: string;
  ano!: string[] | null;
  tema!: string[] | null;
  dificuldade!: string[] | null;
  tipoDeProva!: string[] | null;
  subtema!: string[] | null;
  certasErradas!: string[] | null;
  respostasSimulado!: string[] | null;
  comentada!: string[] | null;
  questaoIds!: number[] | null;
}
