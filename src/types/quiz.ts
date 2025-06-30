
export interface Question {
  id: number;
  question_text: string;
  answer: boolean;
  explanation: string;
  category: string;
  image_url?: string;
}

export interface QuizSession {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  answeredQuestions: AnsweredQuestion[];
}

export interface AnsweredQuestion {
  questionId: number;
  userAnswer: boolean;
  isCorrect: boolean;
  timeSpent?: number;
}
