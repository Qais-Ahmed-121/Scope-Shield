-- Supabase Database Schema for Scope-Shield

-- 1. Create Tables

-- Profiles Table (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  avatar_url TEXT,
  last_analyzed TIMESTAMP WITH TIME ZONE
);

-- Contracts Table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content_text TEXT,
  risk_score INTEGER,
  status TEXT DEFAULT 'pending', -- 'pending', 'analyzing', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Extracted Tasks Table
CREATE TABLE IF NOT EXISTS public.extracted_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  deadline TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Risk Alerts Table
CREATE TABLE IF NOT EXISTS public.risk_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  risk_type TEXT NOT NULL, -- e.g., 'scope_creep', 'payment_terms', 'liability'
  description TEXT NOT NULL,
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  resolved BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_alerts ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Contracts: Users can CRUD their own contracts
CREATE POLICY "Users can view own contracts" 
ON public.contracts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own contracts" 
ON public.contracts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own contracts" 
ON public.contracts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own contracts" 
ON public.contracts FOR DELETE 
USING (auth.uid() = user_id);

-- Extracted Tasks: Users can CRUD their own tasks
CREATE POLICY "Users can view own tasks" 
ON public.extracted_tasks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" 
ON public.extracted_tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" 
ON public.extracted_tasks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" 
ON public.extracted_tasks FOR DELETE 
USING (auth.uid() = user_id);

-- Risk Alerts: Users can CRUD their own alerts
CREATE POLICY "Users can view own risk alerts" 
ON public.risk_alerts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own risk alerts" 
ON public.risk_alerts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own risk alerts" 
ON public.risk_alerts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own risk alerts" 
ON public.risk_alerts FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create Function and Trigger to automatically create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
