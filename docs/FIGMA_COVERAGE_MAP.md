# TravelConnect — Figma Coverage Map (Incremental)

> **Gerado:** 2026-02-19
> **Revisao:** v2 — formato arquitetural padronizado

---

## ENTRADAS UTILIZADAS

### Paginas do Figma (nomes exatos do export `docs/travel identidade visual/`)

```
Pagina Inicial
Selecionar Acesso
Login
Login Viajante
Cadastro 1 - Viajante
Cadastro 2 - Viajante
Cadastro 3 - Viajante
Cadastro 4 - Viajante
Cadastro 1 - Anfitriao
Cadastro 2 - Anfitriao
Cadastro 3 - Anfitriao - Familia
Cadastro 3 - Anfitriao - ONG
Cadastro 3 - Anfitriao - Hostel
Cadastro 3 - Anfitriao - Hotel
Cadastro 3 - Anfitriao - Fazenda
Cadastro 3 - Anfitriao - Escola
Cadastro 3 - Anfitriao - Empresa
Cadastro 4 - Anfitriao
Inicio - Viajante
Inicio - Anfitriao
Oportunidades - Viajante
Oportunidades - Anfitriao
Detalhes da Oportunidade - Viajante
Detalhes da Oportunidade - Anfitriao
Favoritos - Viajante
Nova Oportunidade 1 - Anfitriao
Nova Oportunidade 2 - Anfitriao
Nova Oportunidade 3 - Anfitriao
Nova Oportunidade 4 - Anfitriao
Candidaturas - Viajante
Candidaturas - Anfitriao
Candidaturas da Oportunidade - Anfitriao
Perfil do Candidato - Anfitriao
Academy - Viajante
Academy - Anfitriao
Detalhes do Curso - Viajante
Assistir Curso - Conteudos - Viajante
Assistir Curso - Recursos - Viajante
Criar Curso 1 - Viajante
Criar Curso 2 - Viajante
Criar Curso 3 - Viajante
Criar Curso 5 - Viajante
Criar Curso 6 - Viajante
Criar Curso 7 - Viajante
Chat - Viajante
Chat - Anfitriao
Avaliacoes - Anfitriao
Perfil - Viajante
Perfil - Anfitriao
Perfil do Viajante (Sobre) - Viajante
Perfil do Viajante (Experiencias) - Viajante
Perfil do Viajante (Portfolio) - Viajante
Perfil do Viajante (Avaliacoes) - Viajante
Perfil do Anfitriao (Sobre) - Viajante
Perfil do Anfitriao (Oportunidades) - Viajante
Perfil do Anfitriao (Publicacoes) - Viajante
Perfil do Anfitriao (Avaliacoes) - Viajante
Comunidade - Viajante
Comunidade - Anfitrioes
Comunidade - Feed
Comprar mais creditos - Viajante
Pacotes Creditos - Anfitriao
Integracoes - Anfitriao
Notificacoes
Modal - Avaliar Anfitriao
Modal - Avaliar Viajante
Modal - Cadastro aprovado
Modal - Candidatar-se
Modal - Confirmar Like
Modal - Conversar com Anfitriao
Modal - Curso Publicado
Modal - Detalhes Candidatura
Modal - Novo Post
Modal - Oportunidade criada
```

> Variantes de scroll (`-1`, `-2`...) e versoes mobile (`- Mob`) nao contam como paginas separadas;
> sao estados/breakpoints da mesma tela.

### Paginas ja implementadas

| Arquivo | Rota | Tipo |
|---------|------|------|
| `Index.tsx` | `/` | public |
| `SelectRole.tsx` | `/select_role` | public |
| `Login.tsx` | `/login` | public |
| `Register.tsx` | `/register` | public |
| `Dashboard.tsx` | `/dashboard` | protected |
| `Opportunities.tsx` | `/opportunities` | protected |
| `CreateRequest.tsx` | `/requests/new` | protected |
| `Profile.tsx` | `/profile` | protected |
| `NotFound.tsx` | `/*` | public |

Stubs (redirect → `/dashboard`): `/applications`, `/academy`, `/reviews`, `/community`, `/requests`, `/messages`, `/settings`

### Stack

| Camada | Tecnologia |
|--------|-----------|
| Front | React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| Router | React Router v6 |
| State | React Query v5 + React Context |
| DB/Auth | Supabase (Postgres + Supabase Auth + Storage + Realtime) |
| Multi-tenant | **SIM** — `tenant_key = organization_id` |

---

## 1) FIGMA COVERAGE TABLE

### 1.1 Auth Flow

