import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, Play, Trophy, BookOpen, LogOut, User, BarChart3, Coffee, Lock, Share2 } from 'lucide-react';
import QuestionCard from '@/components/QuestionCard';
import SocialSharingModal from '@/components/SocialSharingModal';
import AdminDashboard from '@/components/AdminDashboard';
import AuthForm from '@/components/AuthForm';
import PasswordResetForm from '@/components/PasswordResetForm';
import UserProgress from '@/components/UserProgress';
import { Question, QuizSession } from '@/types/quiz';
import { useAuth } from '@/contexts/AuthContext';
import { useQuizProgress } from '@/hooks/useQuizProgress';
import { supabase } from '@/integrations/supabase/client';

// Japanese driving test questions - 150 for each category
const createKarimenQuestions = (): Question[] => {
  const baseQuestions = [
    { text: "Cars drive on the left side of the road in Japan.", answer: true, explanation: "In Japan, vehicles are legally required to drive on the left side of the road." },
    { text: "At intersections without traffic signals, vehicles coming from the right have priority.", answer: true, explanation: "At intersections of equal width without signals, vehicles coming from the right have priority." },
    { text: "Pedestrians have priority at crosswalks.", answer: true, explanation: "Pedestrians always have priority at crosswalks, and vehicles must stop and give way to pedestrians." },
    { text: "You must come to a complete stop at red lights.", answer: true, explanation: "At red lights, you must come to a complete stop before the stop line and wait until the light turns green." },
    { text: "Using mobile phones while driving is prohibited.", answer: true, explanation: "Using mobile phones while driving is prohibited by traffic law and carries penalties." },
    { text: "In rainy weather, you need to maintain a longer following distance than usual.", answer: true, explanation: "In rainy weather, roads become slippery and braking distance increases, so you need to maintain a longer following distance." },
    { text: "Yellow lights mean you should speed up to pass through.", answer: false, explanation: "Yellow lights mean caution and prepare to stop. You should only proceed if you cannot stop safely." },
    { text: "Drunk driving is acceptable if it's just a small amount.", answer: false, explanation: "Drunk driving is prohibited by law regardless of the amount and can cause serious accidents." },
    { text: "Seat belts are only required on highways.", answer: false, explanation: "Seat belts are mandatory for all seats on both regular roads and highways." },
    { text: "Speed limits are just guidelines and can be slightly exceeded.", answer: false, explanation: "Speed limits are legally mandated maximum speeds, and exceeding them is a traffic violation." },
  ];

  const questions: Question[] = [];
  for (let i = 0; i < 150; i++) {
    const baseIndex = i % baseQuestions.length;
    const base = baseQuestions[baseIndex];
    questions.push({
      id: i + 1,
      question_text: `${base.text} (Question ${i + 1})`,
      answer: base.answer,
      explanation: base.explanation,
      category: 'Karimen',
      is_premium: i >= 50
    });
  }
  return questions;
};

const createHonMenQuestions = (): Question[] => {
  const baseQuestions = [
    { text: "The minimum speed on highways is 50 km/h.", answer: true, explanation: "The minimum speed on highways is set at 50 km/h, and driving below this speed is a violation." },
    { text: "When overtaking, you should pass on the right side.", answer: true, explanation: "Overtaking should be done on the right side, and you should return to the left lane promptly after overtaking." },
    { text: "Traffic laws do not apply in parking lots.", answer: false, explanation: "Traffic laws may apply in parking lots as well, and safe driving responsibilities are always required." },
    { text: "Checking mirrors is only necessary when starting the vehicle.", answer: false, explanation: "Mirror checks are necessary not only when starting but also when changing lanes, stopping, and at all times while driving." },
    { text: "Motorcycles under 50cc can drive on highways.", answer: false, explanation: "Motorcycles under 50cc (moped) are prohibited from entering highways." },
    { text: "Headlights must be turned on at night.", answer: true, explanation: "Headlights must be turned on at night and during twilight hours to ensure visibility and inform other traffic participants of your vehicle's presence." },
    { text: "At stop signs, you can proceed slowly without coming to a complete stop.", answer: false, explanation: "At stop signs, you must come to a complete stop and then check for safety before proceeding." },
    { text: "Cars with expired vehicle inspection cannot be driven on public roads.", answer: true, explanation: "Cars with expired vehicle inspection cannot be driven on public roads, and violations carry heavy penalties." },
    { text: "Compulsory automobile liability insurance is optional.", answer: false, explanation: "Compulsory automobile liability insurance is legally mandated, and driving without it is illegal." },
    { text: "At railway crossings, you must stop and check for safety.", answer: true, explanation: "At railway crossings, you must come to a complete stop and check left and right for safety before crossing." },
  ];

  const questions: Question[] = [];
  for (let i = 0; i < 150; i++) {
    const baseIndex = i % baseQuestions.length;
    const base = baseQuestions[baseIndex];
    questions.push({
      id: i + 1001, // Different ID range for HonMen
      question_text: `${base.text} (Full License Question ${i + 1})`,
      answer: base.answer,
      explanation: base.explanation,
      category: 'HonMen',
      is_premium: i >= 50
    });
  }
  return questions;
};

