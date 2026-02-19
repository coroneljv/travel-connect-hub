# TravelConnect — Plano de Migrations (Auditado)

> **Data:** 2026-02-19
> **Base:** 2 migrations existentes (6 tabelas, 21 RLS policies, 4 functions, 4 triggers)
> **Objetivo:** Expandir para ~24 tabelas sem quebrar compatibilidade

---

## AUDITORIA DO MODELO PROPOSTO (FIGMA_COVERAGE_MAP.md)

### Problemas encontrados

| # | Problema | Severidade | Correcao |
|---|---------|-----------|---------|
| 1 | Tabelas de dominio sem `organization_id` (favorites, posts, notifications, etc.) | **CRITICO** | Adicionar `organization_id NOT NULL` em toda tabela de dominio |
| 2 | `messages` acoplada diretamente a `requests` — sem entidade `conversations` | **ALTO** | Criar `conversations` + `conversation_participants`; adicionar `conversation_id` em messages |
| 3 | Sistema de creditos com `user_credits.balance` — saldo mutavel, sem audit trail | **ALTO** | Substituir por ledger: `credit_transactions` com `running_balance` calculado por trigger |
| 4 | Nenhuma tabela tem `deleted_at` — hard delete expoe a perda de dados | **MEDIO** | Adicionar `deleted_at TIMESTAMPTZ` em toda tabela de dominio |
| 5 | `proposals` sem `updated_at` | **BAIXO** | Adicionar coluna + trigger |
| 6 | Indices de listagem propostos sao simples — falta `(organization_id, created_at DESC)` | **MEDIO** | Padronizar indices compostos multi-tenant |
| 7 | `course_reviews` duplica conceito de `reviews` | **BAIXO** | Manter `reviews` com `target_type` generico — cobre cursos, anfitrioes, viajantes |
| 8 | Admin policies `FOR ALL` redundam com policies especificas | **BAIXO** | Unificar: admin via funcao helper, nao via policy duplicada |

---

## LISTA FINAL DE TABELAS

### Existentes (manter + estender)

| Tabela | Alteracoes |
|--------|-----------|
| `organizations` | +type, +address, +city, +state, +postal_code, +deleted_at |
| `profiles` | +bio, +travel_style, +date_of_birth, +nationality, +passport_country, +phone, +deleted_at |
| `user_roles` | sem alteracao (tabela de sistema, sem soft delete) |
| `requests` | +deleted_at |
| `proposals` | +updated_at, +deleted_at |
| `messages` | +conversation_id (FK nullable para retrocompat), +deleted_at |

### Novas — Core (MVP)

| Tabela | Dominio | Multi-tenant |
|--------|---------|-------------|
| `conversations` | Chat | organization_id (org do criador) |
| `conversation_participants` | Chat | conversation_id (herda) |
| `favorites` | Oportunidades | organization_id (org do user) |
| `reviews` | Avaliacoes | organization_id (org do reviewer) |

### Novas — Fase 2

| Tabela | Dominio | Multi-tenant |
|--------|---------|-------------|
| `courses` | Academy | organization_id (org do criador) |
| `course_categories` | Academy | — (tabela de referencia) |
| `course_modules` | Academy | course_id (herda org) |
| `course_resources` | Academy | course_id (herda org) |
| `course_progress` | Academy | organization_id (org do user) |
| `posts` | Comunidade | organization_id (org do autor) |
| `post_comments` | Comunidade | organization_id (org do autor) |
| `post_likes` | Comunidade | organization_id (org do user) |
| `notifications` | Sistema | organization_id (org do destinatario) |
| `credit_packages` | Creditos | — (tabela de referencia) |
| `credit_transactions` | Creditos | organization_id (org do user) |
| `experiences` | Perfil | organization_id (org do profile) |
| `portfolio_items` | Perfil | organization_id (org do profile) |

**Total: 6 existentes + 17 novas = 23 tabelas**

---

## ESTRUTURA SQL COMPLETA

### Migration 003: Estender tabelas existentes

