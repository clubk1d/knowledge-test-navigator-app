-- Create questions table
CREATE TABLE public.questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  answer BOOLEAN NOT NULL,
  explanation TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Karimen', 'HonMen')),
  image_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Create policies (questions are public for reading, admin-only for writing)
CREATE POLICY "Questions are viewable by everyone" 
ON public.questions 
FOR SELECT 
USING (true);

-- Create update trigger for timestamps
CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Karimen questions
INSERT INTO public.questions (question_text, answer, explanation, category, is_premium) VALUES
('Cars drive on the left side of the road in Japan. (Question 1)', true, 'In Japan, vehicles are legally required to drive on the left side of the road.', 'Karimen', false),
('At intersections without traffic signals, vehicles coming from the right have priority. (Question 2)', true, 'At intersections of equal width without signals, vehicles coming from the right have priority.', 'Karimen', false),
('Pedestrians have priority at crosswalks. (Question 3)', true, 'Pedestrians always have priority at crosswalks, and vehicles must stop and give way to pedestrians.', 'Karimen', false),
('You must come to a complete stop at red lights. (Question 4)', true, 'At red lights, you must come to a complete stop before the stop line and wait until the light turns green.', 'Karimen', false),
('Using mobile phones while driving is prohibited. (Question 5)', true, 'Using mobile phones while driving is prohibited by traffic law and carries penalties.', 'Karimen', false),
('In rainy weather, you need to maintain a longer following distance than usual. (Question 6)', true, 'In rainy weather, roads become slippery and braking distance increases, so you need to maintain a longer following distance.', 'Karimen', false),
('Yellow lights mean you should speed up to pass through. (Question 7)', false, 'Yellow lights mean caution and prepare to stop. You should only proceed if you cannot stop safely.', 'Karimen', false),
('Drunk driving is acceptable if it''s just a small amount. (Question 8)', false, 'Drunk driving is prohibited by law regardless of the amount and can cause serious accidents.', 'Karimen', false),
('Seat belts are only required on highways. (Question 9)', false, 'Seat belts are mandatory for all seats on both regular roads and highways.', 'Karimen', false),
('Speed limits are just guidelines and can be slightly exceeded. (Question 10)', false, 'Speed limits are legally mandated maximum speeds, and exceeding them is a traffic violation.', 'Karimen', false);

-- Insert more Karimen questions (continuing the pattern up to 150)
INSERT INTO public.questions (question_text, answer, explanation, category, is_premium)
SELECT 
  CASE (i % 10)
    WHEN 0 THEN 'Cars drive on the left side of the road in Japan. (Question ' || (i + 1) || ')'
    WHEN 1 THEN 'At intersections without traffic signals, vehicles coming from the right have priority. (Question ' || (i + 1) || ')'
    WHEN 2 THEN 'Pedestrians have priority at crosswalks. (Question ' || (i + 1) || ')'
    WHEN 3 THEN 'You must come to a complete stop at red lights. (Question ' || (i + 1) || ')'
    WHEN 4 THEN 'Using mobile phones while driving is prohibited. (Question ' || (i + 1) || ')'
    WHEN 5 THEN 'In rainy weather, you need to maintain a longer following distance than usual. (Question ' || (i + 1) || ')'
    WHEN 6 THEN 'Yellow lights mean you should speed up to pass through. (Question ' || (i + 1) || ')'
    WHEN 7 THEN 'Drunk driving is acceptable if it''s just a small amount. (Question ' || (i + 1) || ')'
    WHEN 8 THEN 'Seat belts are only required on highways. (Question ' || (i + 1) || ')'
    WHEN 9 THEN 'Speed limits are just guidelines and can be slightly exceeded. (Question ' || (i + 1) || ')'
  END,
  CASE (i % 10)
    WHEN 0 THEN true
    WHEN 1 THEN true
    WHEN 2 THEN true
    WHEN 3 THEN true
    WHEN 4 THEN true
    WHEN 5 THEN true
    WHEN 6 THEN false
    WHEN 7 THEN false
    WHEN 8 THEN false
    WHEN 9 THEN false
  END,
  CASE (i % 10)
    WHEN 0 THEN 'In Japan, vehicles are legally required to drive on the left side of the road.'
    WHEN 1 THEN 'At intersections of equal width without signals, vehicles coming from the right have priority.'
    WHEN 2 THEN 'Pedestrians always have priority at crosswalks, and vehicles must stop and give way to pedestrians.'
    WHEN 3 THEN 'At red lights, you must come to a complete stop before the stop line and wait until the light turns green.'
    WHEN 4 THEN 'Using mobile phones while driving is prohibited by traffic law and carries penalties.'
    WHEN 5 THEN 'In rainy weather, roads become slippery and braking distance increases, so you need to maintain a longer following distance.'
    WHEN 6 THEN 'Yellow lights mean caution and prepare to stop. You should only proceed if you cannot stop safely.'
    WHEN 7 THEN 'Drunk driving is prohibited by law regardless of the amount and can cause serious accidents.'
    WHEN 8 THEN 'Seat belts are mandatory for all seats on both regular roads and highways.'
    WHEN 9 THEN 'Speed limits are legally mandated maximum speeds, and exceeding them is a traffic violation.'
  END,
  'Karimen',
  i >= 49  -- Questions 50+ are premium (i starts at 10, so 49+ means question 50+)
