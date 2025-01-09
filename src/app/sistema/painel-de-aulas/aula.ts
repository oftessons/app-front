import { Categoria } from './enums/categoria';

export class Aula {
  id!: number;
  diaDoCadastro!: string;
  idUser!: number;
  title!: string;
  video!: File;
  videoUrl!: string;
  categoria!: Categoria;
  titulo!: string;
  descricao!: string;

  toJson(): string {
    return JSON.stringify({
      id: this.id,
      diaDoCadastro: this.diaDoCadastro,
      idUser: this.idUser,
      title: this.title,
      videoaula: this.video,
      videoaulaUrl: this.videoUrl,
      categoriaAula: this.categoria,
      tituloAula: this.titulo,
      descricaoDaAula: this.descricao,
    });
  }
}