```sql
-- ============================================================
-- 003_extend_existing_tables.sql
-- Adiciona colunas novas + soft delete nas tabelas existentes
-- ============================================================

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
-- conversation_id sera adicionado na migration 004

-- ---- Atualizar RLS existentes para respeitar soft delete ----

-- organizations: adicionar filtro deleted_at IS NULL no SELECT
DROP POLICY IF EXISTS "Anyone authenticated can view organizations" ON public.organizations;
CREATE POLICY "Anyone authenticated can view organizations"
  ON public.organizations FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- profiles: idem
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- requests: idem
DROP POLICY IF EXISTS "Authenticated users can view open requests" ON public.requests;
CREATE POLICY "Authenticated users can view open requests"
  ON public.requests FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- proposals: idem
DROP POLICY IF EXISTS "Request owner and proposal supplier can view proposals" ON public.proposals;
CREATE POLICY "Request owner and proposal supplier can view proposals"
  ON public.proposals FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND (
      supplier_org_id = public.get_user_org_id(auth.uid())
      OR request_id IN (
        SELECT id FROM public.requests
        WHERE organization_id = public.get_user_org_id(auth.uid())
      )
    )
  );

-- messages: idem
DROP POLICY IF EXISTS "Participants can view messages" ON public.messages;
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND request_id IN (
      SELECT id FROM public.requests
      WHERE organization_id = public.get_user_org_id(auth.uid())
      UNION
      SELECT request_id FROM public.proposals
      WHERE supplier_org_id = public.get_user_org_id(auth.uid())
    )
  );
```

### Migration 004: Sistema de Conversations

```sql
-- ============================================================
-- 004_add_conversations.sql
-- Chat: conversations + participants + link em messages
-- ============================================================

CREATE TABLE public.conversations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  request_id  UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  title       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at  TIMESTAMPTZ
);

CREATE TABLE public.conversation_participants (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_read_at    TIMESTAMPTZ,
  UNIQUE (conversation_id, profile_id)
);

-- Adicionar conversation_id em messages (nullable para retrocompat)
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Trigger updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: verificar se usuario participa da conversa
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_user_id UUID, _conversation_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = _conversation_id AND profile_id = _user_id
  )
$$;

-- ---- RLS: conversations ----
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select"
  ON public.conversations FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND id IN (
      SELECT conversation_id FROM public.conversation_participants
      WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "conversations_insert"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (organization_id = public.get_user_org_id(auth.uid()));

CREATE POLICY "conversations_update"
  ON public.conversations FOR UPDATE TO authenticated
  USING (organization_id = public.get_user_org_id(auth.uid()));

-- ---- RLS: conversation_participants ----
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conv_participants_select"
  ON public.conversation_participants FOR SELECT TO authenticated
  USING (
    public.is_conversation_participant(auth.uid(), conversation_id)
  );

CREATE POLICY "conv_participants_insert"
  ON public.conversation_participants FOR INSERT TO authenticated
  WITH CHECK (
    -- Criador da conversa (dono da org) pode adicionar participantes
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE organization_id = public.get_user_org_id(auth.uid())
    )
    -- Ou o proprio usuario pode se adicionar (aceitar convite)
    OR profile_id = auth.uid()
  );

-- ---- Indices ----
CREATE INDEX idx_conversations_org_created
  ON public.conversations (organization_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_conversation_participants_profile
  ON public.conversation_participants (profile_id);

CREATE INDEX idx_conversation_participants_conversation
  ON public.conversation_participants (conversation_id);

CREATE INDEX idx_messages_conversation
  ON public.messages (conversation_id, created_at DESC)
  WHERE deleted_at IS NULL;
```

### Migration 005: Favorites

```sql
-- ============================================================
-- 005_add_favorites.sql
-- ============================================================

CREATE TABLE public.favorites (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  request_id      UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at      TIMESTAMPTZ,
  UNIQUE (user_id, request_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_select"
  ON public.favorites FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND user_id = auth.uid());

CREATE POLICY "favorites_insert"
  ON public.favorites FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id = public.get_user_org_id(auth.uid())
  );

CREATE POLICY "favorites_delete"
  ON public.favorites FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_favorites_user_created
  ON public.favorites (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_favorites_org_created
  ON public.favorites (organization_id, created_at DESC)
  WHERE deleted_at IS NULL;
```

### Migration 006: Reviews