| page_name | route | status | componentes principais | endpoints necessarios | prioridade |
|---|---|---|---|---|---|
| Pagina Inicial | `/` | **implemented** | `Index`, country grid | — | MVP |
| Selecionar Acesso | `/select_role` | **implemented** | `SelectRole`, role cards | — | MVP |
| Login | `/login` | **implemented** | `Login`, `AuthBackground` | `auth.signInWithPassword` | MVP |
| Login Viajante | `/login` | **implemented** | `Login` (variant via `selectedUIRole`) | `auth.signInWithPassword` | MVP |
| Cadastro 1 - Viajante | `/register` | **implemented** | `Register` step 0 — Pessoal | `auth.signUp` | MVP |
| Cadastro 2 - Viajante | `/register` | **implemented** | `Register` step 1 — Verificacao | — | MVP |
| Cadastro 3 - Viajante | `/register` | **implemented** | `Register` step 2 — Habilidades | — | MVP |
| Cadastro 4 - Viajante | `/register` | **implemented** | `Register` steps 3-4 — Sobre Mim + Viagens | `organizations.insert`, `profiles.update`, `user_roles.insert` | MVP |
| Cadastro 1 - Anfitriao | `/register` | **implemented** | `Register` step 0 — Organizacao | `auth.signUp` | MVP |
| Cadastro 2 - Anfitriao | `/register` | **implemented** | `Register` step 1 — Localizacao | — | MVP |
| Cadastro 3 - Anfitriao - Familia | `/register` | **implemented** | `Register` step 2 — Informacoes (variant familia) | — | MVP |
| Cadastro 3 - Anfitriao - ONG | `/register` | **implemented** | `Register` step 2 — Informacoes (variant ONG) | — | MVP |
| Cadastro 3 - Anfitriao - Hostel | `/register` | **implemented** | `Register` step 2 — Informacoes (variant hostel) | — | MVP |
| Cadastro 3 - Anfitriao - Hotel | `/register` | **implemented** | `Register` step 2 — Informacoes (variant hotel) | — | MVP |
| Cadastro 3 - Anfitriao - Fazenda | `/register` | **implemented** | `Register` step 2 — Informacoes (variant fazenda) | — | MVP |
| Cadastro 3 - Anfitriao - Escola | `/register` | **implemented** | `Register` step 2 — Informacoes (variant escola) | — | MVP |
| Cadastro 3 - Anfitriao - Empresa | `/register` | **implemented** | `Register` step 2 — Informacoes (variant empresa) | — | MVP |
| Cadastro 4 - Anfitriao | `/register` | **implemented** | `Register` step 3 — Finalizacao | `organizations.insert`, `profiles.update`, `user_roles.insert` | MVP |
| Modal - Cadastro aprovado | — (overlay) | **planned** | `ApprovalModal` | — | fase_2 |

### 1.2 Dashboard

| page_name | route | status | componentes principais | endpoints necessarios | prioridade |
|---|---|---|---|---|---|
| Inicio - Viajante | `/dashboard` | **implemented** | `ViajanteDashboard`, stats cards, quick links | `requests.select(count)`, `proposals.select(count)`, `requests.select.order.limit(5)` | MVP |
| Inicio - Anfitriao | `/dashboard` | **implemented** | `AnfitriaoDashboard`, CTA banner, stats | `requests.select(count)`, `proposals.select(count)` | MVP |

### 1.3 Oportunidades

| page_name | route | status | componentes principais | endpoints necessarios | prioridade |
|---|---|---|---|---|---|
| Oportunidades - Viajante | `/opportunities` | **implemented** | `Opportunities`, `OpportunityCard`, search | `requests.select(*, org.name).eq(status,open)` | MVP |
| Oportunidades - Anfitriao | `/opportunities` | **implemented** | `Opportunities` (role-aware) | `requests.select` | MVP |
| Detalhes da Oportunidade - Viajante | `/opportunities/:id` | **planned** | `OpportunityDetail`, gallery, host card, apply CTA | `requests.select.eq(id).single()`, `organizations.select`, `profiles.select` | **MVP** |
| Detalhes da Oportunidade - Anfitriao | `/opportunities/:id` | **planned** | `OpportunityDetail` (owner view), edit, stats | `requests.select.eq(id)`, `proposals.select.eq(request_id)` com **paginacao** | **MVP** |
| Favoritos - Viajante | `/favorites` | **planned** | `FavoritesList`, `OpportunityCard` | **NOVO:** `favorites.select.eq(user_id)` com **limit/offset** | fase_2 |
| Modal - Candidatar-se | — (overlay) | **planned** | `ApplyModal`, message + price | `proposals.insert` | **MVP** |
| Modal - Oportunidade criada | — (overlay) | **planned** | `SuccessModal` | — | MVP |

### 1.4 Nova Oportunidade

| page_name | route | status | componentes principais | endpoints necessarios | prioridade |
|---|---|---|---|---|---|
| Nova Oportunidade 1 - Anfitriao | `/requests/new` | **implemented** | `CreateRequest` (form unico cobre step 1) | `requests.insert` | MVP |
| Nova Oportunidade 2 - Anfitriao | `/requests/new` step 2 | **planned** | `CreateRequestStep2` — detalhes/requisitos | — (front-end) | fase_2 |
| Nova Oportunidade 3 - Anfitriao | `/requests/new` step 3 | **planned** | `CreateRequestStep3` — galeria | **NOVO:** `storage.upload(opportunity_images)` | fase_2 |
| Nova Oportunidade 4 - Anfitriao | `/requests/new` step 4 | **planned** | `CreateRequestStep4` — revisao/publicar | — | fase_2 |

### 1.5 Candidaturas

