# TravelConnect — Design System & Implementation Spec

> **Data:** 2026-02-19
> **Fonte:** Figma `za7BFAK3VyuViErPY5xO2D` (178 frames extraidos)
> **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui

---

## (A) TABELA DE TOKENS

### A.1 Cores — Palette

| Token Figma (CSS var) | Hex | Tailwind Token | Uso |
|---|---|---|---|
| `--palete/color-1` | `#364763` | `navy.DEFAULT` / `primary` | Navbar bg, botoes primarios, textos destaque |
| `--palete/color-2` | `#CF3952` | `rose.DEFAULT` / `secondary` | CTAs, filtro ativo, FAB, badges urgentes |
| `--palete/color-1-10` | `rgba(54,71,99,0.1)` | `navy.DEFAULT/10` | Icon containers, hover states, info boxes |

### A.2 Cores — Background

| Token Figma | Hex | Tailwind Token | Uso |
|---|---|---|---|
| `--background/primary-background` | `#FFFFFF` | `white` / `card` | Cards, modals, inputs |
| `--background/secundary-background` | `#F3F3F3` | `bg-muted` | Page background, info panels |
| `--background/border` | `#DBDBDB` | `border` | Todas as bordas de cards/inputs |

### A.3 Cores — Texto

| Token Figma | Hex | Tailwind Token | Uso |
|---|---|---|---|
| `--text/primary-text` | `#12100F` | `foreground` | Titulos, labels |
| `--text/secundary-text` | `#3F444C` | `text-muted-foreground` | Descricoes, metadata |
| `--text/alternate` | `#9C9C9C` | `text-placeholder` (custom) | Placeholders |
| `--text/info` | `#FFFFFF` | `white` | Texto sobre fundo navy/rose |
| — | `#1E2939` | `text-heading` (custom) | Headers de secao |
| — | `#4A5565` | `text-subtle` (custom) | Subtitulos, descricoes longas |
| — | `#364153` | `text-label` (custom) | Labels de formulario |
| — | `#6A7282` | `text-hint` (custom) | Hints, contadores |
| — | `#101828` | `text-chat` (custom) | Nomes em chat list |

### A.4 Cores — Status (Material Design palette)

| Token Figma | Hex | Tailwind Token | Uso |
|---|---|---|---|
| `--blue/50` | `#E3F2FD` | `status-blue.bg` | Badge bg (skills, tags) |
| `--blue/900` | `#0D47A1` | `status-blue.text` | Badge text |
| `--red/50` | `#FEEBEE` | `status-red.bg` | Skill obrigatoria bg |
| `--red/300` | `#E57373` | `status-red.border` | Skill obrigatoria border |
| `--red/900` | `#B71C1C` | `status-red.text` | Skill obrigatoria text |
| `--green/50` | `#E8F5E9` | `status-green.bg` | Skill opcional bg |
| `--green/300` | `#81C784` | `status-green.border` | Skill opcional border |
| `--green/800` | `#2E7D32` | `status-green.dot` | Dot indicator |
| `--green/900` | `#1B5E20` | `status-green.text` | Skill opcional text |
| `--grey/300` | `#E0E0E0` | `gray-300` | Botao secundario/cancelar |
| — | `#00C950` | `online` | Indicador online (chat) |

### A.5 Tipografia

| Estilo | Font Family | Weight | Size | Line Height | Uso |
|---|---|---|---|---|---|
| **Heading** | Montserrat | Medium (500) | 16px | normal | Titulos de secao, labels |
| **Body** | Montserrat | Regular (400) | 16px | normal | Texto corrido, descricoes |
| **Body Small** | Montserrat | Regular (400) | 14px | normal | Metadata, subtitulos |
| **Caption** | Montserrat | Medium (500) | 14px | normal | Badges, botoes, tags |
| **Nav** | Montserrat | Regular (400) | 16px | normal | Links do navbar |
| **Tiny** | Montserrat | Medium (500) | 12px | normal | Contadores, credits |
| **Emoji** | Arimo | Regular (400) | 36px | 40px | Bandeiras, emojis |

> **Nota:** Montserrat ja esta no projeto. Arimo so aparece em emojis — usar font-stack sistema.

### A.6 Espacamento (Spacing Scale)