const Index = () => {
  const [currentView, setCurrentView] = useState<'menu' | 'quiz' | 'admin' | 'progress' | 'password-reset'>('menu');
  const [questions, setQuestions] = useState<Question[]>([...createKarimenQuestions(), ...createHonMenQuestions()]);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [hasSharedSocial, setHasSharedSocial] = useState(false);
  const { user, loading, signOut, isAdmin } = useAuth();
  const { updateProgress } = useQuizProgress();

  // Check for password reset parameters in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const type = urlParams.get('type');
    const tokenHash = urlParams.get('token_hash');

    console.log('URL params:', { accessToken, type, tokenHash });

    if (type === 'recovery' && accessToken) {
      console.log('Setting password reset session with token:', accessToken);
      
      // Verify and set the session with the recovery token
      supabase.auth.verifyOtp({
        token_hash: tokenHash || accessToken,
        type: 'recovery'
      }).then(({ data, error }) => {
        console.log('Verify OTP result:', { data, error });
        
        if (!error && data.session) {
          console.log('Password reset session verified successfully');
          setIsPasswordReset(true);
          setCurrentView('password-reset');
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          console.error('Failed to verify password reset token:', error);
          // Try alternative method
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: accessToken, // Use access token as fallback
          }).then(() => {
            setIsPasswordReset(true);
            setCurrentView('password-reset');
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }).catch((setSessionError) => {
            console.error('Failed to set session:', setSessionError);
          });
        }
      });
    }
  }, []);

  // Check if user has shared on social media (in real app, this would be stored in database)
  useEffect(() => {
    const shared = localStorage.getItem('social_shared');
    setHasSharedSocial(shared === 'true');
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show password reset form if user is resetting password
  if (isPasswordReset && currentView === 'password-reset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Japanese Driving Test Practice
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Reset your password to continue using the quiz application.
            </p>
          </div>

          <PasswordResetForm 
            onComplete={() => {
              setIsPasswordReset(false);
              setCurrentView('menu');
            }} 
          />
        </div>
      </div>
    );
  }

  // Show auth form if user is not logged in and not in password reset flow
  if (!user && !isPasswordReset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Japanese Driving Test Practice
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Master your driving knowledge with our comprehensive true/false quiz system. 
              Practice with categorized questions and track your progress.
            </p>
            
            {/* Filipino Pride */}
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 mb-8 max-w-md mx-auto">
              <p className="text-sm font-medium text-gray-800 flex items-center justify-center space-x-2">
                <span>🇵🇭</span>
                <span>Proudly made by a Filipino</span>
                <span>🇵🇭</span>
              </p>
            </div>
          </div>

          <AuthForm />
        </div>
      </div>
    );
  }

  const startQuiz = (category?: 'Karimen' | 'HonMen' | 'all', questionCount?: number) => {
    let quizQuestions = [...questions];
    
    if (category && category !== 'all') {
      quizQuestions = questions.filter(q => q.category === category);
    }
    
    // Filter premium questions if user hasn't shared
    if (!hasSharedSocial) {
      quizQuestions = quizQuestions.filter(q => !q.is_premium);
    }
    
    if (questionCount) {
      quizQuestions = quizQuestions.sort(() => Math.random() - 0.5).slice(0, questionCount);
    }
    
    // Check if trying to access premium questions
    if (!hasSharedSocial && questions.filter(q => q.category === category).length > 50) {
      const availableQuestions = quizQuestions.length;
      if (availableQuestions < 50 && category !== 'all') {
        setShowSocialModal(true);
        return;
      }
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

  const handleSocialShare = () => {
    setHasSharedSocial(true);
    localStorage.setItem('social_shared', 'true');
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

  if (currentView === 'progress') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('menu')}
              className="hover:bg-blue-50"
            >
              ← Back to Menu
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>
            <div></div>
          </div>
          <UserProgress />
        </div>
      </div>
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
        {/* Header with User Info */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <div className="flex items-center space-x-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Japanese Driving Test Practice</h1>
              <p className="text-gray-600">Welcome, {user.email}!</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => window.open('https://www.paypal.com/paypalme/yourpaypalhandle', '_blank')}
              className="hover:bg-yellow-50 border-yellow-300 text-yellow-700"
            >
              <Coffee className="w-4 h-4 mr-2" />
              Support
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('progress')}
              className="hover:bg-blue-50"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Progress
            </Button>
            
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('admin')}
                className="hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={signOut}
              className="hover:bg-red-50 hover:border-red-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Quiz Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Karimen Category */}
          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-blue-700 flex items-center justify-center">
                <BookOpen className="w-6 h-6 mr-2" />
                Provisional License (Karimen)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Practice test for obtaining your provisional driving license
              </p>
              
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                <p className="text-sm text-green-800 text-center">
                  First 50 questions are free! Remaining 100 questions
                  {hasSharedSocial ? (
                    <span className="font-semibold text-green-600"> unlocked ✓</span>
                  ) : (
                    <span className="font-semibold text-blue-600"> unlock by sharing</span>
                  )}
                </p>
              </div>
              
              <Button 
                onClick={() => startQuiz('Karimen')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Karimen Quiz ({hasSharedSocial ? '150' : '50'} questions)
              </Button>
              
              {!hasSharedSocial && (
                <Button 
                  onClick={() => setShowSocialModal(true)}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 py-4"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share to Unlock All Questions
                </Button>
              )}
            </CardContent>
          </Card>

          {/* HonMen Category */}
          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-green-700 flex items-center justify-center">
                <Trophy className="w-6 h-6 mr-2" />
                Full License (HonMen)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Practice test for obtaining your full driving license
              </p>
              
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                <p className="text-sm text-green-800 text-center">
                  First 50 questions are free! Remaining 100 questions
                  {hasSharedSocial ? (
                    <span className="font-semibold text-green-600"> unlocked ✓</span>
                  ) : (
                    <span className="font-semibold text-blue-600"> unlock by sharing</span>
                  )}
                </p>
              </div>
              
              <Button 
                onClick={() => startQuiz('HonMen')}
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start HonMen Quiz ({hasSharedSocial ? '150' : '50'} questions)
              </Button>
              
              {!hasSharedSocial && (
                <Button 
                  onClick={() => setShowSocialModal(true)}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50 py-4"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share to Unlock All Questions
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <Card className="bg-white/50 backdrop-blur-sm mb-8">
          <CardContent className="py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">150</div>
                <div className="text-gray-600">Karimen Questions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">150</div>
                <div className="text-gray-600">HonMen Questions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">{hasSharedSocial ? '300' : '100'}</div>
                <div className="text-gray-600">Available Questions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">∞</div>
                <div className="text-gray-600">Practice Attempts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 border-t border-white/20">
          <p className="text-gray-600 flex items-center justify-center space-x-2">
            <span>🇯🇵</span>
            <span>Japanese Driving Test Practice App</span>
            <span>🚗</span>
          </p>
        </div>
      </div>

      {/* Social Sharing Modal */}
      <SocialSharingModal
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
        onShareComplete={handleSocialShare}
      />
    </div>
  );
};

export default Index;
