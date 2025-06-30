
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Clock, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProgressData {
  category: string;
  questions_answered: number;
  correct_answers: number;
  total_time_spent: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at?: string;
}

const UserProgress = () => {
  const [progress, setProgress] = useState<UserProgressData[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserProgress();
      fetchUserAchievements();
    }
  }, [user]);

  const fetchUserProgress = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);

    if (!error && data) {
      setProgress(data);
    }
    setLoading(false);
  };

  const fetchUserAchievements = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('achievements')
      .select(`
        id,
        name,
        description,
        icon,
        user_achievements!inner(earned_at)
      `)
      .eq('user_achievements.user_id', user.id);

    if (!error && data) {
      setAchievements(data.map(achievement => ({
        ...achievement,
        earned_at: achievement.user_achievements?.[0]?.earned_at
      })));
    }
  };

  const getAccuracyPercentage = (correct: number, total: number) => {
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading your progress...</div>;
  }

  const totalQuestions = progress.reduce((sum, p) => sum + p.questions_answered, 0);
  const totalCorrect = progress.reduce((sum, p) => sum + p.correct_answers, 0);
  const totalTime = progress.reduce((sum, p) => sum + p.total_time_spent, 0);

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalQuestions}</p>
                <p className="text-sm text-gray-600">Questions Answered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{getAccuracyPercentage(totalCorrect, totalQuestions)}%</p>
                <p className="text-sm text-gray-600">Overall Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{formatTime(totalTime)}</p>
                <p className="text-sm text-gray-600">Time Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Progress */}
      {progress.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progress by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progress.map((categoryProgress) => (
              <div key={categoryProgress.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{categoryProgress.category}</span>
                  <Badge variant="secondary">
                    {categoryProgress.correct_answers}/{categoryProgress.questions_answered} correct
                  </Badge>
                </div>
                <Progress 
                  value={getAccuracyPercentage(categoryProgress.correct_answers, categoryProgress.questions_answered)} 
                  className="h-2"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{getAccuracyPercentage(categoryProgress.correct_answers, categoryProgress.questions_answered)}% accuracy</span>
                  <span>{formatTime(categoryProgress.total_time_spent)} spent</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Your Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h4 className="font-semibold">{achievement.name}</h4>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    {achievement.earned_at && (
                      <p className="text-xs text-green-600">
                        Earned {new Date(achievement.earned_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* PayPal Coffee Link */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">Enjoying the quiz app?</h3>
            <p className="text-gray-600">Your support helps keep this project running!</p>
            <a
              href="https://paypal.me/yourpaypallink"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors"
            >
              ☕ Buy me a coffee
            </a>
            <p className="text-sm text-gray-500">
              Do you like it? Support the developer with a small donation!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProgress;