FROM generate_series(10, 149) AS i;

-- Insert HonMen questions
INSERT INTO public.questions (question_text, answer, explanation, category, is_premium) VALUES
('The minimum speed on highways is 50 km/h. (Full License Question 1)', true, 'The minimum speed on highways is set at 50 km/h, and driving below this speed is a violation.', 'HonMen', false),
('When overtaking, you should pass on the right side. (Full License Question 2)', true, 'Overtaking should be done on the right side, and you should return to the left lane promptly after overtaking.', 'HonMen', false),
('Traffic laws do not apply in parking lots. (Full License Question 3)', false, 'Traffic laws may apply in parking lots as well, and safe driving responsibilities are always required.', 'HonMen', false),
('Checking mirrors is only necessary when starting the vehicle. (Full License Question 4)', false, 'Mirror checks are necessary not only when starting but also when changing lanes, stopping, and at all times while driving.', 'HonMen', false),
('Motorcycles under 50cc can drive on highways. (Full License Question 5)', false, 'Motorcycles under 50cc (moped) are prohibited from entering highways.', 'HonMen', false),
('Headlights must be turned on at night. (Full License Question 6)', true, 'Headlights must be turned on at night and during twilight hours to ensure visibility and inform other traffic participants of your vehicle''s presence.', 'HonMen', false),
('At stop signs, you can proceed slowly without coming to a complete stop. (Full License Question 7)', false, 'At stop signs, you must come to a complete stop and then check for safety before proceeding.', 'HonMen', false),
('Cars with expired vehicle inspection cannot be driven on public roads. (Full License Question 8)', true, 'Cars with expired vehicle inspection cannot be driven on public roads, and violations carry heavy penalties.', 'HonMen', false),
('Compulsory automobile liability insurance is optional. (Full License Question 9)', false, 'Compulsory automobile liability insurance is legally mandated, and driving without it is illegal.', 'HonMen', false),
('At railway crossings, you must stop and check for safety. (Full License Question 10)', true, 'At railway crossings, you must come to a complete stop and check left and right for safety before crossing.', 'HonMen', false);

-- Insert more HonMen questions (continuing the pattern up to 150)
INSERT INTO public.questions (question_text, answer, explanation, category, is_premium)
SELECT 
  CASE (i % 10)
    WHEN 0 THEN 'The minimum speed on highways is 50 km/h. (Full License Question ' || (i + 1) || ')'
    WHEN 1 THEN 'When overtaking, you should pass on the right side. (Full License Question ' || (i + 1) || ')'
    WHEN 2 THEN 'Traffic laws do not apply in parking lots. (Full License Question ' || (i + 1) || ')'
    WHEN 3 THEN 'Checking mirrors is only necessary when starting the vehicle. (Full License Question ' || (i + 1) || ')'
    WHEN 4 THEN 'Motorcycles under 50cc can drive on highways. (Full License Question ' || (i + 1) || ')'
    WHEN 5 THEN 'Headlights must be turned on at night. (Full License Question ' || (i + 1) || ')'
    WHEN 6 THEN 'At stop signs, you can proceed slowly without coming to a complete stop. (Full License Question ' || (i + 1) || ')'
    WHEN 7 THEN 'Cars with expired vehicle inspection cannot be driven on public roads. (Full License Question ' || (i + 1) || ')'
    WHEN 8 THEN 'Compulsory automobile liability insurance is optional. (Full License Question ' || (i + 1) || ')'
    WHEN 9 THEN 'At railway crossings, you must stop and check for safety. (Full License Question ' || (i + 1) || ')'
  END,
  CASE (i % 10)
    WHEN 0 THEN true
    WHEN 1 THEN true
    WHEN 2 THEN false
    WHEN 3 THEN false
    WHEN 4 THEN false
    WHEN 5 THEN true
    WHEN 6 THEN false
    WHEN 7 THEN true
    WHEN 8 THEN false
    WHEN 9 THEN true
  END,
  CASE (i % 10)
    WHEN 0 THEN 'The minimum speed on highways is set at 50 km/h, and driving below this speed is a violation.'
    WHEN 1 THEN 'Overtaking should be done on the right side, and you should return to the left lane promptly after overtaking.'
    WHEN 2 THEN 'Traffic laws may apply in parking lots as well, and safe driving responsibilities are always required.'
    WHEN 3 THEN 'Mirror checks are necessary not only when starting but also when changing lanes, stopping, and at all times while driving.'
    WHEN 4 THEN 'Motorcycles under 50cc (moped) are prohibited from entering highways.'
    WHEN 5 THEN 'Headlights must be turned on at night and during twilight hours to ensure visibility and inform other traffic participants of your vehicle''s presence.'
    WHEN 6 THEN 'At stop signs, you must come to a complete stop and then check for safety before proceeding.'
    WHEN 7 THEN 'Cars with expired vehicle inspection cannot be driven on public roads, and violations carry heavy penalties.'
    WHEN 8 THEN 'Compulsory automobile liability insurance is legally mandated, and driving without it is illegal.'
    WHEN 9 THEN 'At railway crossings, you must come to a complete stop and check left and right for safety before crossing.'
  END,
  'HonMen',
  i >= 49  -- Questions 50+ are premium
FROM generate_series(10, 149) AS i;