| page_name | route | status | componentes principais | endpoints necessarios | prioridade |
|---|---|---|---|---|---|
| Candidaturas - Viajante | `/applications` | **planned** | `ApplicationsList`, `ApplicationCard`, status badges | `proposals.select.eq(supplier_profile_id)` com **limit/offset** | **MVP** |
| Candidaturas - Anfitriao | `/applications` | **planned** | `ApplicationsList` (received), accept/reject actions | `proposals.select.eq(org_id)` com **limit/offset**, `proposals.update(status)` | **MVP** |
| Candidaturas da Oportunidade - Anfitriao | `/opportunities/:id/applications` | **planned** | `OpportunityApplications`, applicant cards | `proposals.select.eq(request_id)` com join `profiles` + **limit/offset** | **MVP** |
| Perfil do Candidato - Anfitriao | `/applications/:proposal_id/candidate` | **planned** | `CandidateProfile`, skills, portfolio | `profiles.select`, **NOVO:** `user_skills.select`, `reviews.select.eq(target_id)` | **MVP** |
| Modal - Detalhes Candidatura | — (overlay) | **planned** | `ApplicationDetailModal` | `proposals.select.eq(id).single()` | MVP |

### 1.6 Chat / Mensagens

| page_name | route | status | componentes principais | endpoints necessarios | prioridade |
|---|---|---|---|---|---|
| Chat - Viajante | `/messages` | **planned** | `ChatLayout`, `ConversationList`, `MessageThread` | `messages.select.eq(request_id)` com **cursor pagination**, `messages.insert`, **Realtime subscription** | **MVP** |
| Chat - Anfitriao | `/messages` | **planned** | `ChatLayout` (host view) | idem | **MVP** |
| Modal - Conversar com Anfitriao | — (overlay) | **planned** | `StartConversationModal` | `messages.insert` (first message) | MVP |

### 1.7 Academy

| page_name | route | status | componentes principais | endpoints necessarios | prioridade |
|---|---|---|---|---|---|
| Academy - Viajante | `/academy` | **planned** | `AcademyHome`, `CourseCard`, categories | **NOVO:** `courses.select` com **limit/offset**, `course_categories.select` | fase_2 |
| Academy - Anfitriao | `/academy` | **planned** | `AcademyHome` (host: manage courses) | `courses.select.eq(creator_id)` com **limit/offset** | fase_2 |
| Detalhes do Curso - Viajante | `/academy/:course_id` | **planned** | `CourseDetail`, syllabus, reviews, enroll | `courses.select.eq(id).single()`, **NOVO:** `course_modules.select`, `course_reviews.select` com **limit/offset** | fase_2 |
| Assistir Curso - Conteudos - Viajante | `/academy/:course_id/watch` | **planned** | `CoursePlayer`, video, progress bar | `course_modules.select`, **NOVO:** `course_progress.upsert` | fase_2 |
| Assistir Curso - Recursos - Viajante | `/academy/:course_id/resources` | **planned** | `CourseResources`, download list | **NOVO:** `course_resources.select`, `storage.createSignedUrl` | fase_2 |
| Criar Curso 1 - Viajante | `/academy/create` step 1 | **planned** | `CourseBuilder` step 1 — info basica | **NOVO:** `courses.insert` | fase_2 |
| Criar Curso 2 - Viajante | `/academy/create` step 2 | **planned** | `CourseBuilder` step 2 — modulos | `course_modules.insert` | fase_2 |
| Criar Curso 3 - Viajante | `/academy/create` step 3 | **planned** | `CourseBuilder` step 3 — conteudo | `storage.upload(course_videos)` | fase_2 |
| Criar Curso 5 - Viajante | `/academy/create` step 4 | **planned** | `CourseBuilder` step 4 — recursos | `course_resources.insert`, `storage.upload` | fase_2 |
| Criar Curso 6 - Viajante | `/academy/create` step 5 | **planned** | `CourseBuilder` step 5 — preco/config | `courses.update` | fase_2 |
| Criar Curso 7 - Viajante | `/academy/create` step 6 | **planned** | `CourseBuilder` step 6 — revisao/publicar | `courses.update(status)` | fase_2 |
| Modal - Curso Publicado | — (overlay) | **planned** | `CoursePublishedModal` | — | fase_2 |

### 1.8 Avaliacoes

| page_name | route | status | componentes principais | endpoints necessarios | prioridade |
|---|---|---|---|---|---|
| Avaliacoes - Anfitriao | `/reviews` | **planned** | `ReviewsList`, `ReviewCard`, `StarRating` | **NOVO:** `reviews.select.eq(target_id)` com **limit/offset** | fase_2 |
| Modal - Avaliar Anfitriao | — (overlay) | **planned** | `ReviewModal` | **NOVO:** `reviews.insert` | fase_2 |
| Modal - Avaliar Viajante | — (overlay) | **planned** | `ReviewModal` (variant) | `reviews.insert` | fase_2 |

### 1.9 Perfis

| page_name | route | status | componentes principais | endpoints necessarios | prioridade |
|---|---|---|---|---|---|
| Perfil - Viajante | `/profile` | **implemented** | `Profile` (2 tabs: General + My Profile) | `profiles.update`, `organizations.update` | MVP |
| Perfil - Anfitriao | `/profile` | **implemented** | `Profile` (role-aware) | `profiles.update`, `organizations.update` | MVP |
| Perfil do Viajante (Sobre) | `/travelers/:id` | **planned** | `PublicTravelerProfile` tab Sobre | `profiles.select.eq(id).single()`, `organizations.select` | fase_2 |
| Perfil do Viajante (Experiencias) | `/travelers/:id?tab=experiences` | **planned** | `ExperiencesTab` | **NOVO:** `experiences.select.eq(profile_id)` com **limit/offset** | fase_2 |
| Perfil do Viajante (Portfolio) | `/travelers/:id?tab=portfolio` | **planned** | `PortfolioTab`, `GalleryGrid` | **NOVO:** `portfolio_items.select.eq(profile_id)` com **limit/offset** | fase_2 |
| Perfil do Viajante (Avaliacoes) | `/travelers/:id?tab=reviews` | **planned** | `ProfileReviewsTab` | `reviews.select.eq(target_id)` com **limit/offset** | fase_2 |
| Perfil do Anfitriao (Sobre) | `/hosts/:id` | **planned** | `PublicHostProfile` tab Sobre | `profiles.select`, `organizations.select.eq(id).single()` | fase_2 |
| Perfil do Anfitriao (Oportunidades) | `/hosts/:id?tab=opportunities` | **planned** | `HostOpportunitiesTab` | `requests.select.eq(organization_id)` com **limit/offset** | fase_2 |
| Perfil do Anfitriao (Publicacoes) | `/hosts/:id?tab=posts` | **planned** | `HostPostsTab` | **NOVO:** `posts.select.eq(author_id)` com **limit/offset** | fase_2 |
| Perfil do Anfitriao (Avaliacoes) | `/hosts/:id?tab=reviews` | **planned** | `HostReviewsTab` | `reviews.select.eq(target_id)` com **limit/offset** | fase_2 |

### 1.10 Comunidade

| page_name | route | status | componentes principais | endpoints necessarios | prioridade |
|---|---|---|---|---|---|
| Comunidade - Viajante | `/community` | **planned** | `CommunityHome`, traveler directory | `profiles.select` com filtros + **limit/offset** | fase_2 |
| Comunidade - Anfitrioes | `/community/hosts` | **planned** | `HostDirectory`, search, cards | `organizations.select` com filtros + **limit/offset** | fase_2 |
| Comunidade - Feed | `/community/feed` | **planned** | `CommunityFeed`, `PostCard`, `CommentThread` | **NOVO:** `posts.select` + **cursor pagination**, `post_comments.select`, `post_likes.select` | fase_2 |
| Modal - Novo Post | — (overlay) | **planned** | `NewPostModal` | `posts.insert`, `storage.upload(post_images)` | fase_2 |
| Modal - Confirmar Like | — (overlay) | **planned** | `ConfirmLikeModal` | `post_likes.insert` | backlog |

### 1.11 Creditos e Pagamentos

| page_name | route | status | componentes principais | endpoints necessarios | prioridade |
|---|---|---|---|---|---|
| Comprar mais creditos - Viajante | `/credits` | **planned** | `CreditsStore`, package cards | **NOVO:** `credit_packages.select`, `credit_purchases.insert`, `user_credits.select` | fase_2 |
| Pacotes Creditos - Anfitriao | `/credits` | **planned** | `CreditsStore` (host packages) | idem | fase_2 |
| Integracoes - Anfitriao | `/settings/integrations` | **planned** | `IntegrationsList`, bank connect | **NOVO:** `integrations.select`, API externa de pagamentos | backlog |

### 1.12 Notificacoes

| page_name | route | status | componentes principais | endpoints necessarios | prioridade |
|---|---|---|---|---|---|
| Notificacoes | `/notifications` ou dropdown | **planned** | `NotificationsList`, `NotificationItem` | **NOVO:** `notifications.select.eq(user_id)` com **limit/offset**, `notifications.update(read)`, **Realtime subscription** | fase_2 |

### Resumo numerico

| Status | Quantidade | % |
|--------|-----------|---|
| **implemented** | 22 paginas/variantes | 30% |
| **planned** (MVP) | 11 | 15% |
| **planned** (fase_2) | 30 | 41% |
| **planned** (backlog) | 3 | 4% |
| **Modals planned** | 10 | 14% |
| **TOTAL** | **73** (sem contar mobile breakpoints) | — |

---

## 2) GAP ANALYSIS

### 2.1 Paginas faltantes

**MVP — implementar agora (11 paginas):**

| # | page_name | complexidade | justificativa |
|---|-----------|-------------|---------------|
| 1 | Detalhes da Oportunidade - Viajante | Alta | Core: sem detalhe nao ha conversao |
| 2 | Detalhes da Oportunidade - Anfitriao | Alta | Owner precisa ver/editar + ver candidatos |
| 3 | Candidaturas - Viajante | Media | Viajante precisa acompanhar status |
| 4 | Candidaturas - Anfitriao | Media | Anfitriao precisa aceitar/rejeitar |
| 5 | Candidaturas da Oportunidade - Anfitriao | Media | Lista por oportunidade |
| 6 | Perfil do Candidato - Anfitriao | Media | Avaliar candidato antes de aceitar |
| 7 | Chat - Viajante | Alta | Comunicacao e essencial para match |
| 8 | Chat - Anfitriao | Alta | Contraparte do chat |
| 9 | Modal - Candidatar-se | Baixa | Fluxo de candidatura |
| 10 | Modal - Conversar com Anfitriao | Baixa | Iniciar conversa |
| 11 | Modal - Detalhes Candidatura | Baixa | Visualizar candidatura |

**Fase 2 (30 paginas):** Academy (11), Comunidade (4), Perfis publicos (8), Avaliacoes (3), Creditos (2), Notificacoes (1), Favoritos (1)

**Backlog (3):** Integracoes bancarias, Modal Confirmar Like, Modal Cadastro aprovado

### 2.2 Componentes NOVOS necessarios

> Nao repete componentes ja existentes (`Button`, `Card`, `Input`, `Dialog`, etc. do shadcn/ui)

**Componentes de dominio (organisms):**

| Componente | Usado em | Novo? |
|------------|---------|-------|
| `OpportunityDetail` | Detalhes da Oportunidade | SIM |
| `ApplicationsList` | Candidaturas (ambos roles) | SIM |
| `ApplicationCard` | Candidaturas, Oportunidade detail | SIM |
| `CandidateProfile` | Perfil do Candidato | SIM |
| `ChatLayout` | Chat (split: lista + thread) | SIM |
| `ConversationList` | Chat sidebar | SIM |
| `MessageThread` | Chat main area | SIM |
| `MessageBubble` | Dentro de MessageThread | SIM |
| `AcademyHome` | Academy landing | SIM |
| `CourseCard` | Academy, search results | SIM |
| `CourseDetail` | Detalhes do Curso | SIM |
| `CoursePlayer` | Assistir Curso | SIM |
| `CourseBuilder` | Criar Curso (wizard) | SIM |
| `ReviewsList` | Avaliacoes | SIM |
| `CommunityFeed` | Comunidade - Feed | SIM |
| `HostDirectory` | Comunidade - Anfitrioes | SIM |
| `PublicTravelerProfile` | Perfil publico viajante (tabs) | SIM |
| `PublicHostProfile` | Perfil publico anfitriao (tabs) | SIM |
| `CreditsStore` | Comprar creditos | SIM |
| `NotificationsList` | Notificacoes | SIM |

**Componentes reutilizaveis (molecules):**

| Componente | Descricao |
|------------|-----------|
| `StarRating` | Input de estrelas (1-5) |
| `ReviewCard` | Card individual de avaliacao |
| `PostCard` | Card de post no feed |
| `CommentThread` | Thread de comentarios |
| `FilterPanel` | Painel de filtros generico |
| `GalleryGrid` | Grid de imagens com lightbox |
| `FileUploader` | Upload de arquivos (fotos, docs, videos) |
| `EmptyState` | Estado vazio padronizado |
| `SkeletonCard` | Loading skeleton |
| `PaginationControls` | Controles prev/next + info |
| `CreditsBadge` | Badge com saldo de creditos |
| `NotificationBell` | Icone sino + counter |
| `ProfileTabs` | Tabs de perfil publico |
| `VideoPlayer` | Player de video embarcado |

### 2.3 Endpoints NOVOS necessarios (agrupados por dominio)

**Auth:**
Nenhum novo — `auth.signUp`, `auth.signIn`, `auth.signOut` ja existem.

**Proposals (candidaturas):**
```
proposals.update({ status })           ← aceitar/rejeitar (NOVO)
proposals.select.eq(supplier_profile_id).range(from,to)  ← minhas candidaturas com paginacao
proposals.select.eq(request_id).range(from,to)           ← candidaturas por oportunidade com paginacao
```

**Requests (oportunidades):**
```
requests.select.eq(id).single()        ← detalhe (ja parcial, formalizar)
requests.update                        ← editar oportunidade (NOVO)
```

**Messages (chat):**
```
messages.select.eq(request_id).order(created_at,desc).range()  ← com paginacao cursor
supabase.channel('messages:request_id').on('INSERT', ...)      ← Realtime (NOVO)
```

**Favorites:** (NOVO dominio)
```
favorites.select.eq(user_id).range(from,to)
favorites.insert({ user_id, request_id })
favorites.delete.eq(id)
```

**Reviews:** (NOVO dominio)
```
reviews.select.eq(target_id).range(from,to)
reviews.insert({ reviewer_id, target_id, target_type, rating, comment, request_id })
```

**Courses:** (NOVO dominio)
```
courses.select.range(from,to)
courses.select.eq(id).single()
courses.insert / courses.update
course_modules.select.eq(course_id).order(order)
course_modules.insert
course_progress.upsert({ user_id, module_id, completed, progress_percent })
course_resources.select.eq(course_id)
course_reviews.select.eq(course_id).range(from,to)
course_reviews.insert
course_categories.select
```

**Community:** (NOVO dominio)
```
posts.select.order(created_at,desc).range(from,to)
posts.insert
post_comments.select.eq(post_id).range(from,to)
post_comments.insert
post_likes.insert / post_likes.delete
```

**Notifications:** (NOVO dominio)
```
notifications.select.eq(user_id).order(created_at,desc).range(from,to)
notifications.update({ read: true })
supabase.channel('notifications:user_id').on('INSERT', ...)   ← Realtime
```

**Credits:** (NOVO dominio)
```
credit_packages.select
credit_purchases.insert
user_credits.select.eq(user_id).single()
```

