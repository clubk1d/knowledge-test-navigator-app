-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Create policies (questions are public for reading)
CREATE POLICY "Questions are viewable by everyone" 
ON public.questions 
FOR SELECT 
USING (true);

-- Create update trigger for timestamps
CREATE TRIGGER update_questions_updated_at
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert all 300 questions (150 Karimen + 150 HonMen)
INSERT INTO public.questions (question_text, answer, explanation, category, is_premium)
SELECT 
  CASE 
    WHEN s <= 150 THEN
      CASE ((s-1) % 10)
        WHEN 0 THEN 'Cars drive on the left side of the road in Japan. (Question ' || s || ')'
        WHEN 1 THEN 'At intersections without traffic signals, vehicles coming from the right have priority. (Question ' || s || ')'
        WHEN 2 THEN 'Pedestrians have priority at crosswalks. (Question ' || s || ')'
        WHEN 3 THEN 'You must come to a complete stop at red lights. (Question ' || s || ')'
        WHEN 4 THEN 'Using mobile phones while driving is prohibited. (Question ' || s || ')'
        WHEN 5 THEN 'In rainy weather, you need to maintain a longer following distance than usual. (Question ' || s || ')'
        WHEN 6 THEN 'Yellow lights mean you should speed up to pass through. (Question ' || s || ')'
        WHEN 7 THEN 'Drunk driving is acceptable if it''s just a small amount. (Question ' || s || ')'
        WHEN 8 THEN 'Seat belts are only required on highways. (Question ' || s || ')'
        WHEN 9 THEN 'Speed limits are just guidelines and can be slightly exceeded. (Question ' || s || ')'
      END
    ELSE
      CASE ((s-151) % 10)
        WHEN 0 THEN 'The minimum speed on highways is 50 km/h. (Full License Question ' || (s-150) || ')'
        WHEN 1 THEN 'When overtaking, you should pass on the right side. (Full License Question ' || (s-150) || ')'
        WHEN 2 THEN 'Traffic laws do not apply in parking lots. (Full License Question ' || (s-150) || ')'
        WHEN 3 THEN 'Checking mirrors is only necessary when starting the vehicle. (Full License Question ' || (s-150) || ')'
        WHEN 4 THEN 'Motorcycles under 50cc can drive on highways. (Full License Question ' || (s-150) || ')'
        WHEN 5 THEN 'Headlights must be turned on at night. (Full License Question ' || (s-150) || ')'
        WHEN 6 THEN 'At stop signs, you can proceed slowly without coming to a complete stop. (Full License Question ' || (s-150) || ')'
        WHEN 7 THEN 'Cars with expired vehicle inspection cannot be driven on public roads. (Full License Question ' || (s-150) || ')'
        WHEN 8 THEN 'Compulsory automobile liability insurance is optional. (Full License Question ' || (s-150) || ')'
        WHEN 9 THEN 'At railway crossings, you must stop and check for safety. (Full License Question ' || (s-150) || ')'
      END
  END,
  CASE 
    WHEN s <= 150 THEN
      CASE ((s-1) % 10) WHEN 0,1,2,3,4,5 THEN true ELSE false END
    ELSE
      CASE ((s-151) % 10) WHEN 0,1,5,7,9 THEN true ELSE false END
  END,
  CASE 
    WHEN s <= 150 THEN
      CASE ((s-1) % 10)
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
      END
    ELSE
      CASE ((s-151) % 10)
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
      END
  END,
  CASE WHEN s <= 150 THEN 'Karimen' ELSE 'HonMen' END,
  CASE WHEN s <= 150 THEN s >= 50 ELSE (s-150) >= 50 END
FROM generate_series(1, 300) AS s;