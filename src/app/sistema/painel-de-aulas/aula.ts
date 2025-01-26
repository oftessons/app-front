import { Categoria } from './enums/categoria';

export class Aula {
  id!: number;
  diaDoCadastro!: string;
  idUser!: number;
  title!: string;
  video!: File;
  urlVideo!: string;
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
      urlVideo: this.urlVideo,
      categoria: this.categoria,
      titulo: this.titulo,
      descricao: this.descricao,
    });
  }
}
