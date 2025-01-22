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
      video: this.video,
      videoUrl: this.videoUrl,
      categoria: this.categoria,
      titulo: this.titulo,
      descricao: this.descricao,
    });
  }
}