| Token | Valor | Uso |
|---|---|---|
| `sp-1` | 4px | Gap minimo, padding interno badge |
| `sp-2` | 6px | Gap badges, icon gap |
| `sp-3` | 8px | Gap entre items, padding badges |
| `sp-4` | 10px | Gap listas, padding info boxes |
| `sp-5` | 12px | Padding inputs, gap modals |
| `sp-6` | 16px | Gap padrao, padding cards, gap entre secoes |
| `sp-7` | 17px | Padding comodidade cards |
| `sp-8` | 24px | Padding navbar horizontal |
| `sp-10` | 32px | Gap entre nav links |
| `sp-20` | 160px | Padding horizontal do conteudo (desktop) |

### A.7 Border Radius

| Token | Valor | Uso |
|---|---|---|
| `rounded-DEFAULT` | 10px | Cards, inputs, botoes, modals |
| `rounded-lg` | 14px | Textarea, comodidade cards, info boxes |
| `rounded-full` | 9999px | Avatares, badges pill, FAB, online dot |
| `rounded-xl` | 100px | Avatares grandes |

### A.8 Shadows

| Token | Valor | Uso |
|---|---|---|
| `shadow-fab` | `0px 10px 15px rgba(0,0,0,0.1)` | FAB (new message button) |

### A.9 Icones

> **Fonte:** Flaticon (fi-rr-*) — consistente em todo o Figma.
> **Recomendacao:** Usar `react-icons/fi` (Feather Icons) como substituto proximo,
> ou baixar o pack Flaticon regular rounded.
> Icones identificados: home, briefcase, file-check, forward, star, globe,
> search, edit, eye, arrow-left, pin, paperclip, send, close, check-circle,
> info-circle, map-pin, clock, users, wifi, utensils, bed, door-open,
> shield-check, language, microphone, chevron-down.

---

## (B) INVENTARIO DE COMPONENTES

### B.1 Layout

| Componente | Arquivo | Variantes | Descricao |
|---|---|---|---|
| **AppLayout** | `src/components/layout/AppLayout.tsx` | — | Wrapper: Navbar + content area (px-[160px] desktop) |
| **TopNavbar** | `src/components/layout/TopNavbar.tsx` | `Anfitriao`, `Viajante`, `ViajanteMob`, `HeaderViajanteMob` | Navbar navy com logo, links, credits, lang, avatar |
| **MobileBottomNav** | `src/components/layout/MobileBottomNav.tsx` | — | Tab bar mobile (home, briefcase, file, forward, star, globe) |
| **PageHeader** | `src/components/layout/PageHeader.tsx` | — | Back arrow + titulo + subtitulo + action buttons |

### B.2 Shared (Molecules)

| Componente | Arquivo | Props | Descricao |
|---|---|---|---|
| **StatusBadge** | `src/components/shared/StatusBadge.tsx` | `variant: 'blue' \| 'red' \| 'green' \| 'gray'`, `label` | Pill badge (skills, status, tags) |
| **SkillTag** | `src/components/shared/SkillTag.tsx` | `type: 'required' \| 'optional'`, `label`, `icon?` | Tag com icone + border colorida |
| **InfoBox** | `src/components/shared/InfoBox.tsx` | `variant: 'navy' \| 'gray'`, `icon?`, `children` | Box com fundo + border + icone + texto |
| **ListItem** | `src/components/shared/ListItem.tsx` | `icon`, `text` | Icone check/circle + texto (responsabilidades, requisitos) |
| **AmenityCard** | `src/components/shared/AmenityCard.tsx` | `icon`, `label` | Card vertical icone + texto (comodidades) |
| **UserCard** | `src/components/shared/UserCard.tsx` | `avatar`, `name`, `subtitle`, `stats[]` | Card de usuario com avatar, nome, metadata |
| **StatItem** | `src/components/shared/StatItem.tsx` | `icon`, `label`, `value?` | Icone + texto (localizacao, rating, duracao) |
| **SearchInput** | `src/components/shared/SearchInput.tsx` | `placeholder`, `onSearch` | Input com icone search |
| **FilterTabs** | `src/components/shared/FilterTabs.tsx` | `tabs: {label, count, active}[]` | Tabs de filtro (Todas, Ativas, Finalizadas) |
| **ImageGallery** | `src/components/shared/ImageGallery.tsx` | `images: string[]`, `layout: 'grid' \| 'hero'` | Grid de imagens (1 grande + 4 pequenas) |
| **ChatListItem** | `src/components/shared/ChatListItem.tsx` | `avatar`, `name`, `lastMessage`, `pinned?`, `unread?`, `online?` | Item da lista de conversas |
| **OnlineIndicator** | `src/components/shared/OnlineIndicator.tsx` | `online: boolean` | Dot verde sobre avatar |
| **CreditsBadge** | `src/components/shared/CreditsBadge.tsx` | `count: number` | Badge de creditos no navbar |
| **LangSelector** | `src/components/shared/LangSelector.tsx` | `lang`, `onSelect` | Bandeira + dropdown |
| **Avatar** | Reuse `src/components/ui/avatar.tsx` | `size: 'sm' \| 'md' \| 'lg' \| 'xl'` | Sizes: 40, 56, 60, 74px |
| **EmptyState** | `src/components/shared/EmptyState.tsx` | `icon`, `title`, `description`, `action?` | Estado vazio para listas |

