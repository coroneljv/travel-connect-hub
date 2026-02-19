-- ============================================================
-- 003_extend_existing_tables.sql
-- Adiciona colunas novas + soft delete nas tabelas existentes
-- + Helper functions para RLS
-- ============================================================

-- ===================== HELPER FUNCTIONS =====================

-- current_profile_id(): Retorna o profile.id do usuario logado.
-- profiles.id = auth.users.id por design (trigger handle_new_user).
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid()
$$;

-- current_org_id(): Retorna o organization_id do usuario logado.
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS UUID
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

-- is_admin(): Retorna true se o usuario logado tem role 'admin'.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
$$;

-- ===================== ALTER TABLES =====================

-- ---- organizations ----
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN public.organizations.type IS 'ONG, Familia, Hostel, Hotel, Fazenda, Escola, Empresa';

-- ---- profiles ----
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS travel_style TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS passport_country TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ---- requests ----
ALTER TABLE public.requests
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ---- proposals ----
ALTER TABLE public.proposals
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---- messages ----
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ===================== FIX EXISTING POLICIES (001/002) =====================

-- ---- organizations ----
DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;
CREATE POLICY "Admins can manage organizations"
  ON public.organizations FOR ALL TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Users can update their own organization" ON public.organizations;
CREATE POLICY "Users can update their own organization"
  ON public.organizations FOR UPDATE TO authenticated
  USING (id = public.current_org_id());

DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;
CREATE POLICY "Users without org can create one"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (public.current_org_id() IS NULL);

DROP POLICY IF EXISTS "Anyone authenticated can view organizations" ON public.organizations;
CREATE POLICY "Anyone authenticated can view organizations"
  ON public.organizations FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- ---- profiles ----
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = public.current_profile_id());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = public.current_profile_id());

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- ---- user_roles ----
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin());

-- ---- requests ----
DROP POLICY IF EXISTS "Buyers can create requests for their org" ON public.requests;
CREATE POLICY "Buyers can create requests for their org"
  ON public.requests FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.current_org_id()
    AND public.has_role(auth.uid(), 'buyer')
  );

DROP POLICY IF EXISTS "Buyers can update their org requests" ON public.requests;
CREATE POLICY "Buyers can update their org requests"
  ON public.requests FOR UPDATE TO authenticated
  USING (
    organization_id = public.current_org_id()
    AND public.has_role(auth.uid(), 'buyer')
  );

DROP POLICY IF EXISTS "Admins can manage all requests" ON public.requests;
CREATE POLICY "Admins can manage all requests"
  ON public.requests FOR ALL TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can view open requests" ON public.requests;
CREATE POLICY "Authenticated users can view open requests"
  ON public.requests FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- ---- proposals ----
DROP POLICY IF EXISTS "Request owner and proposal supplier can view proposals" ON public.proposals;
CREATE POLICY "Request owner and proposal supplier can view proposals"
  ON public.proposals FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      supplier_org_id = public.current_org_id()
      OR request_id IN (
        SELECT id FROM public.requests
        WHERE organization_id = public.current_org_id()
      )
    )
  );

DROP POLICY IF EXISTS "Suppliers can create proposals" ON public.proposals;
CREATE POLICY "Suppliers can create proposals"
  ON public.proposals FOR INSERT TO authenticated
  WITH CHECK (
    supplier_org_id = public.current_org_id()
    AND public.has_role(auth.uid(), 'supplier')
  );

DROP POLICY IF EXISTS "Suppliers can update their proposals" ON public.proposals;
CREATE POLICY "Suppliers can update their proposals"
  ON public.proposals FOR UPDATE TO authenticated
  USING (supplier_org_id = public.current_org_id());

DROP POLICY IF EXISTS "Admins can manage all proposals" ON public.proposals;
CREATE POLICY "Admins can manage all proposals"
  ON public.proposals FOR ALL TO authenticated
  USING (public.is_admin());

-- ---- messages ----
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND request_id IN (
      SELECT id FROM public.requests
      WHERE organization_id = public.current_org_id()
      UNION
      SELECT request_id FROM public.proposals
      WHERE supplier_org_id = public.current_org_id()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can send messages on their requests" ON public.messages;
CREATE POLICY "Authenticated users can send messages on their requests"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_profile_id = public.current_profile_id());

DROP POLICY IF EXISTS "Admins can manage all messages" ON public.messages;
CREATE POLICY "Admins can manage all messages"
  ON public.messages FOR ALL TO authenticated
  USING (public.is_admin());
