
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy } from 'lucide-react';
import QuestionCard from '@/components/QuestionCard';
import SocialSharingModal from '@/components/SocialSharingModal';
import AdminDashboard from '@/components/AdminDashboard';
import PasswordResetForm from '@/components/PasswordResetForm';
import UserProgress from '@/components/UserProgress';
import AppHeader from '@/components/AppHeader';
import QuizStats from '@/components/QuizStats';
import QuizCategoryCard from '@/components/QuizCategoryCard';
import LoadingScreen from '@/components/LoadingScreen';
import AuthScreen from '@/components/AuthScreen';
import { Question, QuizSession } from '@/types/quiz';
import { useAuth } from '@/contexts/AuthContext';
import { useQuizProgress } from '@/hooks/useQuizProgress';
import { supabase } from '@/integrations/supabase/client';
import { generateAllQuestions } from '@/utils/questionGenerator';

const Index = () => {
  const [currentView, setCurrentView] = useState<'menu' | 'quiz' | 'admin' | 'progress' | 'password-reset'>('menu');
  const [questions, setQuestions] = useState<Question[]>(generateAllQuestions());
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
    return <LoadingScreen />;
  }

  // Show password reset form if user is resetting password
  if (isPasswordReset && currentView === 'password-reset') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
              {/* BookOpen icon */}
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
    return <AuthScreen />;
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
        <AppHeader
          userEmail={user.email || ''}
          isAdmin={isAdmin}
          onProgressClick={() => setCurrentView('progress')}
          onAdminClick={() => setCurrentView('admin')}
          onSignOut={signOut}
        />

        {/* Quiz Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <QuizCategoryCard
            category="Karimen"
            hasSharedSocial={hasSharedSocial}
            onStartQuiz={startQuiz}
            onShowSocialModal={() => setShowSocialModal(true)}
          />
          <QuizCategoryCard
            category="HonMen"
            hasSharedSocial={hasSharedSocial}
            onStartQuiz={startQuiz}
            onShowSocialModal={() => setShowSocialModal(true)}
          />
        </div>

        <QuizStats hasSharedSocial={hasSharedSocial} />

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
