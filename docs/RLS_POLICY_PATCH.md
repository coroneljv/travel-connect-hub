# TravelConnect — RLS Policy Patch

> **Data:** 2026-02-19
> **Problema:** Mismatch entre `auth.uid()` (retorna `auth.users.id`) e colunas que referenciam `profiles(id)`.
> Apesar de `profiles.id = auth.users.id` por design (trigger `handle_new_user`), usar `auth.uid()` diretamente
> em colunas FK-to-profiles e semanticamente incorreto e fragil.

---

## 1. HELPER FUNCTIONS

> Adicionar ao inicio da migration 003 (antes de qualquer policy).

```sql
-- ============================================================
-- HELPER FUNCTIONS (parameterless, usam auth.uid() internamente)
-- ============================================================

-- current_profile_id(): Retorna o profile.id do usuario logado.
-- Como profiles.id = auth.users.id por design, equivale a auth.uid().
-- Usar este helper quando a coluna tem FK para profiles(id).
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid()
$$;

-- current_org_id(): Retorna o organization_id do usuario logado.
-- Substitui o padrao verboso get_user_org_id(auth.uid()).
CREATE OR REPLACE FUNCTION public.current_org_id()
RETURNS UUID
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid()
$$;

-- is_admin(): Retorna true se o usuario logado tem role 'admin'.
-- Substitui o padrao has_role(auth.uid(), 'admin').
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
```

> **Nota:** `get_user_org_id()` e `has_role()` continuam existindo para chamadas com parametro
> explicito (ex: triggers, edge functions). Os novos helpers sao para uso em policies.

---

## 2. PATCH PARA POLICIES JA APLICADAS (001 + 002)

> Estas policies ja estao no banco. Criar uma **nova migration** (ex: `014_fix_rls_helpers.sql`)
> com os DROP + CREATE abaixo. Executar **DEPOIS** que os helpers da secao 1 existirem.

```sql
-- ============================================================
-- 014_fix_rls_helpers.sql
-- Corrige policies existentes para usar helpers
-- ============================================================

-- ===================== ORGANIZATIONS =====================

-- Admin
DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;
CREATE POLICY "Admins can manage organizations"
  ON public.organizations FOR ALL TO authenticated
  USING (public.is_admin());

-- Update own org
DROP POLICY IF EXISTS "Users can update their own organization" ON public.organizations;
CREATE POLICY "Users can update their own organization"
  ON public.organizations FOR UPDATE TO authenticated
  USING (id = public.current_org_id());

-- Insert (from migration 002)
DROP POLICY IF EXISTS "Users without org can create one" ON public.organizations;
CREATE POLICY "Users without org can create one"
  ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (public.current_org_id() IS NULL);

-- ===================== PROFILES =====================

-- Update own profile (id FKs to profiles.id via PK)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = public.current_profile_id());

-- Insert own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = public.current_profile_id());

-- ===================== USER_ROLES =====================

-- Admin
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.is_admin());

-- Nota: "Users can view own roles" e "Users can insert own role on signup"
-- usam user_id = auth.uid(). user_id FK -> auth.users(id). CORRETO, sem alteracao.

-- ===================== REQUESTS =====================

-- Insert buyer
DROP POLICY IF EXISTS "Buyers can create requests for their org" ON public.requests;
CREATE POLICY "Buyers can create requests for their org"
  ON public.requests FOR INSERT TO authenticated
  WITH CHECK (
    organization_id = public.current_org_id()
    AND public.has_role(auth.uid(), 'buyer')
  );

-- Update buyer
DROP POLICY IF EXISTS "Buyers can update their org requests" ON public.requests;
CREATE POLICY "Buyers can update their org requests"
  ON public.requests FOR UPDATE TO authenticated
  USING (
    organization_id = public.current_org_id()
    AND public.has_role(auth.uid(), 'buyer')
  );

-- Admin
DROP POLICY IF EXISTS "Admins can manage all requests" ON public.requests;
CREATE POLICY "Admins can manage all requests"
  ON public.requests FOR ALL TO authenticated
  USING (public.is_admin());

-- ===================== PROPOSALS =====================

-- Insert supplier
DROP POLICY IF EXISTS "Suppliers can create proposals" ON public.proposals;
CREATE POLICY "Suppliers can create proposals"
  ON public.proposals FOR INSERT TO authenticated
  WITH CHECK (
    supplier_org_id = public.current_org_id()
    AND public.has_role(auth.uid(), 'supplier')
  );

-- Update supplier
DROP POLICY IF EXISTS "Suppliers can update their proposals" ON public.proposals;
CREATE POLICY "Suppliers can update their proposals"
  ON public.proposals FOR UPDATE TO authenticated
  USING (supplier_org_id = public.current_org_id());

-- Admin
DROP POLICY IF EXISTS "Admins can manage all proposals" ON public.proposals;
CREATE POLICY "Admins can manage all proposals"
  ON public.proposals FOR ALL TO authenticated
  USING (public.is_admin());

-- ===================== MESSAGES =====================

-- Insert (sender_profile_id FK -> profiles.id — ERA O PRINCIPAL MISMATCH)
DROP POLICY IF EXISTS "Authenticated users can send messages on their requests" ON public.messages;
CREATE POLICY "Authenticated users can send messages on their requests"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (sender_profile_id = public.current_profile_id());

-- Admin
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.messages;
CREATE POLICY "Admins can manage all messages"
  ON public.messages FOR ALL TO authenticated
  USING (public.is_admin());
```

---

## 3. CORRECOES NAS MIGRATIONS PLANEJADAS (003–013)

> Para cada migration, mostro **apenas as policies que precisam de correcao**.
> Substituir o SQL correspondente no `DATABASE_MIGRATION_PLAN.md`.

### Migration 003 — Correcoes

```sql
-- proposals SELECT (soft-delete update) — current_org_id()
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

-- messages SELECT (soft-delete update) — current_org_id() + conversation EXISTS
-- REESCRITA COMPLETA: suporta messages via conversation E via request (legado)
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      -- Via conversation (novo, migration 004+)
      (conversation_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.conversation_participants
        WHERE conversation_id = messages.conversation_id
          AND profile_id = public.current_profile_id()
      ))
      OR
      -- Via request (legado, sem conversation_id)
      (conversation_id IS NULL AND request_id IN (
        SELECT id FROM public.requests
        WHERE organization_id = public.current_org_id()
        UNION
        SELECT request_id FROM public.proposals
        WHERE supplier_org_id = public.current_org_id()
      ))
    )
  );
```

> **Nota:** A policy de messages acima referencia `conversation_participants` que so existe
> apos migration 004. Mover esta policy para DEPOIS da 004, ou combinar 003+004 em uma unica migration.

### Migration 004 — Correcoes

```sql
-- Atualizar funcao helper: renomear parametro para clareza
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_profile_id UUID, _conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conversation_id AND profile_id = _profile_id
  )
$$;

-- conversations SELECT — current_profile_id()
DROP POLICY IF EXISTS "conversations_select" ON public.conversations;
CREATE POLICY "conversations_select"
  ON public.conversations FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = conversations.id
        AND profile_id = public.current_profile_id()
    )
  );

-- conversations INSERT — current_org_id()
DROP POLICY IF EXISTS "conversations_insert" ON public.conversations;
CREATE POLICY "conversations_insert"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.current_org_id());

-- conversations UPDATE — current_org_id()
DROP POLICY IF EXISTS "conversations_update" ON public.conversations;
CREATE POLICY "conversations_update"
  ON public.conversations FOR UPDATE TO authenticated
  USING (organization_id = public.current_org_id());

-- conv_participants SELECT — current_profile_id()
DROP POLICY IF EXISTS "conv_participants_select" ON public.conversation_participants;
CREATE POLICY "conv_participants_select"
  ON public.conversation_participants FOR SELECT TO authenticated
  USING (
    public.is_conversation_participant(public.current_profile_id(), conversation_id)
  );

-- conv_participants INSERT — current_org_id() + current_profile_id()
DROP POLICY IF EXISTS "conv_participants_insert" ON public.conversation_participants;
CREATE POLICY "conv_participants_insert"
  ON public.conversation_participants FOR INSERT TO authenticated
  WITH CHECK (
    -- Criador da conversa (dono da org) pode adicionar participantes
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE organization_id = public.current_org_id()
    )
    -- Ou o proprio usuario pode se adicionar (aceitar convite)
    OR profile_id = public.current_profile_id()
  );
```

