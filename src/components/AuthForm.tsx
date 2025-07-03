
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, AlertTriangle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PasswordRecovery from './PasswordRecovery';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  // Handle lockout timer
  useEffect(() => {
    if (lockoutTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((lockoutTime - now) / 1000));
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setLockoutTime(null);
          setLoginAttempts(0);
          toast({
            title: "Account Unlocked",
            description: "You can now try logging in again.",
          });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [lockoutTime, toast]);

  const isLockedOut = lockoutTime && Date.now() < lockoutTime;

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        toast({
          title: "ソーシャルログインエラー",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "ログインに失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLockedOut) {
      toast({
        title: "アカウントが一時的にロックされています",
        description: `あと${Math.ceil(timeRemaining / 60)}分後に再試行してください。`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          
          if (newAttempts >= 3) {
            const lockTime = Date.now() + (15 * 60 * 1000); // 15 minutes
            setLockoutTime(lockTime);
            toast({
              title: "アカウントがロックされました",
              description: "ログイン試行回数が多すぎます。15分後に再試行してください。",
              variant: "destructive",
            });
          } else {
            toast({
              title: "ログインに失敗しました",
              description: `${error.message}. 残り試行回数: ${3 - newAttempts}回`,
              variant: "destructive",
            });
          }
        } else {
          setLoginAttempts(0);
          toast({
            title: "おかえりなさい！",
            description: "ログインに成功しました。",
          });
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast({
            title: "アカウント作成に失敗しました",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "アカウントが作成されました！",
            description: "メールを確認してアカウントを認証してください。",
          });
        }
      }
    } catch (error) {
      toast({
        title: "エラー",
        description: "予期しないエラーが発生しました。もう一度お試しください。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showPasswordRecovery) {
    return <PasswordRecovery onBack={() => setShowPasswordRecovery(false)} />;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {isLogin ? 'ログイン' : 'アカウント作成'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLockedOut && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div className="text-sm text-red-700">
              <p className="font-medium">アカウントがロックされています</p>
              <p>残り時間: {formatTime(timeRemaining)}</p>
            </div>
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12"
            onClick={() => handleSocialLogin('google')}
            disabled={socialLoading === 'google' || isLockedOut}
          >
            {socialLoading === 'google' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Googleでログイン
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
            onClick={() => handleSocialLogin('facebook')}
            disabled={socialLoading === 'facebook' || isLockedOut}
          >
            {socialLoading === 'facebook' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            )}
            Facebookでログイン
          </Button>
        </div>

        <div className="relative mb-6">
          <Separator />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-white px-2 text-sm text-gray-400">または</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName">お名前</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                placeholder="お名前を入力してください"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="メールアドレスを入力してください"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="パスワードを入力してください"
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {isLogin && loginAttempts > 0 && !isLockedOut && (
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setShowPasswordRecovery(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                パスワードをお忘れですか？
              </Button>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || isLockedOut}
          >
            {loading ? '処理中...' : (isLogin ? 'ログイン' : 'アカウント作成')}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isLogin ? "アカウントをお持ちでない方はこちら" : "すでにアカウントをお持ちの方はこちら"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
