
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('buyer', 'supplier', 'admin');

-- Organizations table
CREATE TABLE public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  description TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  tax_id TEXT,
  logo_url TEXT,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  position TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Requests table
CREATE TABLE public.requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  budget_min NUMERIC,
  budget_max NUMERIC,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'matching', 'closed')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Proposals table
CREATE TABLE public.proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  supplier_org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  supplier_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message TEXT,
  price_estimate NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Messages table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  sender_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper function to get user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_org_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = _user_id
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== RLS Policies ==========

-- Organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view organizations" ON public.organizations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage organizations" ON public.organizations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update their own organization" ON public.organizations FOR UPDATE TO authenticated USING (id = public.get_user_org_id(auth.uid()));
CREATE POLICY "Anyone can insert organizations (registration)" ON public.organizations FOR INSERT TO authenticated WITH CHECK (true);

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- User Roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own role on signup" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Requests
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view open requests" ON public.requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Buyers can create requests for their org" ON public.requests FOR INSERT TO authenticated WITH CHECK (
  organization_id = public.get_user_org_id(auth.uid()) AND public.has_role(auth.uid(), 'buyer')
);
CREATE POLICY "Buyers can update their org requests" ON public.requests FOR UPDATE TO authenticated USING (
  organization_id = public.get_user_org_id(auth.uid()) AND public.has_role(auth.uid(), 'buyer')
);
CREATE POLICY "Admins can manage all requests" ON public.requests FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Proposals
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Request owner and proposal supplier can view proposals" ON public.proposals FOR SELECT TO authenticated USING (
  supplier_org_id = public.get_user_org_id(auth.uid())
  OR request_id IN (SELECT id FROM public.requests WHERE organization_id = public.get_user_org_id(auth.uid()))
);
CREATE POLICY "Suppliers can create proposals" ON public.proposals FOR INSERT TO authenticated WITH CHECK (
  supplier_org_id = public.get_user_org_id(auth.uid()) AND public.has_role(auth.uid(), 'supplier')
);
CREATE POLICY "Suppliers can update their proposals" ON public.proposals FOR UPDATE TO authenticated USING (
  supplier_org_id = public.get_user_org_id(auth.uid())
);
CREATE POLICY "Admins can manage all proposals" ON public.proposals FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view messages" ON public.messages FOR SELECT TO authenticated USING (
  request_id IN (
    SELECT id FROM public.requests WHERE organization_id = public.get_user_org_id(auth.uid())
    UNION
    SELECT request_id FROM public.proposals WHERE supplier_org_id = public.get_user_org_id(auth.uid())
  )
);
CREATE POLICY "Authenticated users can send messages on their requests" ON public.messages FOR INSERT TO authenticated WITH CHECK (
  sender_profile_id = auth.uid()
);
CREATE POLICY "Admins can manage all messages" ON public.messages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
