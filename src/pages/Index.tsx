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
    { text: "車は左側通行です。", answer: true, explanation: "日本では車両は道路の左側を通行することが法律で定められています。" },
    { text: "信号のない交差点では、右から来る車が優先です。", answer: true, explanation: "信号のない同幅員の交差点では、右から来る車両が優先となります。" },
    { text: "横断歩道では歩行者が優先です。", answer: true, explanation: "横断歩道では常に歩行者が優先され、車両は一時停止して歩行者を優先させる必要があります。" },
    { text: "赤信号では完全に停止する必要があります。", answer: true, explanation: "赤信号では停止線の前で完全に停止し、青信号に変わるまで待機する必要があります。" },
    { text: "運転中の携帯電話の使用は禁止されています。", answer: true, explanation: "運転中の携帯電話の使用は道路交通法で禁止されており、違反すると罰則があります。" },
    { text: "雨天時は車間距離を普段より長く取る必要があります。", answer: true, explanation: "雨天時は路面が滑りやすくなり制動距離が長くなるため、車間距離を普段より長く取る必要があります。" },
    { text: "黄信号は速度を上げて通過してよい合図です。", answer: false, explanation: "黄信号は注意して停止する合図です。安全に停止できない場合のみ注意して進行できます。" },
    { text: "飲酒運転は少量なら問題ありません。", answer: false, explanation: "飲酒運転は量に関係なく法律で禁止されており、重大な事故の原因となります。" },
    { text: "シートベルトは高速道路でのみ着用義務があります。", answer: false, explanation: "シートベルトは一般道路、高速道路を問わず全ての座席で着用が義務付けられています。" },
    { text: "制限速度は目安であり、多少超過しても問題ありません。", answer: false, explanation: "制限速度は法律で定められた最高速度であり、これを超過することは違反行為です。" },
  ];

  const questions: Question[] = [];
  for (let i = 0; i < 150; i++) {
    const baseIndex = i % baseQuestions.length;
    const base = baseQuestions[baseIndex];
    questions.push({
      id: i + 1,
      question_text: `${base.text} (問題${i + 1})`,
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
    { text: "高速道路での最低速度は50km/hです。", answer: true, explanation: "高速道路では最低速度が50km/hと定められており、これを下回る速度での走行は違反となります。" },
    { text: "追い越し時は右側から行います。", answer: true, explanation: "追い越しは原則として右側から行い、追い越し後は速やかに左側車線に戻る必要があります。" },
    { text: "駐車場内では道路交通法は適用されません。", answer: false, explanation: "駐車場内でも道路交通法の規定が適用される場合があり、安全運転義務は常に求められます。" },
    { text: "バックミラーの確認は発進時のみ必要です。", answer: false, explanation: "バックミラーの確認は発進時だけでなく、車線変更や停止時など常に必要です。" },
    { text: "原動機付自転車は高速道路を走行できます。", answer: false, explanation: "原動機付自転車（50cc以下）は高速道路への進入が禁止されています。" },
    { text: "夜間は前照灯を点灯する必要があります。", answer: true, explanation: "夜間および薄暮時は前照灯を点灯し、視界の確保と他の交通参加者への自車の存在を知らせる必要があります。" },
    { text: "一時停止標識では徐行すれば停止しなくてもよい。", answer: false, explanation: "一時停止標識がある場所では、必ず完全に停止してから安全確認を行う必要があります。" },
    { text: "車検が切れた車は公道を走行できません。", answer: true, explanation: "車検が切れた自動車は公道を走行することができず、違反すると重い罰則があります。" },
    { text: "自賠責保険の加入は任意です。", answer: false, explanation: "自賠責保険の加入は法律で義務付けられており、未加入での運転は違法です。" },
    { text: "踏切では一時停止して安全確認する必要があります。", answer: true, explanation: "踏切では必ず一時停止し、左右の安全確認を行ってから通過する必要があります。" },
  ];

  const questions: Question[] = [];
  for (let i = 0; i < 150; i++) {
    const baseIndex = i % baseQuestions.length;
    const base = baseQuestions[baseIndex];
    questions.push({
      id: i + 1001, // Different ID range for HonMen
      question_text: `${base.text} (本免問題${i + 1})`,
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
              運転免許試験対策
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
              運転免許試験対策
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
              <h1 className="text-2xl font-bold text-gray-900">運転免許試験対策</h1>
              <p className="text-gray-600">ようこそ、{user.email}さん！</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => window.open('https://www.paypal.com/paypalme/yourpaypalhandle', '_blank')}
              className="hover:bg-yellow-50 border-yellow-300 text-yellow-700"
            >
              <Coffee className="w-4 h-4 mr-2" />
              応援
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setCurrentView('progress')}
              className="hover:bg-blue-50"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              進捗
            </Button>
            
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('admin')}
                className="hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                管理
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={signOut}
              className="hover:bg-red-50 hover:border-red-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
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
                仮免許試験 (Karimen)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                仮免許取得のための学科試験対策
              </p>
              
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                <p className="text-sm text-green-800 text-center">
                  最初の50問は無料！残り100問は
                  {hasSharedSocial ? (
                    <span className="font-semibold text-green-600"> アンロック済み ✓</span>
                  ) : (
                    <span className="font-semibold text-blue-600"> SNSシェアで解放</span>
                  )}
                </p>
              </div>
              
              <Button 
                onClick={() => startQuiz('Karimen')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                仮免問題を開始 ({hasSharedSocial ? '150' : '50'}問)
              </Button>
              
              {!hasSharedSocial && (
                <Button 
                  onClick={() => setShowSocialModal(true)}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 py-4"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  SNSシェアして全問題解放
                </Button>
              )}
            </CardContent>
          </Card>

          {/* HonMen Category */}
          <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-green-700 flex items-center justify-center">
                <Trophy className="w-6 h-6 mr-2" />
                本免許試験 (HonMen)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                本免許取得のための学科試験対策
              </p>
              
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                <p className="text-sm text-green-800 text-center">
                  最初の50問は無料！残り100問は
                  {hasSharedSocial ? (
                    <span className="font-semibold text-green-600"> アンロック済み ✓</span>
                  ) : (
                    <span className="font-semibold text-blue-600"> SNSシェアで解放</span>
                  )}
                </p>
              </div>
              
              <Button 
                onClick={() => startQuiz('HonMen')}
                className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                本免問題を開始 ({hasSharedSocial ? '150' : '50'}問)
              </Button>
              
              {!hasSharedSocial && (
                <Button 
                  onClick={() => setShowSocialModal(true)}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50 py-4"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  SNSシェアして全問題解放
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
                <div className="text-gray-600">仮免問題</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">150</div>
                <div className="text-gray-600">本免問題</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">{hasSharedSocial ? '300' : '100'}</div>
                <div className="text-gray-600">利用可能問題数</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-2">∞</div>
                <div className="text-gray-600">練習回数</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Japanese Pride Footer */}
        <div className="text-center py-8 border-t border-white/20">
          <p className="text-gray-600 flex items-center justify-center space-x-2">
            <span>🇯🇵</span>
            <span>日本の運転免許試験対策アプリ</span>
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
