import { CategoriaAula } from './enums/categoriaaula';

export class Aula {
  id!: number;
  diaDoCadastro!: string;
  idUser!: number;
  title!: string;
  videoaula!: File;
  videoaulaUrl!: string;
  categoriaAula!: CategoriaAula;
  tituloAula!: string;
  descricaoDaAula!: string;

  toJson(): string {
    return JSON.stringify({
      id: this.id,
      diaDoCadastro: this.diaDoCadastro,
      idUser: this.idUser,
      title: this.title,
      videoaula: this.videoaula,
      videoaulaUrl: this.videoaulaUrl,
      categoriaAula: this.categoriaAula,
      tituloAula: this.tituloAula,
      descricaoDaAula: this.descricaoDaAula,
    });
  }
}
