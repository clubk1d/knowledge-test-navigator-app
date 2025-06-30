
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Question, QuizSession, AnsweredQuestion } from '@/types/quiz';

interface QuestionCardProps {
  question: Question;
  onAnswer: (updatedSession: QuizSession) => void;
  quizSession: QuizSession;
  onQuizComplete: () => void;
}

const QuestionCard = ({ question, onAnswer, quizSession, onQuizComplete }: QuestionCardProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleAnswerSelect = (answer: boolean) => {
    if (selectedAnswer !== null) return; // Prevent changing answer
    
    setSelectedAnswer(answer);
    const correct = answer === question.answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    // Update quiz session
    const answeredQuestion: AnsweredQuestion = {
      questionId: question.id,
      userAnswer: answer,
      isCorrect: correct
    };

    const updatedSession: QuizSession = {
      ...quizSession,
      score: correct ? quizSession.score + 1 : quizSession.score,
      answeredQuestions: [...quizSession.answeredQuestions, answeredQuestion]
    };

    onAnswer(updatedSession);
  };

  const handleNext = () => {
    const nextIndex = quizSession.currentQuestionIndex + 1;
    
    if (nextIndex >= quizSession.totalQuestions) {
      // Quiz completed
      onQuizComplete();
      return;
    }

    // Move to next question
    const updatedSession: QuizSession = {
      ...quizSession,
      currentQuestionIndex: nextIndex
    };

    onAnswer(updatedSession);
    
    // Reset component state for next question
    setSelectedAnswer(null);
    setShowFeedback(false);
    setIsCorrect(null);
  };

  const getButtonClass = (buttonAnswer: boolean) => {
    if (selectedAnswer === null) {
      return buttonAnswer 
        ? "bg-green-100 hover:bg-green-200 text-green-800 border-green-300" 
        : "bg-red-100 hover:bg-red-200 text-red-800 border-red-300";
    }

    if (selectedAnswer === buttonAnswer) {
      return isCorrect 
        ? "bg-green-500 text-white border-green-500" 
        : "bg-red-500 text-white border-red-500";
    }

    if (question.answer === buttonAnswer) {
      return "bg-green-500 text-white border-green-500";
    }

    return "bg-gray-100 text-gray-500 border-gray-300";
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardContent className="p-8">
        {/* Category Badge */}
        <div className="flex justify-between items-start mb-6">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {question.category}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            Question {quizSession.currentQuestionIndex + 1}
          </Badge>
        </div>

        {/* Question Image */}
        {question.image_url && (
          <div className="mb-8">
            <img 
              src={question.image_url} 
              alt="Question illustration"
              className="w-full max-w-md mx-auto rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Question Text */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 leading-relaxed">
            {question.question_text}
          </h2>
        </div>

        {/* Answer Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button
            onClick={() => handleAnswerSelect(true)}
            disabled={selectedAnswer !== null}
            className={`py-8 text-xl font-semibold border-2 transition-all duration-300 ${getButtonClass(true)}`}
            variant="outline"
          >
            <div className="flex items-center justify-center space-x-3">
              {selectedAnswer === true && (
                isCorrect ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />
              )}
              {selectedAnswer === null && question.answer === true && showFeedback && (
                <CheckCircle className="w-6 h-6" />
              )}
              <span>TRUE</span>
            </div>
          </Button>

          <Button
            onClick={() => handleAnswerSelect(false)}
            disabled={selectedAnswer !== null}
            className={`py-8 text-xl font-semibold border-2 transition-all duration-300 ${getButtonClass(false)}`}
            variant="outline"
          >
            <div className="flex items-center justify-center space-x-3">
              {selectedAnswer === false && (
                isCorrect ? <CheckCircle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />
              )}
              {selectedAnswer === null && question.answer === false && showFeedback && (
                <CheckCircle className="w-6 h-6" />
              )}
              <span>FALSE</span>
            </div>
          </Button>
        </div>

        {/* Feedback Section */}
        {showFeedback && (
          <div className="space-y-6">
            <div className={`p-6 rounded-lg border-2 ${
              isCorrect 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                )}
                <div>
                  <h3 className={`font-semibold text-lg mb-2 ${
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </h3>
                  <p className={`text-base leading-relaxed ${
                    isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Next Button */}
            <div className="text-center">
              <Button 
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                size="lg"
              >
                {quizSession.currentQuestionIndex + 1 >= quizSession.totalQuestions ? (
                  'Complete Quiz'
                ) : (
                  <>
                    Next Question
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
