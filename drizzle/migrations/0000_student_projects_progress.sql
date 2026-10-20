CREATE TABLE public.student_progress (user_id uuid PRIMARY KEY, data jsonb NOT NULL DEFAULT '{}'::jsonb, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.student_progress TO authenticated; GRANT ALL ON public.student_progress TO service_role;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own progress" ON public.student_progress FOR ALL TO authenticated USING(auth.uid()=user_id) WITH CHECK(auth.uid()=user_id);
CREATE TABLE public.projects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, title text NOT NULL, kind text NOT NULL, content jsonb NOT NULL DEFAULT '{}'::jsonb, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE,DELETE ON public.projects TO authenticated; GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own projects" ON public.projects FOR ALL TO authenticated USING(auth.uid()=user_id) WITH CHECK(auth.uid()=user_id);