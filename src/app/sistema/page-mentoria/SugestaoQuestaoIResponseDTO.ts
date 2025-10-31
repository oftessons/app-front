export interface SugestaoQuestaoResponseDTO {
    centroId: CentroIdResponseDTOItem[];
    suggestions: SugestaoQuestaoResponseDTOItem[];
}

export interface CentroIdResponseDTOItem {
    question_id: number;
    question_text: string;
    theme: string;
    difficulty: number;
    relevance: number;
    subtheme: string;
    exam_type: string;
}

export interface SugestaoQuestaoResponseDTOItem {
    question_id: number;
    question_text: string;
    theme: string;
    difficulty: number;
    relevance: number;
    subtheme: string;
    exam_type: string;
}