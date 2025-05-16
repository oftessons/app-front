import { Questao } from "./page-questoes/questao";
export class Alternativa {
  id?: number;
  texto!: string;
  correta!: boolean;
  questao?: Questao; // Adiciona a relação com Questao
  imagemUrl?: string | null;
  comentario?: string;  // Adiciona o campo para armazenar o comentário de cada alternativa
  foto?: File;
}

export class AlternativaImagen {
  id?: number;
  texto!: string;
  correta!: boolean;
  questao?: Questao; // Adiciona a relação com Questao
  imagemUrl?: string;
  comentario?: string;  // Adiciona o campo para armazenar o comentário de cada alternativa com imagem
}