```sql
-- ============================================================
-- 006_add_reviews.sql
-- Generico: cobre anfitrioes, viajantes E cursos (target_type)
-- ============================================================

CREATE TYPE public.review_target_type AS ENUM ('profile', 'organization', 'course');

CREATE TABLE public.reviews (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  target_id       UUID NOT NULL,
  target_type     public.review_target_type NOT NULL,
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  request_id      UUID REFERENCES public.requests(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at      TIMESTAMPTZ,
  UNIQUE (reviewer_id, target_id, target_type, request_id)
);

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select"
  ON public.reviews FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "reviews_insert"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid()
    AND organization_id = public.get_user_org_id(auth.uid())
  );

CREATE POLICY "reviews_update"
  ON public.reviews FOR UPDATE TO authenticated
  USING (reviewer_id = auth.uid() AND deleted_at IS NULL);

CREATE INDEX idx_reviews_target
  ON public.reviews (target_id, target_type, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_reviews_org_created
  ON public.reviews (organization_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_reviews_request
  ON public.reviews (request_id)
  WHERE request_id IS NOT NULL AND deleted_at IS NULL;
```

### Migration 007: Academy (Courses)

```sql
-- ============================================================
-- 007_add_courses_system.sql
-- ============================================================

-- ---- Categorias (referencia, sem org, sem soft delete) ----
CREATE TABLE public.course_categories (
  id    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name  TEXT NOT NULL,
  slug  TEXT NOT NULL UNIQUE,
  icon  TEXT
);

-- ---- Courses ----
CREATE TABLE public.courses (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  creator_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES public.course_categories(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  price_cents     INTEGER DEFAULT 0 NOT NULL,
  thumbnail_url   TEXT,
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at      TIMESTAMPTZ
);

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---- Modules ----
CREATE TABLE public.course_modules (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id        UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  video_url        TEXT,
  duration_seconds INTEGER DEFAULT 0,
  content          TEXT,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at       TIMESTAMPTZ
);

CREATE TRIGGER update_course_modules_updated_at
  BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---- Resources ----
CREATE TABLE public.course_resources (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id  UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  file_url   TEXT NOT NULL,
  type       TEXT DEFAULT 'document' CHECK (type IN ('document', 'video', 'audio', 'link')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at TIMESTAMPTZ
);

-- ---- Progress ----
CREATE TABLE public.course_progress (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_id        UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  completed        BOOLEAN DEFAULT false NOT NULL,
  progress_percent SMALLINT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  last_watched_at  TIMESTAMPTZ,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, module_id)
);

-- ---- RLS ----
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "course_categories_select"
  ON public.course_categories FOR SELECT TO authenticated USING (true);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "courses_select"
  ON public.courses FOR SELECT TO authenticated
  USING (deleted_at IS NULL AND (status = 'published' OR creator_id = auth.uid()));

CREATE POLICY "courses_insert"
  ON public.courses FOR INSERT TO authenticated
  WITH CHECK (
    creator_id = auth.uid()
    AND organization_id = public.get_user_org_id(auth.uid())
  );

CREATE POLICY "courses_update"
  ON public.courses FOR UPDATE TO authenticated
  USING (creator_id = auth.uid() AND deleted_at IS NULL);

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_modules_select"
  ON public.course_modules FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND course_id IN (SELECT id FROM public.courses WHERE deleted_at IS NULL)
  );

CREATE POLICY "course_modules_insert"
  ON public.course_modules FOR INSERT TO authenticated
  WITH CHECK (
    course_id IN (
      SELECT id FROM public.courses WHERE creator_id = auth.uid()
    )
  );

CREATE POLICY "course_modules_update"
  ON public.course_modules FOR UPDATE TO authenticated
  USING (
    course_id IN (
      SELECT id FROM public.courses WHERE creator_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

ALTER TABLE public.course_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_resources_select"
  ON public.course_resources FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND course_id IN (SELECT id FROM public.courses WHERE deleted_at IS NULL)
  );

CREATE POLICY "course_resources_insert"
  ON public.course_resources FOR INSERT TO authenticated
  WITH CHECK (
    course_id IN (
      SELECT id FROM public.courses WHERE creator_id = auth.uid()
    )
  );

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "course_progress_select"
  ON public.course_progress FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "course_progress_upsert"
  ON public.course_progress FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id = public.get_user_org_id(auth.uid())
  );

CREATE POLICY "course_progress_update"
  ON public.course_progress FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- ---- Indices ----
CREATE INDEX idx_courses_org_created
  ON public.courses (organization_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_courses_status_created
  ON public.courses (status, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_courses_creator
  ON public.courses (creator_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_course_modules_course_order
  ON public.course_modules (course_id, sort_order)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_course_resources_course
  ON public.course_resources (course_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_course_progress_user
  ON public.course_progress (user_id);

CREATE INDEX idx_course_progress_org
  ON public.course_progress (organization_id);
```

### Migration 008: Comunidade

```sql
-- ============================================================
-- 008_add_community.sql
-- ============================================================

CREATE TABLE public.posts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  image_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at      TIMESTAMPTZ
);

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.post_comments (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id         UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE public.post_likes (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id         UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (post_id, user_id)
);

-- ---- RLS ----
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select"
  ON public.posts FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "posts_insert"
  ON public.posts FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND organization_id = public.get_user_org_id(auth.uid())
  );

CREATE POLICY "posts_update"
  ON public.posts FOR UPDATE TO authenticated
  USING (author_id = auth.uid() AND deleted_at IS NULL);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_comments_select"
  ON public.post_comments FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "post_comments_insert"
  ON public.post_comments FOR INSERT TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND organization_id = public.get_user_org_id(auth.uid())
  );

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_likes_select"
  ON public.post_likes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "post_likes_insert"
  ON public.post_likes FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND organization_id = public.get_user_org_id(auth.uid())
  );

CREATE POLICY "post_likes_delete"
  ON public.post_likes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ---- Indices ----
CREATE INDEX idx_posts_org_created
  ON public.posts (organization_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_posts_created
  ON public.posts (created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_posts_author
  ON public.posts (author_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_post_comments_post_created
  ON public.post_comments (post_id, created_at)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_post_likes_post
  ON public.post_likes (post_id);
```

### Migration 009: Notificacoes

```sql
-- ============================================================
-- 009_add_notifications.sql
-- ============================================================

CREATE TABLE public.notifications (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  read            BOOLEAN DEFAULT false NOT NULL,
  reference_id    UUID,
  reference_type  TEXT,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON COLUMN public.notifications.type IS 'proposal_received, proposal_accepted, message_new, review_received, etc.';
COMMENT ON COLUMN public.notifications.reference_type IS 'request, proposal, conversation, course, review, post';

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Insert feito via trigger/edge function, nao pelo client direto
-- Se necessario, adicionar policy de insert para service_role

-- ---- Indices ----
CREATE INDEX idx_notifications_user_unread
  ON public.notifications (user_id, read, created_at DESC);

CREATE INDEX idx_notifications_org_created
  ON public.notifications (organization_id, created_at DESC);
```

### Migration 010: Credit Ledger

```sql
-- ============================================================
-- 010_add_credit_ledger.sql
-- Padrao ledger: saldo = running_balance da ultima transacao
-- ============================================================

-- ---- Pacotes (referencia) ----
CREATE TABLE public.credit_packages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL,
  credits     INTEGER NOT NULL CHECK (credits > 0),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  role_target public.app_role,
  active      BOOLEAN DEFAULT true NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON COLUMN public.credit_packages.role_target IS 'NULL = disponivel para todos os roles';

-- ---- Ledger ----
CREATE TYPE public.credit_tx_type AS ENUM (
  'purchase',
  'spend',
  'refund',
  'bonus',
  'adjustment'
);

CREATE TABLE public.credit_transactions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id  UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  amount           INTEGER NOT NULL,
  running_balance  INTEGER NOT NULL,
  tx_type          public.credit_tx_type NOT NULL,
  reference_type   TEXT,
  reference_id     UUID,
  description      TEXT,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON COLUMN public.credit_transactions.amount IS 'Positivo = credito, Negativo = debito';
COMMENT ON COLUMN public.credit_transactions.running_balance IS 'Saldo APOS esta transacao. Calculado por trigger.';

-- ---- Trigger: calcular running_balance automaticamente ----
CREATE OR REPLACE FUNCTION public.calc_credit_running_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _prev_balance INTEGER;
BEGIN
  -- Pegar saldo anterior (ultima transacao do usuario)
  SELECT running_balance INTO _prev_balance
  FROM public.credit_transactions
  WHERE user_id = NEW.user_id
  ORDER BY created_at DESC, id DESC
  LIMIT 1;

  _prev_balance := COALESCE(_prev_balance, 0);
  NEW.running_balance := _prev_balance + NEW.amount;

  -- Impedir saldo negativo
  IF NEW.running_balance < 0 THEN
    RAISE EXCEPTION 'Saldo insuficiente. Saldo atual: %, tentativa de debito: %',
      _prev_balance, NEW.amount;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_credit_running_balance
  BEFORE INSERT ON public.credit_transactions
  FOR EACH ROW EXECUTE FUNCTION public.calc_credit_running_balance();

-- ---- View: saldo atual por usuario ----
CREATE OR REPLACE VIEW public.user_credit_balances AS
SELECT DISTINCT ON (user_id)
  user_id,
  organization_id,
  running_balance AS balance,
  created_at AS last_transaction_at
FROM public.credit_transactions
ORDER BY user_id, created_at DESC, id DESC;

-- ---- RLS ----
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_packages_select"
  ON public.credit_packages FOR SELECT TO authenticated
  USING (active = true);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_transactions_select"
  ON public.credit_transactions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Insert controlado por Edge Function (nao expor ao client direto)
-- Se necessario: CREATE POLICY "credit_transactions_insert" ...

-- ---- Indices ----
CREATE INDEX idx_credit_tx_user_created
  ON public.credit_transactions (user_id, created_at DESC);

CREATE INDEX idx_credit_tx_org_created
  ON public.credit_transactions (organization_id, created_at DESC);

CREATE INDEX idx_credit_packages_active
  ON public.credit_packages (active, role_target);
```

### Migration 011: Profile Extensions

```sql
-- ============================================================
-- 011_add_profile_extensions.sql
-- Experiencias + Portfolio
-- ============================================================

CREATE TABLE public.experiences (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  location        TEXT,
  start_date      DATE,
  end_date        DATE,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE public.portfolio_items (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  image_url       TEXT NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
  deleted_at      TIMESTAMPTZ
);

-- ---- RLS ----
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "experiences_select"
  ON public.experiences FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "experiences_insert"
  ON public.experiences FOR INSERT TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND organization_id = public.get_user_org_id(auth.uid())
  );

CREATE POLICY "experiences_update"
  ON public.experiences FOR UPDATE TO authenticated
  USING (profile_id = auth.uid() AND deleted_at IS NULL);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_items_select"
  ON public.portfolio_items FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

CREATE POLICY "portfolio_items_insert"
  ON public.portfolio_items FOR INSERT TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND organization_id = public.get_user_org_id(auth.uid())
  );

CREATE POLICY "portfolio_items_update"
  ON public.portfolio_items FOR UPDATE TO authenticated
  USING (profile_id = auth.uid() AND deleted_at IS NULL);

-- ---- Indices ----
CREATE INDEX idx_experiences_profile
  ON public.experiences (profile_id, start_date DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_experiences_org_created
  ON public.experiences (organization_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_portfolio_profile_created
  ON public.portfolio_items (profile_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_portfolio_org_created
  ON public.portfolio_items (organization_id, created_at DESC)
  WHERE deleted_at IS NULL;
```

### Migration 012: Indices faltantes nas tabelas existentes

```sql
-- ============================================================
-- 012_add_missing_indexes.sql
-- Indices compostos (organization_id, created_at DESC) nas
-- tabelas existentes que nao tinham
-- ============================================================

-- requests
CREATE INDEX IF NOT EXISTS idx_requests_org_created
  ON public.requests (organization_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_requests_status_created
  ON public.requests (status, created_at DESC)
  WHERE deleted_at IS NULL;

-- proposals
CREATE INDEX IF NOT EXISTS idx_proposals_request
  ON public.proposals (request_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_proposals_supplier_org
  ON public.proposals (supplier_org_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_proposals_status
  ON public.proposals (status)
  WHERE deleted_at IS NULL;

-- messages (legado por request_id)
CREATE INDEX IF NOT EXISTS idx_messages_request_created
  ON public.messages (request_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_org
  ON public.profiles (organization_id)
  WHERE deleted_at IS NULL;
```

### Migration 013: Storage Buckets

```sql
-- ============================================================
-- 013_create_storage_buckets.sql
-- Buckets + policies de storage
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('opportunity-images', 'opportunity-images', true),
  ('course-thumbnails', 'course-thumbnails', true),
  ('course-videos', 'course-videos', false),
  ('portfolio-images', 'portfolio-images', true),
  ('post-images', 'post-images', true),
  ('profile-documents', 'profile-documents', false);

-- Public buckets: anyone can read
CREATE POLICY "Public read opportunity-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'opportunity-images');

CREATE POLICY "Public read course-thumbnails"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'course-thumbnails');

CREATE POLICY "Public read portfolio-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-images');

CREATE POLICY "Public read post-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-images');

-- Authenticated upload: user can upload to their org's folder
CREATE POLICY "Auth upload to public buckets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('opportunity-images', 'course-thumbnails', 'portfolio-images', 'post-images')
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- Private buckets: only owner can read
CREATE POLICY "Owner read course-videos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'course-videos'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Owner read profile-documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'profile-documents'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "Auth upload to private buckets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('course-videos', 'profile-documents')
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );
```

---

## RESUMO DE INDICES

| Tabela | Indice | Tipo |
|--------|--------|------|
| conversations | `(organization_id, created_at DESC) WHERE deleted_at IS NULL` | Composite filtrado |
| conversation_participants | `(profile_id)` | Lookup |
| conversation_participants | `(conversation_id)` | Lookup |
| messages | `(conversation_id, created_at DESC) WHERE deleted_at IS NULL` | Composite filtrado |
| messages | `(request_id, created_at DESC) WHERE deleted_at IS NULL` | Retrocompat |
| favorites | `(user_id, created_at DESC) WHERE deleted_at IS NULL` | Paginacao |
| favorites | `(organization_id, created_at DESC) WHERE deleted_at IS NULL` | Multi-tenant |
| reviews | `(target_id, target_type, created_at DESC) WHERE deleted_at IS NULL` | Lookup + paginacao |
| reviews | `(organization_id, created_at DESC) WHERE deleted_at IS NULL` | Multi-tenant |
| reviews | `(request_id) WHERE ... IS NOT NULL AND deleted_at IS NULL` | Filtrado |
| courses | `(organization_id, created_at DESC) WHERE deleted_at IS NULL` | Multi-tenant |
| courses | `(status, created_at DESC) WHERE deleted_at IS NULL` | Listagem publica |
| courses | `(creator_id) WHERE deleted_at IS NULL` | Meus cursos |
| course_modules | `(course_id, sort_order) WHERE deleted_at IS NULL` | Ordenacao |
| course_resources | `(course_id) WHERE deleted_at IS NULL` | Lookup |
| course_progress | `(user_id)` | Meu progresso |
| course_progress | `(organization_id)` | Multi-tenant |
| posts | `(organization_id, created_at DESC) WHERE deleted_at IS NULL` | Multi-tenant |
| posts | `(created_at DESC) WHERE deleted_at IS NULL` | Feed global |
| posts | `(author_id, created_at DESC) WHERE deleted_at IS NULL` | Meus posts |
| post_comments | `(post_id, created_at) WHERE deleted_at IS NULL` | Thread |
| post_likes | `(post_id)` | Contagem |
| notifications | `(user_id, read, created_at DESC)` | Unread first |
| notifications | `(organization_id, created_at DESC)` | Multi-tenant |
| credit_transactions | `(user_id, created_at DESC)` | Saldo + historico |
| credit_transactions | `(organization_id, created_at DESC)` | Multi-tenant |
| credit_packages | `(active, role_target)` | Listagem ativa |
| experiences | `(profile_id, start_date DESC) WHERE deleted_at IS NULL` | Timeline |
| experiences | `(organization_id, created_at DESC) WHERE deleted_at IS NULL` | Multi-tenant |
| portfolio_items | `(profile_id, created_at DESC) WHERE deleted_at IS NULL` | Gallery |
| portfolio_items | `(organization_id, created_at DESC) WHERE deleted_at IS NULL` | Multi-tenant |
| requests | `(organization_id, created_at DESC) WHERE deleted_at IS NULL` | Multi-tenant |
| requests | `(status, created_at DESC) WHERE deleted_at IS NULL` | Listagem publica |
| proposals | `(request_id, created_at DESC) WHERE deleted_at IS NULL` | Por oportunidade |
| proposals | `(supplier_org_id, created_at DESC) WHERE deleted_at IS NULL` | Minhas propostas |
| proposals | `(status) WHERE deleted_at IS NULL` | Filtro |
| profiles | `(organization_id) WHERE deleted_at IS NULL` | Multi-tenant |

**Total: 37 indices**

---

## RESUMO DE RLS POLICIES

