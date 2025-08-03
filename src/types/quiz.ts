
export interface Question {
  id: number;
  question_text: string;
  answer: boolean;
  explanation: string;
  category: 'Karimen' | 'HonMen';
  image_url?: string;
  is_premium?: boolean; // Questions beyond 50 require social sharing
}

export interface QuizSession {
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  answeredQuestions: AnsweredQuestion[];
  challengeType?: 'timed' | 'untimed' | 'regulations' | 'signs' | 'normal';
  setNumber?: number;
}

export interface AnsweredQuestion {
  questionId: number;
  userAnswer: boolean;
  isCorrect: boolean;
  timeSpent?: number;
}

export interface UserSocialSharing {
  has_shared: boolean;
  shared_at?: string;
}
