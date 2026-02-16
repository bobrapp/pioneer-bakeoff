
-- Create bakeoff status enum
CREATE TYPE public.bakeoff_status AS ENUM ('pending', 'running', 'completed', 'failed');

-- Create bakeoffs table
CREATE TABLE public.bakeoffs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Untitled Bake-off',
  status public.bakeoff_status NOT NULL DEFAULT 'pending',
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bakeoffs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bakeoffs"
  ON public.bakeoffs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bakeoffs"
  ON public.bakeoffs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bakeoffs"
  ON public.bakeoffs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bakeoffs"
  ON public.bakeoffs FOR DELETE
  USING (auth.uid() = user_id);

-- Create results table
CREATE TABLE public.results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bakeoff_id UUID NOT NULL REFERENCES public.bakeoffs(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  criteria_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  overall_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  execution_time_ms INTEGER NOT NULL DEFAULT 0,
  raw_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Results visible if user owns the parent bakeoff
CREATE POLICY "Users can view results of their bakeoffs"
  ON public.results FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.bakeoffs WHERE bakeoffs.id = results.bakeoff_id AND bakeoffs.user_id = auth.uid())
  );

CREATE POLICY "Users can insert results for their bakeoffs"
  ON public.results FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.bakeoffs WHERE bakeoffs.id = results.bakeoff_id AND bakeoffs.user_id = auth.uid())
  );

-- Create agents table (public read, admin write)
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_version TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  api_endpoint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active agents"
  ON public.agents FOR SELECT
  USING (true);