### Migration 005 (Favorites) — Correcoes

```sql
-- favorites INSERT — current_org_id()
-- Nota: user_id FK -> auth.users(id), entao auth.uid() e correto para user_id
DROP POLICY IF EXISTS "favorites_insert" ON public.favorites;
CREATE POLICY "favorites_insert"
  ON public.favorites FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id = public.current_org_id()
  );

-- favorites SELECT e DELETE: usam user_id = auth.uid(). CORRETO (FK -> auth.users).
```

### Migration 006 (Reviews) — Correcoes

```sql
-- reviews INSERT — reviewer_id FK -> profiles(id) = MISMATCH
DROP POLICY IF EXISTS "reviews_insert" ON public.reviews;
CREATE POLICY "reviews_insert"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = public.current_profile_id()
    AND organization_id = public.current_org_id()
  );

-- reviews UPDATE — reviewer_id FK -> profiles(id) = MISMATCH
DROP POLICY IF EXISTS "reviews_update" ON public.reviews;
CREATE POLICY "reviews_update"
  ON public.reviews FOR UPDATE TO authenticated
  USING (reviewer_id = public.current_profile_id() AND deleted_at IS NULL);
```

### Migration 007 (Courses) — Correcoes

```sql
-- courses SELECT — creator_id FK -> profiles(id) = MISMATCH
DROP POLICY IF EXISTS "courses_select" ON public.courses;
CREATE POLICY "courses_select"
  ON public.courses FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND (status = 'published' OR creator_id = public.current_profile_id())
  );

-- courses INSERT — creator_id FK -> profiles(id) = MISMATCH
DROP POLICY IF EXISTS "courses_insert" ON public.courses;
CREATE POLICY "courses_insert"
  ON public.courses FOR INSERT TO authenticated
  WITH CHECK (
    creator_id = public.current_profile_id()
    AND organization_id = public.current_org_id()
  );

-- courses UPDATE — creator_id FK -> profiles(id) = MISMATCH
DROP POLICY IF EXISTS "courses_update" ON public.courses;
CREATE POLICY "courses_update"
  ON public.courses FOR UPDATE TO authenticated
  USING (creator_id = public.current_profile_id() AND deleted_at IS NULL);

-- course_modules INSERT — subquery usa creator_id = MISMATCH
DROP POLICY IF EXISTS "course_modules_insert" ON public.course_modules;
CREATE POLICY "course_modules_insert"
  ON public.course_modules FOR INSERT TO authenticated
  WITH CHECK (
    course_id IN (
      SELECT id FROM public.courses WHERE creator_id = public.current_profile_id()
    )
  );

-- course_modules UPDATE — subquery usa creator_id = MISMATCH
DROP POLICY IF EXISTS "course_modules_update" ON public.course_modules;
CREATE POLICY "course_modules_update"
  ON public.course_modules FOR UPDATE TO authenticated
  USING (
    course_id IN (
      SELECT id FROM public.courses WHERE creator_id = public.current_profile_id()
    )
    AND deleted_at IS NULL
  );

-- course_resources INSERT — subquery usa creator_id = MISMATCH
DROP POLICY IF EXISTS "course_resources_insert" ON public.course_resources;
CREATE POLICY "course_resources_insert"
  ON public.course_resources FOR INSERT TO authenticated
  WITH CHECK (
    course_id IN (
      SELECT id FROM public.courses WHERE creator_id = public.current_profile_id()
    )
  );

-- course_progress INSERT — current_org_id()
-- Nota: user_id FK -> auth.users(id), auth.uid() correto para user_id
DROP POLICY IF EXISTS "course_progress_upsert" ON public.course_progress;
CREATE POLICY "course_progress_upsert"
  ON public.course_progress FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id = public.current_org_id()
  );

-- course_progress SELECT e UPDATE: usam user_id = auth.uid(). CORRETO.
-- course_modules SELECT e course_resources SELECT: sem profile FK. CORRETO.
```

### Migration 008 (Community) — Correcoes

```sql
-- posts INSERT — author_id FK -> profiles(id) = MISMATCH
DROP POLICY IF EXISTS "posts_insert" ON public.posts;
CREATE POLICY "posts_insert"
  ON public.posts FOR INSERT TO authenticated
  WITH CHECK (
    author_id = public.current_profile_id()
    AND organization_id = public.current_org_id()
  );

-- posts UPDATE — author_id FK -> profiles(id) = MISMATCH
DROP POLICY IF EXISTS "posts_update" ON public.posts;
CREATE POLICY "posts_update"
  ON public.posts FOR UPDATE TO authenticated
  USING (author_id = public.current_profile_id() AND deleted_at IS NULL);

-- post_comments INSERT — author_id FK -> profiles(id) = MISMATCH
DROP POLICY IF EXISTS "post_comments_insert" ON public.post_comments;
CREATE POLICY "post_comments_insert"
  ON public.post_comments FOR INSERT TO authenticated
  WITH CHECK (
    author_id = public.current_profile_id()
    AND organization_id = public.current_org_id()
  );

-- post_likes INSERT — current_org_id()
-- Nota: user_id FK -> auth.users(id), auth.uid() correto para user_id
DROP POLICY IF EXISTS "post_likes_insert" ON public.post_likes;
CREATE POLICY "post_likes_insert"
  ON public.post_likes FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id = public.current_org_id()
  );

-- posts SELECT, post_comments SELECT, post_likes SELECT/DELETE: sem alteracao necessaria
```

### Migration 009 (Notifications) — Sem alteracao

> `notifications.user_id` FK -> `auth.users(id)`. Uso de `auth.uid()` esta **correto**.

### Migration 010 (Credit Ledger) — Sem alteracao

> `credit_transactions.user_id` FK -> `auth.users(id)`. Uso de `auth.uid()` esta **correto**.

### Migration 011 (Profile Extensions) — Correcoes

```sql
-- experiences INSERT — profile_id FK -> profiles(id) = MISMATCH
DROP POLICY IF EXISTS "experiences_insert" ON public.experiences;
CREATE POLICY "experiences_insert"
  ON public.experiences FOR INSERT TO authenticated
  WITH CHECK (
    profile_id = public.current_profile_id()
    AND organization_id = public.current_org_id()
  );

-- experiences UPDATE — profile_id FK -> profiles(id) = MISMATCH
DROP POLICY IF EXISTS "experiences_update" ON public.experiences;
CREATE POLICY "experiences_update"
  ON public.experiences FOR UPDATE TO authenticated
  USING (profile_id = public.current_profile_id() AND deleted_at IS NULL);

-- portfolio_items INSERT — profile_id FK -> profiles(id) = MISMATCH
DROP POLICY IF EXISTS "portfolio_items_insert" ON public.portfolio_items;
CREATE POLICY "portfolio_items_insert"
  ON public.portfolio_items FOR INSERT TO authenticated
  WITH CHECK (
    profile_id = public.current_profile_id()
    AND organization_id = public.current_org_id()
  );

-- portfolio_items UPDATE — profile_id FK -> profiles(id) = MISMATCH
DROP POLICY IF EXISTS "portfolio_items_update" ON public.portfolio_items;
CREATE POLICY "portfolio_items_update"
  ON public.portfolio_items FOR UPDATE TO authenticated
  USING (profile_id = public.current_profile_id() AND deleted_at IS NULL);

-- experiences SELECT e portfolio_items SELECT: sem profile FK check. CORRETO.
```

### Migrations 012, 013 — Sem alteracao

> 012 contem apenas indices. 013 contem storage policies que usam `auth.uid()::TEXT` para
> folder ownership — correto, pois storage e vinculado ao auth user, nao ao profile.

---

## 4. TABELAS AFETADAS E MOTIVO

| Tabela | Policies Corrigidas | Motivo Principal |
|--------|-------------------|-----------------|
| **organizations** | 3 (admin, update, insert) | `get_user_org_id(auth.uid())` → `current_org_id()`, `has_role(...)` → `is_admin()` |
| **profiles** | 2 (update, insert) | `id = auth.uid()` → `current_profile_id()` — id e PK/FK para profiles |
| **user_roles** | 1 (admin) | `has_role(...)` → `is_admin()` |
| **requests** | 3 (insert, update, admin) | `get_user_org_id(auth.uid())` → `current_org_id()`, admin helper |
| **proposals** | 4 (select, insert, update, admin) | `get_user_org_id(auth.uid())` → `current_org_id()`, admin helper |
| **messages** | 3 (select, insert, admin) | **MISMATCH CRITICO:** `sender_profile_id = auth.uid()` mas FK → `profiles(id)`. SELECT reescrito para conversation_participants EXISTS |
| **conversations** | 3 (select, insert, update) | `profile_id = auth.uid()` → `current_profile_id()`, org helper |
| **conversation_participants** | 2 (select, insert) | `profile_id = auth.uid()` → `current_profile_id()`, org helper |
| **favorites** | 1 (insert) | `get_user_org_id(auth.uid())` → `current_org_id()` |
| **reviews** | 2 (insert, update) | **MISMATCH:** `reviewer_id = auth.uid()` mas FK → `profiles(id)` |
| **courses** | 3 (select, insert, update) | **MISMATCH:** `creator_id = auth.uid()` mas FK → `profiles(id)` |
| **course_modules** | 2 (insert, update) | Subquery `creator_id = auth.uid()` — herda mismatch de courses |
| **course_resources** | 1 (insert) | Subquery `creator_id = auth.uid()` — herda mismatch de courses |
| **course_progress** | 1 (insert) | `get_user_org_id(auth.uid())` → `current_org_id()` |
| **posts** | 2 (insert, update) | **MISMATCH:** `author_id = auth.uid()` mas FK → `profiles(id)` |
| **post_comments** | 1 (insert) | **MISMATCH:** `author_id = auth.uid()` mas FK → `profiles(id)` |
| **post_likes** | 1 (insert) | `get_user_org_id(auth.uid())` → `current_org_id()` |
| **experiences** | 2 (insert, update) | **MISMATCH:** `profile_id = auth.uid()` mas FK → `profiles(id)` |
| **portfolio_items** | 2 (insert, update) | **MISMATCH:** `profile_id = auth.uid()` mas FK → `profiles(id)` |

### Tabelas SEM alteracao (e porque)

| Tabela | Motivo |
|--------|--------|
| **user_roles** (select, insert) | `user_id` FK → `auth.users(id)` — `auth.uid()` correto |
| **favorites** (select, delete) | `user_id` FK → `auth.users(id)` — correto |
| **notifications** | `user_id` FK → `auth.users(id)` — correto |
| **credit_packages** | SELECT publico, sem profile FK |
| **credit_transactions** | `user_id` FK → `auth.users(id)` — correto |
| **course_categories** | SELECT publico, sem profile FK |
| **course_progress** (select, update) | `user_id` FK → `auth.users(id)` — correto |
| **post_likes** (select, delete) | `user_id` FK → `auth.users(id)` — correto |
| **storage.objects** | Usa `auth.uid()::TEXT` para folder — correto |

---

## 5. RESUMO QUANTITATIVO

| Metrica | Valor |
|---------|-------|
| Helpers criados | 3 (`current_profile_id`, `current_org_id`, `is_admin`) |
| Funcoes atualizadas | 1 (`is_conversation_participant` — rename param) |
| Policies corrigidas | **40** |
| ↳ Mismatch profile FK | 19 (critico) |
| ↳ Simplificacao org helper | 14 |
| ↳ Simplificacao admin helper | 5 |
| ↳ Reescrita completa (messages SELECT) | 1 |
| ↳ Correcao conversation pattern | 1 |
| Tabelas afetadas | **19** de 23 |
| Tabelas sem alteracao | **4** (notifications, credit_*, course_categories) |

---

## 6. REGRA PARA NOVAS POLICIES

Ao criar qualquer policy nova, seguir estas regras:

| Coluna FK para... | Usar | Exemplo |
|-------------------|------|---------|
| `profiles(id)` | `public.current_profile_id()` | `author_id = public.current_profile_id()` |
| `auth.users(id)` | `auth.uid()` | `user_id = auth.uid()` |
| Org via profile | `public.current_org_id()` | `organization_id = public.current_org_id()` |
| Role check (admin) | `public.is_admin()` | `USING (public.is_admin())` |
| Role check (buyer/supplier) | `public.has_role(auth.uid(), 'buyer')` | Manter parametrizado |
| Conversa participante | `EXISTS` em `conversation_participants` | Ver exemplo messages SELECT |
