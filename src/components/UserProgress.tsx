import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Clock } from 'lucide-react';
import { useCacheProgress } from '@/hooks/useCacheProgress';

const UserProgress = () => {
  const { progress, clearProgress } = useCacheProgress();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {progress.totalSessions || 0}
              </div>
            </div>
            <div className="text-sm sm:text-base text-gray-600">Quiz Sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {Math.round(progress.averageScore || 0)}%
              </div>
            </div>
            <div className="text-sm sm:text-base text-gray-600">Average Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {formatTime(progress.totalTimeSpent || 0)}
              </div>
            </div>
            <div className="text-sm sm:text-base text-gray-600">Time Practiced</div>
          </CardContent>
        </Card>
      </div>

      {/* Clear Progress Button */}
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={clearProgress}
          className="hover:bg-red-50 hover:border-red-200 text-red-600"
          size="sm"
        >
          Clear All Progress
        </Button>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Progress by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(progress.categoryStats).map(([category, stats]) => (
              <div key={category}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm sm:text-base font-medium">
                    {category === 'Karimen' ? 'Provisional License (Karimen)' : 
                     category === 'HonMen' ? 'Full License (HonMen)' : 
                     category}
                  </span>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {stats.correctAnswers}/{stats.totalQuestions}
                  </Badge>
                </div>
                <Progress 
                  value={stats.averageScore || 0} 
                  className="h-2 sm:h-3"
                />
                <div className="flex justify-between text-xs sm:text-sm text-gray-500 mt-1">
                  <span>{Math.round(stats.averageScore || 0)}% accuracy</span>
                  <span>{stats.sessions} sessions • {formatTime(stats.timeSpent)}</span>
                </div>
              </div>
            ))}
            
            {Object.keys(progress.categoryStats).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm sm:text-base">
                  No quiz data yet. Start a quiz to see your progress!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Support Card */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-4 sm:p-6 text-center">
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Enjoying the quiz app?</h3>
            <p className="text-sm sm:text-base text-gray-600">Your support helps keep this project running!</p>
            <a
              href="https://paypal.me/yourpaypallink"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
            >
              ☕ Buy me a coffee
            </a>
            <p className="text-xs sm:text-sm text-gray-500">
              Support the developer with a small donation!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProgress;