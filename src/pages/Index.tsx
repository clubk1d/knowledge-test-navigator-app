import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, BookOpen } from 'lucide-react';
import QuizCategoryCard from '@/components/QuizCategoryCard';
import QuestionCard from '@/components/QuestionCard';
import UserProgress from '@/components/UserProgress';
import QuizStats from '@/components/QuizStats';
import SetSelector from '@/components/SetSelector';
import { Question, QuizSession } from '@/types/quiz';
import { generateAllQuestions } from '@/utils/questionGenerator';
import { useCacheProgress } from '@/hooks/useCacheProgress';

const Index = () => {
  const [currentView, setCurrentView] = useState<'menu' | 'quiz' | 'progress' | 'setSelector'>('menu');
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'Karimen' | 'HonMen' | null>(null);
  const { updateProgress } = useCacheProgress();

  const allQuestions = generateAllQuestions();

  const startChallenge = (category: 'Karimen' | 'HonMen', challenge: 'timed' | 'untimed' | 'regulations' | 'signs' | 'normal', setNumber?: number) => {
    if (challenge === 'normal') {
      setSelectedCategory(category);
      setCurrentView('setSelector');
      return;
    }

    const categoryQuestions = allQuestions.filter(q => q.category === category);
    
    let questionsToUse: Question[];
    let questionCount: number;
    
    switch (challenge) {
      case 'timed':
        questionCount = 30;
        break;
      case 'untimed':
        questionCount = 50;
        break;
      case 'regulations':
        questionCount = 25;
        break;
      case 'signs':
        questionCount = 20;
        break;
      default:
        questionCount = 30;
    }
    
    // Shuffle and slice questions
    const shuffled = [...categoryQuestions].sort(() => Math.random() - 0.5);
    questionsToUse = shuffled.slice(0, questionCount);

    const newSession: QuizSession = {
      questions: questionsToUse,
      currentQuestionIndex: 0,
      score: 0,
      totalQuestions: questionsToUse.length,
      answeredQuestions: [],
      challengeType: challenge
    };

    setQuizSession(newSession);
    setCurrentView('quiz');
  };

  const startNormalTest = (setNumber: number) => {
    if (!selectedCategory) return;
    
    const categoryQuestions = allQuestions.filter(q => q.category === selectedCategory);
    const questionsPerSet = selectedCategory === 'Karimen' ? 50 : 100;
    const startIndex = (setNumber - 1) * questionsPerSet;
    const endIndex = Math.min(startIndex + questionsPerSet, categoryQuestions.length);
    
    const questionsToUse = categoryQuestions.slice(startIndex, endIndex);

    const newSession: QuizSession = {
      questions: questionsToUse,
      currentQuestionIndex: 0,
      score: 0,
      totalQuestions: questionsToUse.length,
      answeredQuestions: [],
      challengeType: 'normal',
      setNumber
    };

    setQuizSession(newSession);
    setCurrentView('quiz');
  };

  const updateQuizSession = (updatedSession: QuizSession) => {
    setQuizSession(updatedSession);
  };

  const endQuiz = () => {
    if (quizSession) {
      updateProgress(quizSession);
    }
    setQuizSession(null);
    setCurrentView('menu');
  };

  if (currentView === 'progress') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('menu')}
              className="hover:bg-blue-50 w-fit"
            >
              ← Back to Menu
            </Button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center sm:text-left">Your Progress</h1>
            <div className="hidden sm:block"></div>
          </div>
          <UserProgress />
        </div>
      </div>
    );
  }

  if (currentView === 'setSelector' && selectedCategory) {
    const categoryQuestions = allQuestions.filter(q => q.category === selectedCategory);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="py-8">
            <SetSelector
              category={selectedCategory}
              totalQuestions={categoryQuestions.length}
              onSelectSet={startNormalTest}
              onBack={() => {
                setCurrentView('menu');
                setSelectedCategory(null);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'quiz' && quizSession) {
    const title = quizSession.challengeType === 'normal' && quizSession.setNumber 
      ? `${quizSession.questions[0]?.category} - Set ${quizSession.setNumber}`
      : `${quizSession.challengeType?.charAt(0).toUpperCase()}${quizSession.challengeType?.slice(1)} Challenge`;
      
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
              <Button 
                variant="outline" 
                onClick={endQuiz}
                className="hover:bg-red-50 hover:border-red-200 w-fit"
                size="sm"
              >
                End Quiz
              </Button>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {title}
                </Badge>
                <Badge variant="secondary" className="text-sm sm:text-base lg:text-lg px-3 py-1 sm:px-4 sm:py-2 w-fit">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Score: {quizSession.score}/{quizSession.answeredQuestions.length}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                <span>Question {quizSession.currentQuestionIndex + 1} of {quizSession.totalQuestions}</span>
                <span>Correct: {quizSession.score}/{quizSession.answeredQuestions.length} ({quizSession.answeredQuestions.length > 0 ? Math.round((quizSession.score / quizSession.answeredQuestions.length) * 100) : 0}%)</span>
              </div>
              <Progress 
                value={quizSession.answeredQuestions.length > 0 ? (quizSession.score / quizSession.answeredQuestions.length) * 100 : 0} 
                className="h-2 sm:h-3"
              />
            </div>
          </div>
          
          <QuestionCard 
            question={quizSession.questions[quizSession.currentQuestionIndex]}
            onAnswer={updateQuizSession}
            quizSession={quizSession}
            onQuizComplete={endQuiz}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto px-2 sm:px-0">
        {/* Simple Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 pt-4 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex-shrink-0">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Japanese Driving Test Practice</h1>
              <p className="text-sm sm:text-base text-gray-600">Practice anytime, anywhere!</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentView('progress')}
              className="hover:bg-blue-50 whitespace-nowrap"
            >
              📊 <span className="hidden sm:inline ml-2">Progress</span>
            </Button>
          </div>
        </div>

        {/* Quiz Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <QuizCategoryCard
            category="Karimen"
            onStartChallenge={startChallenge}
          />
          <QuizCategoryCard
            category="HonMen"
            onStartChallenge={startChallenge}
          />
        </div>

        <QuizStats />

        {/* Footer */}
        <div className="text-center py-6 sm:py-8 border-t border-white/20 mt-8">
          <p className="text-sm sm:text-base text-gray-600 flex items-center justify-center space-x-2 px-4">
            <span>🇯🇵</span>
            <span>Japanese Driving Test Practice App</span>
            <span>🚗</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;