**Storage:** (NOVO)
```
storage.from('opportunity-images').upload()
storage.from('course-thumbnails').upload()
storage.from('course-videos').upload()
storage.from('portfolio-images').upload()
storage.from('post-images').upload()
storage.from('profile-documents').upload()
```

### 2.4 Impacto no banco

**Tabelas atuais (6):**
`organizations`, `profiles`, `user_roles`, `requests`, `proposals`, `messages`

**Tabelas novas necessarias (17):**

| Tabela | Campos-chave | FK principal | Indice sugerido |
|--------|-------------|-------------|----------------|
| `favorites` | id, user_id, request_id, created_at | user_id → auth.users, request_id → requests | `UNIQUE(user_id, request_id)` |
| `reviews` | id, reviewer_id, target_id, target_type, rating, comment, request_id, created_at | reviewer_id → profiles, request_id → requests | `(target_id, target_type)`, `(request_id)` |
| `courses` | id, title, description, creator_id, category_id, price, thumbnail_url, status, created_at | creator_id → profiles, category_id → course_categories | `(status, created_at DESC)`, `(creator_id)` |
| `course_modules` | id, course_id, title, order, video_url, duration_seconds, content | course_id → courses | `(course_id, order)` |
| `course_progress` | id, user_id, module_id, completed, progress_percent, last_watched_at | user_id → auth.users, module_id → course_modules | `UNIQUE(user_id, module_id)` |
| `course_resources` | id, course_id, title, file_url, type | course_id → courses | `(course_id)` |
| `course_reviews` | id, course_id, user_id, rating, comment, created_at | course_id → courses, user_id → auth.users | `UNIQUE(course_id, user_id)`, `(course_id, created_at DESC)` |
| `course_categories` | id, name, slug, icon | — | `UNIQUE(slug)` |
| `posts` | id, author_id, content, image_url, created_at | author_id → profiles | `(created_at DESC)`, `(author_id)` |
| `post_comments` | id, post_id, author_id, content, created_at | post_id → posts, author_id → profiles | `(post_id, created_at)` |
| `post_likes` | id, post_id, user_id, created_at | post_id → posts, user_id → auth.users | `UNIQUE(post_id, user_id)` |
| `notifications` | id, user_id, type, title, body, read, reference_id, reference_type, created_at | user_id → auth.users | `(user_id, read, created_at DESC)` |
| `credit_packages` | id, name, credits, price_cents, role_target, active | — | `(active, role_target)` |
| `credit_purchases` | id, user_id, package_id, amount_paid_cents, created_at | user_id → auth.users, package_id → credit_packages | `(user_id, created_at DESC)` |
| `user_credits` | id, user_id, balance, updated_at | user_id → auth.users | `UNIQUE(user_id)` |
| `experiences` | id, profile_id, title, description, location, start_date, end_date | profile_id → profiles | `(profile_id)` |
| `portfolio_items` | id, profile_id, title, image_url, description, created_at | profile_id → profiles | `(profile_id, created_at DESC)` |

**Colunas novas em tabelas existentes:**
```
profiles   ADD COLUMN bio TEXT
profiles   ADD COLUMN travel_style TEXT
profiles   ADD COLUMN date_of_birth DATE
profiles   ADD COLUMN nationality TEXT
profiles   ADD COLUMN passport_country TEXT
profiles   ADD COLUMN phone TEXT

organizations ADD COLUMN type TEXT           -- (ONG, Familia, Hostel, etc.)
organizations ADD COLUMN address TEXT
organizations ADD COLUMN city TEXT
organizations ADD COLUMN state TEXT
organizations ADD COLUMN postal_code TEXT
```

**RLS policies novas:** ~2-3 por tabela nova = **~40 policies**

**Storage buckets novos:** 6 (`opportunity-images`, `course-thumbnails`, `course-videos`, `portfolio-images`, `post-images`, `profile-documents`)

**Migrations sugeridas (ordem):**
```
001_extend_profiles_and_orgs.sql
002_add_favorites.sql
003_add_reviews.sql
004_add_courses_system.sql          -- courses + modules + progress + resources + reviews + categories
005_add_community.sql               -- posts + comments + likes
006_add_notifications.sql
007_add_credits_system.sql          -- packages + purchases + user_credits
008_add_profile_extensions.sql      -- experiences + portfolio_items
009_create_storage_buckets.sql
010_add_indexes.sql
```

---

## 3) EXPANSION STRATEGY

### 3.1 Organizacao de rotas (por dominio e layout)

