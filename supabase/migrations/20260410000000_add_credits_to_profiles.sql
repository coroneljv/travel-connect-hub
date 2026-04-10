-- Adiciona coluna de créditos ao perfil do usuário
-- Créditos são comprados via Stripe e consumidos ao publicar vagas

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS credits integer NOT NULL DEFAULT 0;

-- Garante que créditos nunca sejam negativos
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_credits_non_negative CHECK (credits >= 0);

COMMENT ON COLUMN public.profiles.credits IS 'Saldo de Host Credits comprados via Stripe';
