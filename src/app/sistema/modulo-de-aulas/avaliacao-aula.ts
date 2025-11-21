export interface AvaliacaoAula {
  idAula: number;
  nota: number; // 1 a 5
  idUsuario?: string;
  dataAvaliacao?: Date;
}