```
src/
  App.tsx
    ├─ PublicLayout      ← rotas sem auth
    │   ├─ /
    │   ├─ /select_role
    │   ├─ /login
    │   └─ /register
    │
    ├─ AppLayout         ← TopNavbar + container (auth required)
    │   ├─ /dashboard
    │   │
    │   ├─ /opportunities
    │   ├─ /opportunities/:id
    │   ├─ /opportunities/:id/applications    ← host only
    │   ├─ /requests/new                      ← host only
    │   │
    │   ├─ /applications
    │   ├─ /applications/:proposal_id/candidate
    │   │
    │   ├─ /messages
    │   ├─ /messages/:conversation_id
    │   │
    │   ├─ /academy
    │   ├─ /academy/:course_id
    │   ├─ /academy/:course_id/watch
    │   ├─ /academy/:course_id/resources
    │   ├─ /academy/create                    ← traveler only
    │   │
    │   ├─ /reviews
    │   │
    │   ├─ /community
    │   ├─ /community/hosts
    │   ├─ /community/feed
    │   │
    │   ├─ /travelers/:id                     ← perfil publico viajante
    │   ├─ /hosts/:id                         ← perfil publico anfitriao
    │   │
    │   ├─ /profile
    │   ├─ /credits
    │   ├─ /notifications
    │   ├─ /settings
    │   └─ /settings/integrations             ← host only
    │
    └─ /* → NotFound
```

- **Convencao:** plural para listas, `:param` para detalhe, verbo para acao
- **Rotas protegidas por role:** usar wrapper `<RoleGuard role="anfitriao">` ou `<RoleGuard role="viajante">`
- **Stubs existentes:** substituir `<Navigate>` pelo componente real — zero breaking change

### 3.2 Versionamento de componentes

```
src/
  components/
    ui/                         ← shadcn/ui (NUNCA modificar diretamente)
    layout/                     ← Layout, TopNavbar, ProtectedRoute, RoleGuard
    auth/                       ← AuthBackground, Logo
    shared/                     ← atoms/molecules reutilizaveis
      ├─ OpportunityCard.tsx
      ├─ ApplicationCard.tsx
      ├─ ReviewCard.tsx
      ├─ PostCard.tsx
      ├─ CourseCard.tsx
      ├─ StarRating.tsx
      ├─ FilterPanel.tsx
      ├─ GalleryGrid.tsx
      ├─ FileUploader.tsx
      ├─ VideoPlayer.tsx
      ├─ EmptyState.tsx
      ├─ SkeletonCard.tsx
      ├─ PaginationControls.tsx
      ├─ CreditsBadge.tsx
      └─ NotificationBell.tsx
    modals/                     ← todos os overlays
      ├─ ApplyModal.tsx
      ├─ ReviewModal.tsx
      ├─ StartConversationModal.tsx
      ├─ NewPostModal.tsx
      ├─ SuccessModal.tsx
      └─ ApprovalModal.tsx

  pages/                        ← 1 pasta por dominio
    dashboard/
      ├─ Dashboard.tsx
      ├─ ViajanteDashboard.tsx
      └─ AnfitriaoDashboard.tsx
    opportunities/
      ├─ Opportunities.tsx
      └─ OpportunityDetail.tsx
    applications/
      ├─ Applications.tsx
      ├─ OpportunityApplications.tsx
      └─ CandidateProfile.tsx
    chat/
      ├─ ChatLayout.tsx
      ├─ ConversationList.tsx
      └─ MessageThread.tsx
    academy/
      ├─ AcademyHome.tsx
      ├─ CourseDetail.tsx
      ├─ CoursePlayer.tsx
      └─ CourseBuilder.tsx
    community/
      ├─ CommunityHome.tsx
      ├─ CommunityFeed.tsx
      └─ HostDirectory.tsx
    profile/
      ├─ Profile.tsx
      ├─ PublicTravelerProfile.tsx
      └─ PublicHostProfile.tsx
    reviews/
      └─ Reviews.tsx
    credits/
      └─ CreditsStore.tsx
    settings/
      ├─ Settings.tsx
      └─ Integrations.tsx
```

**Regras:**
- Componentes `shared/` nunca importam contexto de dominio; recebem tudo via props
- Componentes `pages/` podem usar hooks e contexto
- Nenhum arquivo > 300 linhas; extrair sub-componentes se ultrapassar
- shadcn/ui: extender via wrapper, nunca modificar `ui/`

### 3.3 API modular (hooks por dominio)

```
src/
  hooks/
    useOpportunities.ts       ← queries + mutations de requests
    useApplications.ts        ← queries + mutations de proposals
    useMessages.ts            ← queries + mutations + realtime de messages
    useReviews.ts             ← queries + mutations de reviews
    useCourses.ts             ← queries + mutations de courses
    useCommunity.ts           ← queries + mutations de posts/comments/likes
    useCredits.ts             ← queries + mutations de credits
    useNotifications.ts       ← queries + mutations + realtime
    useProfile.ts             ← queries + mutations de profiles/orgs
    useFavorites.ts           ← queries + mutations de favorites
```

**Padrao de cada hook:**
```ts
// src/hooks/useOpportunities.ts
export function useOpportunities(filters: Filters, page: number) {
  const PAGE_SIZE = 20;
  return useQuery({
    queryKey: ["opportunities", filters, page],
    queryFn: async () => {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, count } = await supabase
        .from("requests")
        .select("*, organizations!inner(name)", { count: "exact" })
        .eq("status", "open")
        .range(from, to)
        .order("created_at", { ascending: false });
      return { data: data ?? [], total: count ?? 0 };
    },
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ["opportunity", id],
    queryFn: () => supabase.from("requests").select("*,...").eq("id", id).single(),
    enabled: !!id,
  });
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertRequest) => supabase.from("requests").insert(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["opportunities"] }),
  });
}
```

