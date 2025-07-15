import { useState, useEffect } from 'react';
import { QuizSession } from '@/types/quiz';

interface CachedProgress {
  totalSessions: number;
  averageScore: number;
  totalTimeSpent: number;
  categoryStats: {
    [key: string]: {
      sessions: number;
      totalQuestions: number;
      correctAnswers: number;
      averageScore: number;
      timeSpent: number;
    };
  };
}

export const useCacheProgress = () => {
  const [progress, setProgress] = useState<CachedProgress>({
    totalSessions: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    categoryStats: {}
  });

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('quiz_progress');
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (error) {
        console.error('Failed to parse saved progress:', error);
      }
    }
  }, []);

  const updateProgress = (session: QuizSession) => {
    const category = session.questions[0]?.category || 'all';
    const sessionScore = (session.score / session.totalQuestions) * 100;
    const timeSpent = Math.round(Date.now() / 1000); // Simple time calculation

    setProgress(prev => {
      const newProgress = { ...prev };
      
      // Update overall stats
      newProgress.totalSessions += 1;
      newProgress.totalTimeSpent += timeSpent;
      newProgress.averageScore = 
        (prev.averageScore * prev.totalSessions + sessionScore) / newProgress.totalSessions;

      // Update category stats
      if (!newProgress.categoryStats[category]) {
        newProgress.categoryStats[category] = {
          sessions: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          averageScore: 0,
          timeSpent: 0
        };
      }

      const categoryStats = newProgress.categoryStats[category];
      categoryStats.sessions += 1;
      categoryStats.totalQuestions += session.totalQuestions;
      categoryStats.correctAnswers += session.score;
      categoryStats.timeSpent += timeSpent;
      categoryStats.averageScore = 
        (categoryStats.correctAnswers / categoryStats.totalQuestions) * 100;

      // Save to localStorage
      localStorage.setItem('quiz_progress', JSON.stringify(newProgress));
      
      return newProgress;
    });
  };

  const clearProgress = () => {
    const emptyProgress = {
      totalSessions: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      categoryStats: {}
    };
    setProgress(emptyProgress);
    localStorage.setItem('quiz_progress', JSON.stringify(emptyProgress));
  };

  return { progress, updateProgress, clearProgress };
};