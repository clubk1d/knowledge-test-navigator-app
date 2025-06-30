
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { QuizSession } from '@/types/quiz';
import { useToast } from '@/hooks/use-toast';

export const useQuizProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const updateProgress = async (session: QuizSession) => {
    if (!user || session.questions.length === 0) return;

    const category = session.questions[0].category || 'General';
    const correctAnswers = session.score;
    const totalQuestions = session.answeredQuestions.length;
    const timeSpent = session.answeredQuestions.reduce((sum, q) => sum + (q.timeSpent || 0), 0);

    try {
      // Update user progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          category,
          questions_answered: totalQuestions,
          correct_answers: correctAnswers,
          total_time_spent: timeSpent,
          last_quiz_date: new Date().toISOString(),
        }, {
          onConflict: 'user_id,category',
          ignoreDuplicates: false
        });

      if (progressError) throw progressError;

      // Save quiz session
      const { error: sessionError } = await supabase
        .from('quiz_sessions')
        .insert({
          user_id: user.id,
          category,
          total_questions: session.totalQuestions,
          correct_answers: correctAnswers,
          time_spent: timeSpent,
        });

      if (sessionError) throw sessionError;

      // Check for new achievements
      await checkAchievements(totalQuestions, correctAnswers, timeSpent, category);

    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const checkAchievements = async (questionsAnswered: number, correctAnswers: number, timeSpent: number, category: string) => {
    if (!user) return;

    try {
      // Get all achievements user hasn't earned yet
      const { data: availableAchievements } = await supabase
        .from('achievements')
        .select('*')
        .not('id', 'in', `(
          SELECT achievement_id 
          FROM user_achievements 
          WHERE user_id = '${user.id}'
        )`);

      if (!availableAchievements) return;

      // Get user's total progress
      const { data: userProgress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      const totalQuestionsAnswered = userProgress?.reduce((sum, p) => sum + p.questions_answered, 0) || 0;
      const totalCorrectAnswers = userProgress?.reduce((sum, p) => sum + p.correct_answers, 0) || 0;

      const newAchievements = [];

      for (const achievement of availableAchievements) {
        let earned = false;

        switch (achievement.requirement_type) {
          case 'questions_answered':
            earned = totalQuestionsAnswered >= achievement.requirement_value;
            break;
          case 'correct_streak':
            earned = correctAnswers >= achievement.requirement_value;
            break;
          case 'speed_demon':
            earned = timeSpent <= achievement.requirement_value;
            break;
          case 'category_master':
            const categoryProgress = userProgress?.find(p => p.category === category);
            earned = categoryProgress && categoryProgress.questions_answered >= 20 && 
                     (categoryProgress.correct_answers / categoryProgress.questions_answered) >= 0.8;
            break;
        }

        if (earned) {
          newAchievements.push(achievement);
        }
      }

      // Award new achievements
      if (newAchievements.length > 0) {
        const achievementInserts = newAchievements.map(achievement => ({
          user_id: user.id,
          achievement_id: achievement.id,
        }));

        const { error } = await supabase
          .from('user_achievements')
          .insert(achievementInserts);

        if (!error) {
          newAchievements.forEach(achievement => {
            toast({
              title: "Achievement Unlocked! 🎉",
              description: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
            });
          });
        }
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  return { updateProgress };
};
