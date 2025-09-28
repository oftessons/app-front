export interface SugestaoQuestaoIResponseDTO {
    question_id: number;
    question_text: string;
    theme: string;
    difficulty: number;
    relevance: number;
    subtheme: string;
    exam_type: string;
}