### B.3 Modals

| Componente | Arquivo | Figma Node | Descricao |
|---|---|---|---|
| **ApplyModal** | `src/components/modals/ApplyModal.tsx` | `13767:709` | Candidatar-se: info box + textarea + skills + botoes |
| **ApplicationDetailModal** | `src/components/modals/ApplicationDetailModal.tsx` | `13771:2210` | Detalhes da candidatura recebida |
| **ChatStartModal** | `src/components/modals/ChatStartModal.tsx` | `13766:2836` | Iniciar conversa com anfitriao |
| **ReviewModal** | `src/components/modals/ReviewModal.tsx` | `14010:6203` / `14024:3799` | Avaliar anfitriao/viajante (stars + comment) |
| **ConfirmLikeModal** | `src/components/modals/ConfirmLikeModal.tsx` | `13847:2443` | Confirmar favoritar (usa creditos) |
| **OpportunityCreatedModal** | `src/components/modals/OpportunityCreatedModal.tsx` | `13665:3854` | Sucesso ao criar oportunidade |
| **CoursePublishedModal** | `src/components/modals/CoursePublishedModal.tsx` | `13928:4375` | Sucesso ao publicar curso |

> **Base:** Todos os modals usam `shadcn/ui Dialog` internamente.
> Padrao: titulo + close(X) no header, content area, footer com 2 botoes (cancelar + confirmar).

### B.4 Primitivos (shadcn/ui — ja existentes, sem alterar)

- Button, Input, Textarea, Select, Dialog, Sheet, Badge, Avatar, Card,
  Tabs, Separator, ScrollArea, Skeleton, Toast, Tooltip, DropdownMenu

---

## (C) PLANO DE IMPLEMENTACAO — 11 PAGINAS MVP

### C.1 Paginas Prioritarias

| # | Pagina | Rota | Figma Ref (nodeId) | Role | Deps |
|---|--------|------|-------------------|------|------|
| 1 | **Inicio - Anfitriao** | `/anfitriao` | `14089:6453` | buyer | AppLayout, TopNavbar, StatItem |
| 2 | **Inicio - Viajante** | `/viajante` | `14111:3829` | supplier | AppLayout, TopNavbar, StatItem |
| 3 | **Detalhes Oportunidade - Anfitriao** | `/anfitriao/oportunidades/:id` | `13697:527` | buyer | PageHeader, ImageGallery, ListItem, SkillTag, AmenityCard, UserCard, InfoBox |
| 4 | **Detalhes Oportunidade - Viajante** | `/viajante/oportunidades/:id` | `13730:3856` | supplier | PageHeader, ImageGallery, ListItem, SkillTag, AmenityCard, UserCard, ApplyModal |
| 5 | **Candidaturas Oportunidade - Anfitriao** | `/anfitriao/oportunidades/:id/candidaturas` | `13697:1130` | buyer | PageHeader, FilterTabs, ChatListItem-like cards |
| 6 | **Candidaturas - Anfitriao** | `/anfitriao/candidaturas` | `13703:4003` | buyer | PageHeader, SearchInput, FilterTabs, ApplicationDetailModal |
| 7 | **Candidaturas - Viajante** | `/viajante/candidaturas` | `13744:817` | supplier | PageHeader, SearchInput, FilterTabs, StatusBadge |
| 8 | **Chat (Lista)** | `/chat` | `13932:2080` | both | PageHeader, SearchInput, ChatListItem, OnlineIndicator |
| 9 | **Chat (Conversa)** | `/chat/:conversationId` | `13936:2692` | both | MessageBubble (page-local), ChatInput (page-local), UserCard |
| 10 | **Perfil do Candidato** | `/anfitriao/candidatos/:profileId` | `13709:787` | buyer | UserCard, StatItem, SkillTag, StatusBadge |
| 11 | **Oportunidades - Viajante** | `/viajante/oportunidades` | `13730:4554` | supplier | SearchInput, FilterTabs, OpportunityCard (page-local) |