| Tabela | SELECT | INSERT | UPDATE | DELETE | Total |
|--------|--------|--------|--------|--------|-------|
| organizations | soft-delete filter (atualizada) | sem org (atualizada) | own org | — | 4* |
| profiles | soft-delete filter (atualizada) | own | own | — | 3* |
| user_roles | own | own + admin | — | — | 3* |
| requests | soft-delete filter (atualizada) | buyer + own org | buyer + own org | — | 4* |
| proposals | soft-delete filter (atualizada) | supplier + own org | supplier + own org | — | 4* |
| messages | soft-delete filter (atualizada) | sender = self | — | — | 3* |
| conversations | participant + soft-delete | own org | own org | — | 3 |
| conversation_participants | is participant | own org or self | — | — | 2 |
| favorites | own + soft-delete | own + own org | — | own | 3 |
| reviews | public + soft-delete | own + own org | own | — | 3 |
| course_categories | public | — | — | — | 1 |
| courses | published or owner + soft-delete | own + own org | own | — | 3 |
| course_modules | via course + soft-delete | course owner | course owner | — | 3 |
| course_resources | via course + soft-delete | course owner | — | — | 2 |
| course_progress | own | own + own org | own | — | 3 |
| posts | public + soft-delete | own + own org | own | — | 3 |
| post_comments | public + soft-delete | own + own org | — | — | 2 |
| post_likes | public | own + own org | — | own | 3 |
| notifications | own | — (trigger/edge fn) | own | — | 2 |
| credit_packages | active | — | — | — | 1 |
| credit_transactions | own | — (trigger/edge fn) | — | — | 1 |
| experiences | public + soft-delete | own + own org | own | — | 3 |
| portfolio_items | public + soft-delete | own + own org | own | — | 3 |

**Total: ~59 policies** (21 atualizadas + 38 novas)

`*` = politica existente atualizada para incluir `deleted_at IS NULL`

> **Nota sobre admin:** as policies `FOR ALL` de admin existentes (`has_role(uid, 'admin')`)
> continuam funcionando. Nao duplicamos — elas cobrem todas as operacoes quando o user e admin.

---

## ORDEM FINAL DE MIGRATIONS

| # | Arquivo | Tabelas/Objetos | Dependencias |
|---|---------|----------------|-------------|
| **001** | `20260213090654_*.sql` | organizations, profiles, user_roles, requests, proposals, messages, functions, triggers, RLS | **JA APLICADA** |
| **002** | `20260213090729_*.sql` | Ajuste policy organizations INSERT | **JA APLICADA** |
| **003** | `003_extend_existing_tables.sql` | ALTER organizations, profiles, requests, proposals, messages + soft-delete + RLS updates | nenhuma |
| **004** | `004_add_conversations.sql` | conversations, conversation_participants, ALTER messages, function is_conversation_participant | 003 |
| **005** | `005_add_favorites.sql` | favorites | 003 |
| **006** | `006_add_reviews.sql` | reviews, ENUM review_target_type | 003 |
| **007** | `007_add_courses_system.sql` | course_categories, courses, course_modules, course_resources, course_progress | 003 |
| **008** | `008_add_community.sql` | posts, post_comments, post_likes | 003 |
| **009** | `009_add_notifications.sql` | notifications | 003 |
| **010** | `010_add_credit_ledger.sql` | credit_packages, credit_transactions, ENUM credit_tx_type, function calc_credit_running_balance, VIEW user_credit_balances | 003 |
| **011** | `011_add_profile_extensions.sql` | experiences, portfolio_items | 003 |
| **012** | `012_add_missing_indexes.sql` | Indices em tabelas existentes | 003 |
| **013** | `013_create_storage_buckets.sql` | 6 storage buckets + policies | nenhuma |

**Ordem de execucao:** 003 → 004 → 005-011 (paralelo) → 012 → 013

> Migrations 005 a 011 sao independentes entre si e podem ser aplicadas em qualquer ordem,
> desde que 003 ja tenha sido aplicada (pois dependem de `deleted_at` e colunas novas).

---

## DIAGRAMA DE DEPENDENCIAS

```
[001 + 002]  (existentes, ja aplicadas)
     │
     ▼
   [003]  extend existing tables + soft delete
     │
     ├──────┬──────┬──────┬──────┬──────┬──────┐
     ▼      ▼      ▼      ▼      ▼      ▼      ▼
   [004]  [005]  [006]  [007]  [008]  [009]  [010]  [011]
   conv   fav    rev    acad   comm   notif  cred   profile
     │
     ▼
   [012]  indexes nas tabelas existentes
     │
     ▼
   [013]  storage buckets
```
