export type QuestionType = 'boolean' | 'select' | 'text' | 'number';

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
}
