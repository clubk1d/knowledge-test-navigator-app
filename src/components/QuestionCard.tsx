
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Question, QuizSession, AnsweredQuestion } from '@/types/quiz';

interface QuestionCardProps {
  question: Question;
  onAnswer: (updatedSession: QuizSession) => void;
  quizSession: QuizSession;
  onQuizComplete: () => void;
}

const QuestionCard = ({ question, onAnswer, quizSession, onQuizComplete }: QuestionCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [timeSpent, setTimeSpent] = useState<number>(0);

  useEffect(() => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setStartTime(Date.now());
    setTimeSpent(0);
  }, [question]);

  useEffect(() => {
    if (!showExplanation) {
      const interval = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, showExplanation]);

  const handleAnswer = (answer: boolean) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    const questionTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = answer === question.answer;
    
    const answeredQuestion: AnsweredQuestion = {
      questionId: question.id,
      userAnswer: answer,
      isCorrect,
      timeSpent: questionTimeSpent
    };

    const updatedSession: QuizSession = {
      ...quizSession,
      score: isCorrect ? quizSession.score + 1 : quizSession.score,
      answeredQuestions: [...quizSession.answeredQuestions, answeredQuestion]
    };

    onAnswer(updatedSession);
  };

  const handleNext = () => {
    if (quizSession.currentQuestionIndex + 1 >= quizSession.totalQuestions) {
      onQuizComplete();
    } else {
      const updatedSession: QuizSession = {
        ...quizSession,
        currentQuestionIndex: quizSession.currentQuestionIndex + 1
      };
      onAnswer(updatedSession);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-8">
        <div className="space-y-6">
          {/* Question Header */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-sm">
              {question.category}
            </Badge>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeSpent)}</span>
            </div>
          </div>

          {/* Question Image */}
          {question.image_url && (
            <div className="flex justify-center">
              <img 
                src={question.image_url} 
                alt="Question illustration"
                className="max-w-md w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Question Text */}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {question.question_text}
            </h2>
          </div>

          {/* Answer Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Button
              onClick={() => handleAnswer(true)}
              disabled={selectedAnswer !== null}
              size="lg"
              className={`h-16 text-lg font-semibold transition-all ${
                selectedAnswer === true
                  ? question.answer
                    ? 'bg-green-600 hover:bg-green-600'
                    : 'bg-red-600 hover:bg-red-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              } ${
                showExplanation && question.answer
                  ? 'ring-4 ring-green-300'
                  : ''
              }`}
            >
              {selectedAnswer === true && (
                <span className="mr-2">
                  {question.answer ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </span>
              )}
              TRUE
            </Button>

            <Button
              onClick={() => handleAnswer(false)}
              disabled={selectedAnswer !== null}
              size="lg"
              className={`h-16 text-lg font-semibold transition-all ${
                selectedAnswer === false
                  ? !question.answer
                    ? 'bg-green-600 hover:bg-green-600'
                    : 'bg-red-600 hover:bg-red-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              } ${
                showExplanation && !question.answer
                  ? 'ring-4 ring-green-300'
                  : ''
              }`}
            >
              {selectedAnswer === false && (
                <span className="mr-2">
                  {!question.answer ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </span>
              )}
              FALSE
            </Button>
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="mt-8 space-y-4">
              <div className={`p-6 rounded-lg border-l-4 ${
                selectedAnswer === question.answer
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
              }`}>
                <div className="flex items-center mb-3">
                  {selectedAnswer === question.answer ? (
                    <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 mr-2" />
                  )}
                  <span className={`font-semibold text-lg ${
                    selectedAnswer === question.answer ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {selectedAnswer === question.answer ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">
                  <strong>Correct answer:</strong> {question.answer ? 'TRUE' : 'FALSE'}
                </p>
                
                <p className="text-gray-700">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>

              <div className="text-center">
                <Button 
                  onClick={handleNext}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  {quizSession.currentQuestionIndex + 1 >= quizSession.totalQuestions 
                    ? 'Complete Quiz' 
                    : 'Next Question'
                  }
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
