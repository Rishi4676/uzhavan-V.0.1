-- -------------------------------------------------------------
-- SUPABASE SCHEMA & POLICIES SETUP
-- -------------------------------------------------------------

-- 1. Create health_check Table
CREATE TABLE IF NOT EXISTS public.health_check (
    id SERIAL PRIMARY KEY,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on health_check
ALTER TABLE public.health_check ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to prevent duplicates)
DROP POLICY IF EXISTS "Allow public read access on health_check" ON public.health_check;
DROP POLICY IF EXISTS "Allow service role write access on health_check" ON public.health_check;

-- Create Policies for health_check
CREATE POLICY "Allow public read access on health_check" ON public.health_check
    FOR SELECT USING (true);

CREATE POLICY "Allow service role write access on health_check" ON public.health_check
    FOR ALL USING (true) WITH CHECK (true);

-- Insert one sample row into health_check
INSERT INTO public.health_check (status) 
VALUES ('ok')
ON CONFLICT DO NOTHING;


-- 2. Create User Profiles Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    username TEXT UNIQUE,
    phone_number TEXT,
    village_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert own profile" ON public.profiles;

-- Create Policies for profiles
CREATE POLICY "Allow public read profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow users to insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);


-- 3. Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, phone_number, village_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'phone_number', ''),
    COALESCE(new.raw_user_meta_data->>'village_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 4. Create Forum Posts Table
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on forum_posts
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to prevent duplicates)
DROP POLICY IF EXISTS "Allow users to view own posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Allow users to insert own posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Allow users to update own posts" ON public.forum_posts;
DROP POLICY IF EXISTS "Allow users to delete own posts" ON public.forum_posts;

-- Create Policies (Only User A can see theirs, User B can see theirs)
CREATE POLICY "Allow users to view own posts" ON public.forum_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert own posts" ON public.forum_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own posts" ON public.forum_posts
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own posts" ON public.forum_posts
    FOR DELETE USING (auth.uid() = user_id);


-- 5. Create Forum Comments Table
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
    author TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on forum_comments
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to prevent duplicates)
DROP POLICY IF EXISTS "Allow users to view comments on posts they have access to" ON public.forum_comments;
DROP POLICY IF EXISTS "Allow users to insert own comments" ON public.forum_comments;

-- Create Policies
-- Users can view comments on posts they own (or comments they made)
CREATE POLICY "Allow users to view comments on posts they have access to" ON public.forum_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.forum_posts 
            WHERE forum_posts.id = forum_comments.post_id
        )
    );

CREATE POLICY "Allow users to insert own comments" ON public.forum_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 6. Storage Setup for Post Images
-- Enable public bucket named 'forum-images'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('forum-images', 'forum-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop storage policies if they exist
DROP POLICY IF EXISTS "Allow public read of forum-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload of forum-images" ON storage.objects;

-- Create storage policies
CREATE POLICY "Allow public read of forum-images" ON storage.objects
    FOR SELECT USING (bucket_id = 'forum-images');

CREATE POLICY "Allow public upload of forum-images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'forum-images');


-- 7. Realtime Enablement
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_comments;


