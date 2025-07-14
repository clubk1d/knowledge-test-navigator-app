-- Add gamification columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN xp INTEGER DEFAULT 0,
ADD COLUMN level INTEGER DEFAULT 1,
ADD COLUMN current_streak INTEGER DEFAULT 0,
ADD COLUMN longest_streak INTEGER DEFAULT 0,
ADD COLUMN last_activity_date DATE,
ADD COLUMN total_coins INTEGER DEFAULT 0;

-- Create XP calculation function
CREATE OR REPLACE FUNCTION public.calculate_xp_reward(
  correct_answers INTEGER,
  total_questions INTEGER,
  time_spent INTEGER,
  streak_bonus INTEGER DEFAULT 0
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  base_xp INTEGER;
  accuracy_bonus INTEGER;
  speed_bonus INTEGER;
  total_xp INTEGER;
BEGIN
  -- Base XP: 10 points per correct answer
  base_xp := correct_answers * 10;
  
  -- Accuracy bonus: extra points for high accuracy
  IF total_questions > 0 THEN
    accuracy_bonus := CASE 
      WHEN (correct_answers::FLOAT / total_questions) >= 0.9 THEN 50
      WHEN (correct_answers::FLOAT / total_questions) >= 0.8 THEN 30
      WHEN (correct_answers::FLOAT / total_questions) >= 0.7 THEN 20
      ELSE 0
    END;
  ELSE
    accuracy_bonus := 0;
  END IF;
  
  -- Speed bonus: bonus for completing quickly (less than 30 seconds per question on average)
  speed_bonus := CASE 
    WHEN time_spent > 0 AND (time_spent::FLOAT / total_questions) <= 30 THEN 25
    WHEN time_spent > 0 AND (time_spent::FLOAT / total_questions) <= 45 THEN 15
    ELSE 0
  END;
  
  total_xp := base_xp + accuracy_bonus + speed_bonus + streak_bonus;
  
  RETURN GREATEST(total_xp, 0);
END;
$$;

-- Create level calculation function
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  level INTEGER;
BEGIN
  -- Level formula: level = floor(sqrt(xp / 100)) + 1
  -- This means: Level 1 = 0-99 XP, Level 2 = 100-399 XP, Level 3 = 400-899 XP, etc.
  level := FLOOR(SQRT(xp::FLOAT / 100)) + 1;
  RETURN GREATEST(level, 1);
END;
$$;

-- Create function to update user progress with gamification
CREATE OR REPLACE FUNCTION public.update_user_gamification(
  p_user_id UUID,
  p_correct_answers INTEGER,
  p_total_questions INTEGER,
  p_time_spent INTEGER,
  p_category TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  current_profile RECORD;
  xp_reward INTEGER;
  new_xp INTEGER;
  new_level INTEGER;
  old_level INTEGER;
  streak_bonus INTEGER := 0;
  new_streak INTEGER;
  level_up BOOLEAN := FALSE;
  today_date DATE := CURRENT_DATE;
  result JSON;
BEGIN
  -- Get current profile data
  SELECT xp, level, current_streak, last_activity_date, total_coins
  INTO current_profile
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- Calculate streak
  IF current_profile.last_activity_date IS NULL THEN
    new_streak := 1;
  ELSIF current_profile.last_activity_date = today_date THEN
    new_streak := current_profile.current_streak; -- Same day, keep streak
  ELSIF current_profile.last_activity_date = today_date - INTERVAL '1 day' THEN
    new_streak := current_profile.current_streak + 1; -- Consecutive day
    streak_bonus := LEAST(new_streak * 5, 50); -- Max 50 bonus points
  ELSE
    new_streak := 1; -- Streak broken
  END IF;
  
  -- Calculate XP reward
  xp_reward := public.calculate_xp_reward(p_correct_answers, p_total_questions, p_time_spent, streak_bonus);
  new_xp := current_profile.xp + xp_reward;
  
  -- Calculate new level
  old_level := current_profile.level;
  new_level := public.calculate_level_from_xp(new_xp);
  level_up := new_level > old_level;
  
  -- Calculate coins (1 coin per 10 XP earned)
  
  -- Update profile
  UPDATE public.profiles 
  SET 
    xp = new_xp,
    level = new_level,
    current_streak = new_streak,
    longest_streak = GREATEST(current_profile.longest_streak, new_streak),
    last_activity_date = today_date,
    total_coins = current_profile.total_coins + (xp_reward / 10),
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Return gamification data
  result := json_build_object(
    'xp_earned', xp_reward,
    'total_xp', new_xp,
    'old_level', old_level,
    'new_level', new_level,
    'level_up', level_up,
    'current_streak', new_streak,
    'streak_bonus', streak_bonus,
    'coins_earned', (xp_reward / 10)
  );
  
  RETURN result;
END;
$$;

-- Insert more achievements for gamification
INSERT INTO public.achievements (name, description, icon, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first quiz', '🎯', 'quizzes_completed', 1),
('Getting Started', 'Answer 50 questions correctly', '✅', 'correct_answers', 50),
('Knowledge Seeker', 'Answer 100 questions correctly', '📚', 'correct_answers', 100),
('Expert Driver', 'Answer 500 questions correctly', '🏆', 'correct_answers', 500),
('Speed Demon', 'Complete a quiz in under 20 seconds per question', '⚡', 'average_time', 20),
('Perfectionist', 'Get 100% accuracy on a 20+ question quiz', '💯', 'perfect_score', 20),
('Level Up!', 'Reach level 5', '⭐', 'level', 5),
('High Achiever', 'Reach level 10', '🌟', 'level', 10),
('Streak Master', 'Maintain a 7-day streak', '🔥', 'streak', 7),
('Dedication', 'Maintain a 30-day streak', '💪', 'streak', 30),
('XP Hunter', 'Earn 1000 total XP', '💎', 'total_xp', 1000),
('Knowledge Master', 'Earn 5000 total XP', '👑', 'total_xp', 5000),
('Karimen Expert', 'Complete 10 Karimen quizzes', '🚗', 'category_quizzes', 10),
('HonMen Master', 'Complete 10 HonMen quizzes', '🏁', 'category_quizzes', 10)
ON CONFLICT DO NOTHING;

-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;