### C.2 Modals vinculados ao MVP

| Modal | Acionado por | Pagina |
|---|---|---|
| ApplyModal | Botao "Candidatar-se" | Detalhes Oportunidade - Viajante (#4) |
| ApplicationDetailModal | Click em candidatura | Candidaturas Oportunidade (#5), Candidaturas Anfitriao (#6) |
| ChatStartModal | Botao "Conversar" | Detalhes Oportunidade - Viajante (#4) |

### C.3 Ordem de Implementacao (dependencias)

```
FASE 0: Infraestrutura (1-2 dias)
├── Tokens no tailwind.config.ts
├── AppLayout + TopNavbar (refatorar existentes)
├── PageHeader
├── SearchInput, FilterTabs
└── StatusBadge, InfoBox, ListItem

FASE 1: Core Oportunidades (dependem da Fase 0)
├── #3  Detalhes Oportunidade - Anfitriao
│   ├── ImageGallery, SkillTag, AmenityCard, UserCard
│   └── StatItem
├── #4  Detalhes Oportunidade - Viajante
│   └── ApplyModal, ChatStartModal
└── #11 Oportunidades - Viajante (lista)
    └── OpportunityCard (page-local)

FASE 2: Candidaturas (dependem da Fase 1)
├── #5  Candidaturas da Oportunidade - Anfitriao
│   └── ApplicationDetailModal
├── #6  Candidaturas - Anfitriao (lista geral)
├── #7  Candidaturas - Viajante (lista geral)
└── #10 Perfil do Candidato - Anfitriao

FASE 3: Chat (paralelo com Fase 2)
├── #8  Chat Lista
│   └── ChatListItem, OnlineIndicator
└── #9  Chat Conversa
    └── MessageBubble, ChatInput (page-local)

FASE 4: Dashboards (paralelo com Fase 2/3)
├── #1  Inicio - Anfitriao
└── #2  Inicio - Viajante
```

### C.4 Grafo de Dependencias de Componentes

```
TopNavbar ─────────────┐
PageHeader ────────────┤
SearchInput ───────────┤
FilterTabs ────────────┤── AppLayout (wrapper)
StatusBadge ───────────┘
       │
       ├── Detalhes Oportunidade ──┬── ImageGallery
       │                           ├── ListItem
       │                           ├── SkillTag
       │                           ├── AmenityCard
       │                           ├── UserCard ──── StatItem
       │                           └── InfoBox
       │
       ├── Candidaturas ──┬── ApplicationDetailModal
       │                  └── ChatListItem-like
       │
       ├── Chat ──┬── ChatListItem ── OnlineIndicator
       │          └── MessageBubble (local)
       │
       └── Modals ──┬── ApplyModal
                    ├── ApplicationDetailModal
                    └── ChatStartModal
```

---

## (D) CONVENCOES DO PROJETO

### D.1 Estrutura de Diretories

```
src/
├── components/
│   ├── layout/           # AppLayout, TopNavbar, MobileBottomNav, PageHeader
│   ├── shared/           # StatusBadge, SkillTag, InfoBox, ListItem, etc.
│   ├── modals/           # ApplyModal, ApplicationDetailModal, etc.
│   └── ui/               # shadcn/ui primitivos (nao alterar)
├── pages/
│   ├── auth/             # Login, Register, SelectRole
│   ├── anfitriao/        # Inicio, Oportunidades, Candidaturas, Perfil
│   ├── viajante/         # Inicio, Oportunidades, Candidaturas, Favoritos
│   ├── chat/             # ChatList, ChatConversation
│   └── shared/           # Profile (visualizacao publica), NotFound
├── hooks/                # useAuth, useChat, useOpportunities, etc.
├── contexts/             # AuthContext (existente)
├── lib/                  # roles.ts (existente), utils, api helpers
├── styles/               # tokens.ts (export dos tokens para JS se necessario)
└── integrations/         # supabase/ (existente)
```

### D.2 Rotas React Router v6

```tsx
// Publicas
/                           → Index (landing)
/login                      → Login
/register                   → Register
/select-role                → SelectRole

// Anfitriao (buyer)
/anfitriao                  → DashboardAnfitriao
/anfitriao/oportunidades    → OportunidadesAnfitriao
/anfitriao/oportunidades/nova → NovaOportunidade (wizard 4 steps)
/anfitriao/oportunidades/:id → DetalhesOportunidadeAnfitriao
/anfitriao/oportunidades/:id/candidaturas → CandidaturasOportunidade
/anfitriao/candidaturas     → CandidaturasAnfitriao (todas)
/anfitriao/candidatos/:profileId → PerfilCandidato
/anfitriao/avaliacoes       → AvaliacoesAnfitriao

// Viajante (supplier)
/viajante                   → DashboardViajante
/viajante/oportunidades     → OportunidadesViajante
/viajante/oportunidades/:id → DetalhesOportunidadeViajante
/viajante/candidaturas      → CandidaturasViajante
/viajante/favoritos         → FavoritosViajante

// Compartilhadas
/chat                       → ChatList
/chat/:conversationId       → ChatConversation
/comunidade                 → ComunidadeFeed
/academy                    → AcademyCatalog
/perfil                     → MeuPerfil (edicao)
/perfil/:profileId          → PerfilPublico
/notificacoes               → Notificacoes
```

### D.3 Regras de Codigo

| Regra | Detalhe |
|---|---|
| **Max linhas por arquivo** | 300 (quebrar em sub-componentes) |
| **Naming pages** | PascalCase, dominio no nome: `DetalhesOportunidadeAnfitriao.tsx` |
| **Naming components** | PascalCase: `StatusBadge.tsx`, `ChatListItem.tsx` |
| **Naming hooks** | camelCase com prefixo use: `useOpportunities.ts` |
| **Componente shared vs page-local** | Se usado em 2+ paginas → shared. Senao, co-located no dir da pagina |
| **Props** | Interface nomeada: `interface StatusBadgeProps { ... }` |
| **Export** | Named export (nao default) para componentes. Default para pages |
| **CSS** | Tailwind classes. Zero CSS custom exceto tokens no index.css |
| **Estado server** | React Query v5 (ja configurado) |
| **Estado local** | useState/useReducer. Context so para auth/theme |
| **Formularios** | react-hook-form + zod (ja no projeto) |
| **Icons** | Lucide React (ja no projeto via shadcn) como primary. Flaticon SVG para icones especificos do Figma |

### D.4 Mapeamento Figma → Componente

| Padrao Figma | Componente |
|---|---|
| `<Navbar prop="...">` | `<TopNavbar role="anfitriao" \| "viajante" />` |
| `Container` com `bg-white border rounded-[10px] p-[16px]` | `<Card>` (shadcn) |
| `Button` com `bg-[--palete/color-1] rounded-[10px] px-[16px] py-[12px]` | `<Button variant="default">` |
| `Button` com `border border-[--palete/color-1] rounded-[10px]` | `<Button variant="outline">` |
| `Button` com `bg-[--palete/color-2]` | `<Button variant="secondary">` (ajustar cor) |
| `Button` com `bg-[--grey/300]` | `<Button variant="ghost">` ou custom `cancel` |
| `Text Input` com search icon | `<SearchInput>` (custom) |
| `Status` pill badge | `<StatusBadge>` ou `<Badge>` (shadcn) |
| `Modal` com close + content + footer | `<Dialog>` (shadcn) |
| `Container` com avatar + name + stats | `<UserCard>` (custom) |

---

## (E) TOKENS A ADICIONAR NO TAILWIND

> Alteracoes necessarias em `tailwind.config.ts` e `src/index.css`.

### E.1 Novas cores no tailwind.config.ts

```ts
// Adicionar dentro de theme.extend.colors:
tc: {
  navy: {
    DEFAULT: '#364763',
    10: 'rgba(54,71,99,0.1)',
  },
  rose: '#CF3952',
  bg: {
    primary: '#FFFFFF',
    secondary: '#F3F3F3',
    border: '#DBDBDB',
  },
  text: {
    primary: '#12100F',
    secondary: '#3F444C',
    placeholder: '#9C9C9C',
    heading: '#1E2939',
    subtle: '#4A5565',
    label: '#364153',
    hint: '#6A7282',
    chat: '#101828',
  },
  status: {
    blue: { bg: '#E3F2FD', text: '#0D47A1' },
    red: { bg: '#FEEBEE', border: '#E57373', text: '#B71C1C' },
    green: { bg: '#E8F5E9', border: '#81C784', text: '#1B5E20', dot: '#2E7D32' },
  },
  online: '#00C950',
},
```

### E.2 Novas variaveis no index.css :root

```css
/* Figma direct tokens */
--tc-navy: #364763;
--tc-rose: #CF3952;
--tc-bg-secondary: #F3F3F3;
--tc-border: #DBDBDB;
--tc-text-primary: #12100F;
--tc-text-secondary: #3F444C;
--tc-text-placeholder: #9C9C9C;
```

---

## (F) INVENTARIO COMPLETO DE FRAMES FIGMA

### F.1 Desktop — Por Dominio

**Auth (8 frames)**
| Frame | Node ID | MVP? |
|---|---|---|
| Selecionar Acesso | `13603:4` | Existente |
| Login | `13628:1628` | Existente |
| Login Viajante | `13794:1928` | Existente |
| Cadastro 1 - Viajante | `13794:1829` | Existente |
| Cadastro 2 - Viajante | `13794:2050` | Fase 2 |
| Cadastro 3 - Viajante | `13794:2213` | Fase 2 |
| Cadastro 4 - Viajante | `13794:2430` | Fase 2 |
| Cadastro 1 - Anfitriao | `13628:1174` | Existente |
| Cadastro 2 - Anfitriao | `13606:78` | Fase 2 |
| Cadastro 3 - Anfitriao (7 variantes por tipo) | `13628:1265` + 6 | Fase 2 |
| Cadastro 4 - Anfitriao | `13628:1495` | Fase 2 |

**Dashboard (4 frames)**
| Frame | Node ID | MVP? |
|---|---|---|
| Inicio - Anfitriao | `14089:6453` | **MVP #1** |
| Inicio - Viajante | `14111:3829` | **MVP #2** |
| Pagina Inicial (landing) | `14125:6510` | Existente |

**Oportunidades (8 frames)**
| Frame | Node ID | MVP? |
|---|---|---|
| Oportunidades - Anfitriao | `13611:2368` | Existente (refatorar) |
| Detalhes Oportunidade - Anfitriao | `13697:527` | **MVP #3** |
| Detalhes Oportunidade - Viajante | `13730:3856` | **MVP #4** |
| Oportunidades - Viajante | `13730:4554` | **MVP #11** |
| Nova Oportunidade 1-4 | `13647:2920` + 3 | Fase 2 |

**Candidaturas (4 frames)**
| Frame | Node ID | MVP? |
|---|---|---|
| Candidaturas Oportunidade - Anfitriao | `13697:1130` | **MVP #5** |
| Candidaturas - Anfitriao | `13703:4003` | **MVP #6** |
| Candidaturas - Viajante | `13744:817` | **MVP #7** |
| Perfil do Candidato - Anfitriao | `13709:787` | **MVP #10** |

**Chat (3 frames)**
| Frame | Node ID | MVP? |
|---|---|---|
| Chat - Viajante (lista) | `13932:2080` | **MVP #8** |
| Chat - Viajante (conversa) | `13936:2692` | **MVP #9** |
| Chat - Anfitriao | `14090:7272` | Fase 2 |

**Favoritos (1 frame)**
| Frame | Node ID | MVP? |
|---|---|---|
| Favoritos - Viajante | `13860:2717` | Fase 2 |

**Academy (10+ frames)**
| Frame | Node ID | MVP? |
|---|---|---|
| Academy - Anfitriao | `13985:3449` | Fase 2 |
| Academy - Viajante | `13864:6426` | Fase 2 |
| Detalhes Curso | `13864:4793` | Fase 2 |
| Assistir Curso (12 variantes) | `13946:2010` + | Fase 3 |
| Criar Curso 1-7 | `13885:2198` + | Fase 3 |

**Avaliacoes (2 frames)**
| Frame | Node ID | MVP? |
|---|---|---|
| Avaliacoes - Anfitriao | `14024:3363` | Fase 2 |

**Comunidade (6 frames)**
| Frame | Node ID | MVP? |
|---|---|---|
| Comunidade - Feed | `14096:6007` | Fase 2 |
| Comunidade - Anfitrioes | `14096:5342` | Fase 2 |
| Comunidade - Viajante | `14096:5663` | Fase 2 |

**Perfil (12 frames)**
| Frame | Node ID | MVP? |
|---|---|---|
| Perfil - Viajante (edicao) | `13794:2685` | Fase 2 |
| Perfil - Anfitriao (edicao) | `14088:3323` | Fase 2 |
| Perfil Anfitriao (Sobre) - public | `14096:6667` | Fase 2 |
| Perfil Viajante (Sobre) - public | `14096:7048` | Fase 2 |
| Perfil Viajante (Experiencias) | `14096:7193` | Fase 3 |
| Perfil Viajante (Portfolio) | `14096:7467` | Fase 3 |
| Perfil Anfitriao (Oportunidades) | `14096:7666` | Fase 3 |
| Perfil Anfitriao (Publicacoes) | `14096:7910` | Fase 3 |
| Perfil Anfitriao (Avaliacoes) | `14096:8085` | Fase 3 |
| Perfil Viajante (Avaliacoes) | `14096:6836` | Fase 3 |

**Creditos (2 frames)**
| Frame | Node ID | MVP? |
|---|---|---|
| Pacotes Creditos - Anfitriao | `14113:5845` | Fase 2 |
| Comprar Creditos - Viajante | `13848:2501` | Fase 2 |

**Notificacoes (1 frame)**
| Frame | Node ID | MVP? |
|---|---|---|
| Notificacoes | `13928:5560` | Fase 2 |

**Integracoes (1 frame)**
| Frame | Node ID | MVP? |
|---|---|---|
| Integracoes - Anfitriao | `14113:5306` | Fase 3 |

### F.2 Modals (10 frames)

| Frame | Node ID | MVP? |
|---|---|---|
| Modal - Candidatar-se | `13767:709` | **MVP** |
| Modal - Detalhes Candidatura | `13771:2210` | **MVP** |
| Modal - Conversar com Anfitriao | `13766:2836` | **MVP** |
| Modal - Avaliar Anfitriao | `14010:6203` | Fase 2 |
| Modal - Avaliar Viajante | `14024:3799` | Fase 2 |
| Modal - Confirmar Like | `13847:2443` | Fase 2 |
| Modal - Oportunidade criada | `13665:3854` | Fase 2 |
| Modal - Cadastro aprovado | `13697:1121` | Fase 2 |
| Modal - Curso Publicado | `13928:4375` | Fase 3 |
| Modal - Novo Post | `14173:5203` | Fase 3 |

### F.3 Mobile (30+ frames)

> Todos os frames com sufixo "- Mob". Implementacao responsiva
> sera feita com Tailwind breakpoints, nao como paginas separadas.
> Bottom nav mobile: `MobileBottomNav` component.

### F.4 Componentes Standalone (3 frames)

| Frame | Node ID | Descricao |
|---|---|---|
| Navbar | `13714:461` | Componente Navbar (4 variantes) |
| Button | `14068:5767` | Componente Button (integration card) |
| Container | `13745:2089` | Pattern de container/card |

---

## RESUMO QUANTITATIVO

| Metrica | Valor |
|---|---|
| Total frames Figma | 178 |
| Tokens de cor | 25 |
| Font styles | 7 |
| Componentes shared novos | 16 |
| Componentes layout novos/refatorados | 4 |
| Modals novos | 7 (3 MVP) |
| Paginas MVP | 11 |
| Rotas novas | 15 |
| Fases de implementacao | 4 (0=infra, 1=oportunidades, 2=candidaturas, 3=chat/dashboards) |
