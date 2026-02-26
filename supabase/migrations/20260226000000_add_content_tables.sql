-- ============================================================
-- 005_add_content_tables.sql
-- New tables: community_posts, post_likes, post_comments,
--             courses, course_modules, course_lessons, reviews
-- Extend: requests with opportunity-specific columns
-- Storage: uploads bucket
-- ============================================================

-- ===================== EXTEND REQUESTS =====================

ALTER TABLE public.requests
  ALTER COLUMN destination DROP NOT NULL;

ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS opportunity_type TEXT,
  ADD COLUMN IF NOT EXISTS task_description TEXT,
  ADD COLUMN IF NOT EXISTS hours_per_day INTEGER,
  ADD COLUMN IF NOT EXISTS days_per_week INTEGER,
  ADD COLUMN IF NOT EXISTS duration_min TEXT,
  ADD COLUMN IF NOT EXISTS duration_max TEXT,
  ADD COLUMN IF NOT EXISTS preferred_start_date DATE,
  ADD COLUMN IF NOT EXISTS flexible_start_date DATE,
  ADD COLUMN IF NOT EXISTS accommodation_type TEXT,
  ADD COLUMN IF NOT EXISTS meals TEXT[],
  ADD COLUMN IF NOT EXISTS amenities TEXT[],
  ADD COLUMN IF NOT EXISTS house_rules TEXT,
  ADD COLUMN IF NOT EXISTS required_skills TEXT[],
  ADD COLUMN IF NOT EXISTS photos TEXT[];

-- ===================== COMMUNITY POSTS =====================

CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  location TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone authenticated can view posts"
  ON public.community_posts FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Users can create posts"
  ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (author_id = public.current_profile_id());

CREATE POLICY "Users can update own posts"
  ON public.community_posts FOR UPDATE TO authenticated
  USING (author_id = public.current_profile_id());

CREATE POLICY "Users can delete own posts"
  ON public.community_posts FOR DELETE TO authenticated
  USING (author_id = public.current_profile_id());

-- ===================== POST LIKES =====================

CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON public.post_likes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can like posts"
  ON public.post_likes FOR INSERT TO authenticated
  WITH CHECK (user_id = public.current_profile_id());

CREATE POLICY "Users can unlike posts"
  ON public.post_likes FOR DELETE TO authenticated
  USING (user_id = public.current_profile_id());

-- ===================== POST COMMENTS =====================

CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
  ON public.post_comments FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Users can create comments"
  ON public.post_comments FOR INSERT TO authenticated
  WITH CHECK (author_id = public.current_profile_id());

CREATE POLICY "Users can delete own comments"
  ON public.post_comments FOR DELETE TO authenticated
  USING (author_id = public.current_profile_id());

-- ===================== COURSES =====================

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  category TEXT,
  subcategory TEXT,
  language TEXT DEFAULT 'Português',
  level TEXT,
  cover_image_url TEXT,
  objectives TEXT[],
  prerequisites TEXT[],
  target_audience TEXT,
  pricing_type TEXT DEFAULT 'free',
  currency TEXT DEFAULT 'BRL',
  price NUMERIC DEFAULT 0,
  instructor_name TEXT,
  instructor_bio TEXT,
  instructor_photo_url TEXT,
  instructor_linkedin TEXT,
  instructor_instagram TEXT,
  instructor_website TEXT,
  quiz_data JSONB,
  support_material_urls TEXT[],
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone authenticated can view courses"
  ON public.courses FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Users can create courses"
  ON public.courses FOR INSERT TO authenticated
  WITH CHECK (created_by = public.current_profile_id());

CREATE POLICY "Users can update own courses"
  ON public.courses FOR UPDATE TO authenticated
  USING (created_by = public.current_profile_id());

-- ===================== COURSE MODULES =====================

CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view modules"
  ON public.course_modules FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Course owner can manage modules"
  ON public.course_modules FOR ALL TO authenticated
  USING (
    course_id IN (SELECT id FROM public.courses WHERE created_by = public.current_profile_id())
  );

-- ===================== COURSE LESSONS =====================

CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'video',
  video_url TEXT,
  material_url TEXT,
  duration_minutes INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view lessons"
  ON public.course_lessons FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Course owner can manage lessons"
  ON public.course_lessons FOR ALL TO authenticated
  USING (
    module_id IN (
      SELECT cm.id FROM public.course_modules cm
      JOIN public.courses c ON c.id = cm.course_id
      WHERE c.created_by = public.current_profile_id()
    )
  );

-- ===================== REVIEWS =====================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reviewed_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  request_id UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  overall_rating NUMERIC NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  reliability_rating NUMERIC CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  quality_rating NUMERIC CHECK (quality_rating >= 1 AND quality_rating <= 5),
  communication_rating NUMERIC CHECK (communication_rating >= 1 AND communication_rating <= 5),
  proactivity_rating NUMERIC CHECK (proactivity_rating >= 1 AND proactivity_rating <= 5),
  respect_rating NUMERIC CHECK (respect_rating >= 1 AND respect_rating <= 5),
  teamwork_rating NUMERIC CHECK (teamwork_rating >= 1 AND teamwork_rating <= 5),
  comment TEXT,
  would_accept_again BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view reviews"
  ON public.reviews FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (reviewer_id = public.current_profile_id());

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE TO authenticated
  USING (reviewer_id = public.current_profile_id());

-- ===================== STORAGE BUCKET =====================

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Users can update own uploads"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'uploads');

CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'uploads');
