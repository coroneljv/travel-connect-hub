
-- Tighten the organizations insert policy: users can only insert if they don't already belong to an org
DROP POLICY "Anyone can insert organizations (registration)" ON public.organizations;
CREATE POLICY "Users without org can create one" ON public.organizations FOR INSERT TO authenticated 
  WITH CHECK (public.get_user_org_id(auth.uid()) IS NULL);
