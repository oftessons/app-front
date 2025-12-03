import { Categoria } from "../enums/categoria";

export interface SearchResultResponseDto {
    id: string;
    titulo: string;
    subtitulo: string;
    tipo: Categoria;
    thumbnailUrl: string;
}