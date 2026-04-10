// Supabase Edge Function — webhook do Stripe para creditar usuário após pagamento
// Deploy: npx supabase functions deploy stripe-webhook
// Secrets: npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
//
// No painel do Stripe (developers → webhooks), configure o endpoint:
//   https://ajvqvpbfvpsqxjxyfiul.supabase.co/functions/v1/stripe-webhook
// Evento: checkout.session.completed

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-04-10",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    return new Response("Webhook secret não configurado", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
    );
  } catch (err: any) {
    return new Response(`Assinatura inválida: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, credits } = session.metadata ?? {};

    if (!userId || !credits) {
      console.error("Metadata ausente na session:", session.id);
      return new Response("Metadata ausente", { status: 400 });
    }

    const creditsToAdd = parseInt(credits, 10);

    // Busca o perfil atual para somar créditos
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Erro ao buscar perfil:", fetchError.message);
      return new Response("Erro ao buscar perfil", { status: 500 });
    }

    const currentCredits = (profile?.credits as number) ?? 0;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ credits: currentCredits + creditsToAdd })
      .eq("id", userId);

    if (updateError) {
      console.error("Erro ao atualizar créditos:", updateError.message);
      return new Response("Erro ao atualizar créditos", { status: 500 });
    }

    console.log(`✅ ${creditsToAdd} créditos adicionados ao usuário ${userId}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...CORS, "Content-Type": "application/json" },
  });
});
