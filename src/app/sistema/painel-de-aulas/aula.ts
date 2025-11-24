import { Categoria } from './enums/categoria';

export class Aula {
  id!: number;
  diaDoCadastro!: string;
  idUser!: string;
  title!: string;
  video!: File;
  urlVideo!: string | null;
  categoria!: Categoria;
  titulo!: string;
  descricao!: string;
  arquivo!: File;
  urlArquivo!: string;
  keyArquivo!: string;
  keyVideo!: string;
  contentTypeVideo!: string;
  videoContentLength!: number;
  poster!: string;

  documentos?: { id: number; url: string; key: string }[];

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
      arquivo: this.arquivo,
      urlArquivo: this.urlArquivo,
      keyArquivo: this.keyArquivo,
      documentos: this.documentos,
      keyVideo: this.keyVideo,
      contentTypeVideo: this.contentTypeVideo,
      videoContentLength: this.videoContentLength,
      poster: this.poster,
    });
  }
  toJsonUpdate(): string {
    const { id, documentos, ...rest } = this;
    return JSON.stringify({
      ...rest,
    });
  }
}
