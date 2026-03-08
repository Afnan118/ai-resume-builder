-- Create Resumes Table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    generated_resume_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup Row Level Security (RLS)
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Allow users to view their own resumes
CREATE POLICY "Users can view their own resumes"
ON public.resumes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to insert their own resumes
CREATE POLICY "Users can insert their own resumes"
ON public.resumes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own resumes
CREATE POLICY "Users can update their own resumes"
ON public.resumes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own resumes
CREATE POLICY "Users can delete their own resumes"
ON public.resumes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
