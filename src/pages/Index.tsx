
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Play, Trophy, BookOpen } from 'lucide-react';
import QuestionCard from '@/components/QuestionCard';
import AdminDashboard from '@/components/AdminDashboard';
import { Question, QuizSession } from '@/types/quiz';

// Sample questions data
const sampleQuestions: Question[] = [
  {
    id: 1,
    question_text: "You must come to a complete stop at a red traffic light.",
    answer: true,
    explanation: "Red lights require all vehicles to come to a complete stop before the stop line.",
    category: "Traffic Signs",
    image_url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    question_text: "It's legal to use your mobile phone while driving if you're stopped at traffic lights.",
    answer: false,
    explanation: "Using a mobile phone while driving is illegal in most jurisdictions, even when stopped at lights, as you are still considered to be driving.",
    category: "Road Rules"
  },
  {
    id: 3,
    question_text: "You should increase your following distance in wet weather conditions.",
    answer: true,
    explanation: "Wet roads reduce tire grip and increase stopping distances, so you should maintain a greater following distance.",
    category: "General Safety"
  },
  {
    id: 4,
    question_text: "A yellow traffic light means you should speed up to get through the intersection.",
    answer: false,
    explanation: "A yellow light means prepare to stop. You should only proceed if you cannot stop safely before the intersection.",
    category: "Traffic Signs"
  },
  {
    id: 5,
    question_text: "The speed limit in a school zone applies 24 hours a day.",
    answer: false,
    explanation: "School zone speed limits typically only apply during school hours or when children are present, as indicated by signs.",
    category: "Road Rules"
  }
];

const Index = () => {
  const [currentView, setCurrentView] = useState<'menu' | 'quiz' | 'admin'>('menu');
  const [questions, setQuestions] = useState<Question[]>(sampleQuestions);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);

  const startQuiz = (category?: string, questionCount?: number) => {
    let quizQuestions = [...questions];
    
    if (category && category !== 'all') {
      quizQuestions = questions.filter(q => q.category === category);
    }
    
    if (questionCount) {
      quizQuestions = quizQuestions.sort(() => Math.random() - 0.5).slice(0, questionCount);
    }
    
    const session: QuizSession = {
      questions: quizQuestions,
      currentQuestionIndex: 0,
      score: 0,
      totalQuestions: quizQuestions.length,
      answeredQuestions: []
    };
    
    setQuizSession(session);
    setCurrentView('quiz');
  };

  const updateQuizSession = (updatedSession: QuizSession) => {
    setQuizSession(updatedSession);
  };

  const endQuiz = () => {
    setQuizSession(null);
    setCurrentView('menu');
  };

  const getCategories = () => {
    const categories = Array.from(new Set(questions.map(q => q.category)));
    return categories;
  };

  if (currentView === 'admin') {
    return (
      <AdminDashboard 
        questions={questions}
        setQuestions={setQuestions}
        onBack={() => setCurrentView('menu')}
      />
    );
  }

  if (currentView === 'quiz' && quizSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                onClick={endQuiz}
                className="hover:bg-red-50 hover:border-red-200"
              >
                End Quiz
              </Button>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Trophy className="w-4 h-4 mr-2" />
                Score: {quizSession.score}/{quizSession.answeredQuestions.length}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Question {quizSession.currentQuestionIndex + 1} of {quizSession.totalQuestions}</span>
                <span>{Math.round(((quizSession.currentQuestionIndex + 1) / quizSession.totalQuestions) * 100)}% Complete</span>
              </div>
              <Progress 
                value={((quizSession.currentQuestionIndex + 1) / quizSession.totalQuestions) * 100} 
                className="h-3"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Driving Test Quiz
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Master your driving knowledge with our comprehensive true/false quiz system. 
            Practice with categorized questions or challenge yourself with random sets.
          </p>
        </div>

        {/* Admin Access */}
        <div className="flex justify-end mb-8">
          <Button 
            variant="outline" 
            onClick={() => setCurrentView('admin')}
            className="hover:bg-gray-50"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin Dashboard
          </Button>
        </div>

        {/* Quiz Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Category Selection */}
          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-blue-700 flex items-center justify-center">
                <BookOpen className="w-6 h-6 mr-2" />
                Practice by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Focus on specific areas of driving knowledge
              </p>
              
              <Button 
                onClick={() => startQuiz('all')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                All Categories ({questions.length} questions)
              </Button>
              
              <div className="space-y-3">
                {getCategories().map(category => {
                  const count = questions.filter(q => q.category === category).length;
                  return (
                    <Button 
                      key={category}
                      onClick={() => startQuiz(category)}
                      variant="outline"
                      className="w-full justify-between text-left py-4 hover:bg-blue-50 hover:border-blue-300"
                    >
                      <span className="font-medium">{category}</span>
                      <Badge variant="secondary">{count} questions</Badge>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Random Quiz Options */}
          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-green-700 flex items-center justify-center">
                <Trophy className="w-6 h-6 mr-2" />
                Random Challenge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Test your knowledge with randomly selected questions
              </p>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => startQuiz(undefined, 10)}
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Quick Quiz (10 questions)
                </Button>
                
                <Button 
                  onClick={() => startQuiz(undefined, 25)}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50 py-4"
                >
                  Standard Quiz (25 questions)
                </Button>
                
                <Button 
                  onClick={() => startQuiz(undefined, 50)}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50 py-4"
                >
                  Extended Quiz (50 questions)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <Card className="bg-white/50 backdrop-blur-sm">
          <CardContent className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{questions.length}</div>
                <div className="text-gray-600">Total Questions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">{getCategories().length}</div>
                <div className="text-gray-600">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                <div className="text-gray-600">Practice Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