**Regras:**
- 1 hook file por dominio, nunca misturar dominios
- Toda query de listagem usa `.range(from, to)` — **sem excecao**
- React Query para cache; `staleTime: 30_000` padrao
- Realtime: `useEffect` com cleanup obrigatorio no `return`

### 3.4 Como adicionar paginas sem quebrar as existentes

```
CHECKLIST para adicionar pagina nova:

1. Criar arquivo em src/pages/<dominio>/NovaPagina.tsx
2. Criar hook em src/hooks/use<Dominio>.ts (se query nova)
3. Adicionar rota em App.tsx:
   - Se stub existe: substituir <Navigate to="/dashboard" replace /> pelo componente
   - Se rota nova: adicionar <Route> dentro do <ProtectedRoute><Layout /></ProtectedRoute>
4. Se precisa de role guard: envolver com <RoleGuard role="anfitriao|viajante">
5. Atualizar TopNavbar.tsx se item de navegacao novo
6. Rodar build para verificar TypeScript (npm run build)

REGRAS:
  - Nunca renomear rotas existentes (quebra bookmarks + deep links)
  - Lazy loading: React.lazy() + <Suspense> para paginas novas
  - Prefetch em hover: queryClient.prefetchQuery no onMouseEnter de links
```

---

## 4) RISCOS TECNICOS (prioridade decrescente)

### P0 — Criticos

| # | Risco | Descricao | Mitigacao |
|---|-------|-----------|-----------|
| 1 | **Falta de paginacao** | `Opportunities.tsx` faz `select` sem `limit` — retorna TODOS os registros. Com crescimento, vai travar o browser. | Adicionar `.range(from, to)` em TODA query de listagem. Criar `PaginationControls` reutilizavel. Padrao: 20 itens/pagina. |
| 2 | **SignUp sem transacao** | `AuthContext.signUp` faz 4 operacoes sequenciais (auth → org → profile → role). Se falhar no passo 3, usuario fica com conta sem perfil. | Mover para Supabase Edge Function com `BEGIN/COMMIT/ROLLBACK`. Ou no minimo: try/catch com rollback manual (delete org se profile falhar). |
| 3 | **Auth/RLS multi-tenant** | RLS usa `organization_id` mas `signUp` cria org sem vincular atomicamente. Admin role existe no enum mas nao ha UI. Nenhuma verificacao de email ativa. | Auditar todas as 20 RLS policies. Ativar email confirmation em producao. Implementar admin panel ou usar Supabase Studio. |

### P1 — Altos

| # | Risco | Descricao | Mitigacao |
|---|-------|-----------|-----------|
| 4 | **Arquivos gigantes** | `Register.tsx` = 910 linhas, `Dashboard.tsx` = 570 linhas. Dificil de manter e testar. | Extrair cada step do Register como componente. Extrair `ViajanteDashboard` e `AnfitriaoDashboard` para arquivos separados. Regra: max 300 linhas por arquivo. |
| 5 | **Acoplamento do AuthContext** | Acumula session + profile + org + role + signUp + signIn + signOut. Muita responsabilidade. | Separar em `AuthContext` (session only) + `UserContext` (profile, org, role). Mover signUp/signIn para hooks dedicados. |
| 6 | **Zero code splitting** | Todas as paginas importadas diretamente no `App.tsx`. Bundle inicial carrega tudo. | Usar `React.lazy()` + `<Suspense>` para todas as rotas protegidas. Reduzir bundle inicial em ~60%. |
| 7 | **Uploads nao implementados** | `Register.tsx` tem placeholders de upload (documento, selfie, curriculo, fotos) mas nenhum funciona. | Criar `FileUploader` generico com: validacao de tipo/tamanho, compressao de imagem client-side, upload para Supabase Storage, progress bar. |

### P2 — Medios

| # | Risco | Descricao | Mitigacao |
|---|-------|-----------|-----------|
| 8 | **Duplicacao de componentes** | Cards de oportunidade sao inline em `Opportunities.tsx` e `Dashboard.tsx`. Sem componente `OpportunityCard` compartilhado. | Extrair para `shared/OpportunityCard.tsx` e reusar em ambos. |
| 9 | **Performance de queries (N+1)** | `Opportunities.tsx` faz join explícito `organizations!requests_organization_id_fkey(name)`. OK agora, mas queries futuras podem gerar N+1 se nao usar joins. | Sempre usar `.select("*, tabela!fk(campos)")` para evitar N+1. Adicionar indices compostos nas tabelas novas (ver secao 2.4). |
| 10 | **Realtime memory leaks** | Chat e Notifications vao usar Supabase Realtime. Se subscriptions nao forem cleaned up, leak de memoria. | Padrao: criar subscription dentro de `useEffect` com `return () => supabase.removeChannel(channel)`. Nunca criar subscription fora de useEffect. |
| 11 | **Sem testes** | Zero testes unitarios ou de integracao. Refatoracoes futuras ficam arriscadas. | Adicionar testes para hooks criticos (`useAuth`, `useOpportunities`). Testar RLS policies com `supabase test`. |
| 12 | **Sem rate limiting** | Inserts de proposals, messages, posts nao tem rate limit. Permite spam. | Adicionar rate limiting via Supabase Edge Function ou RLS com `count` check (ex: max 5 proposals por dia). |
