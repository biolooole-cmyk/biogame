-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  school TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  grade INTEGER NOT NULL CHECK (grade IN (7, 8, 9)),
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  grade INTEGER NOT NULL CHECK (grade IN (7, 8, 9)),
  class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
  xp_total INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE,
  missions_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Missions table
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  storyline TEXT NOT NULL,
  grade INTEGER NOT NULL CHECK (grade IN (7, 8, 9)),
  category TEXT NOT NULL CHECK (category IN ('mystery', 'investigation', 'rescue', 'lab', 'crisis')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  xp_reward INTEGER DEFAULT 100,
  estimated_minutes INTEGER DEFAULT 30,
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mission steps table
CREATE TABLE IF NOT EXISTS public.mission_steps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('story', 'evidence', 'investigation', 'question', 'conclusion')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'chart')),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evidence table
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'data', 'text', 'chart')),
  content TEXT NOT NULL,
  media_url TEXT,
  is_key_evidence BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE NOT NULL,
  step_id UUID REFERENCES public.mission_steps(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'open_ended', 'hypothesis')),
  options JSONB,
  correct_option INTEGER,
  hint TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mission progress table
CREATE TABLE IF NOT EXISTS public.mission_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  current_step INTEGER DEFAULT 0,
  score INTEGER,
  hypothesis TEXT,
  conclusion TEXT,
  notes TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, mission_id)
);

-- Answers table
CREATE TABLE IF NOT EXISTS public.answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE NOT NULL,
  answer_text TEXT NOT NULL,
  selected_option INTEGER,
  is_correct BOOLEAN,
  score INTEGER,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_required INTEGER,
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student achievements junction table
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, achievement_id)
);

-- XP events table
CREATE TABLE IF NOT EXISTS public.xp_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notebook entries table
CREATE TABLE IF NOT EXISTS public.notebook_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('hypothesis', 'observation', 'note', 'conclusion')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Class missions (teacher assigns missions to classes)
CREATE TABLE IF NOT EXISTS public.class_missions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  UNIQUE(class_id, mission_id)
);

-- Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notebook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_missions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can manage profiles" ON public.profiles FOR ALL USING (auth.role() = 'service_role');

-- Missions policies (public read for published)
CREATE POLICY "Anyone can view published missions" ON public.missions FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Teachers can manage own missions" ON public.missions FOR ALL USING (auth.uid() = created_by);

-- Mission progress policies
CREATE POLICY "Students can view own progress" ON public.mission_progress FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "Students can insert own progress" ON public.mission_progress FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);
CREATE POLICY "Students can update own progress" ON public.mission_progress FOR UPDATE USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);

-- Achievements policies
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (TRUE);

-- Student achievements policies
CREATE POLICY "Students can view own achievements" ON public.student_achievements FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);

-- Evidence policies
CREATE POLICY "Anyone can view evidence for published missions" ON public.evidence FOR SELECT USING (
  mission_id IN (SELECT id FROM public.missions WHERE is_published = TRUE)
);

-- Questions policies
CREATE POLICY "Anyone can view questions for published missions" ON public.questions FOR SELECT USING (
  mission_id IN (SELECT id FROM public.missions WHERE is_published = TRUE)
);

-- Notebook entries policies
CREATE POLICY "Students can manage own notebook entries" ON public.notebook_entries FOR ALL USING (
  student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
