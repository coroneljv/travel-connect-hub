// Supabase Edge Function — cria uma Stripe Checkout Session
// Deploy: npx supabase functions deploy create-checkout-session
// Secrets: npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...

import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-04-10",
  httpClient: Stripe.createFetchHttpClient(),
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PLANS: Record<
  string,
  { name: string; credits: number; amountInCents: number }
> = {
  starter:      { name: "Starter",      credits: 5,   amountInCents: 4990  },
  professional: { name: "Professional", credits: 15,  amountInCents: 11990 },
  business:     { name: "Business",     credits: 30,  amountInCents: 19990 },
  enterprise:   { name: "Enterprise",   credits: 100, amountInCents: 49990 },
};

Deno.serve(async (req) => {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const { planId, userId } = await req.json() as {
      planId: string;
      userId?: string;
    };

    const plan = PLANS[planId];
    if (!plan) {
      return new Response(
        JSON.stringify({ error: "Plano inválido" }),
        { status: 400, headers: { ...CORS, "Content-Type": "application/json" } },
      );
    }

    const origin = req.headers.get("origin") ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Travel Connect — Plano ${plan.name} (${plan.credits} Créditos)`,
              description: `${plan.credits} Host Créditos para publicar vagas na plataforma Travel Connect`,
            },
            unit_amount: plan.amountInCents, // centavos
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/credits?success=true&plan=${planId}`,
      cancel_url:  `${origin}/credits?canceled=true`,
      metadata: {
        userId:  userId ?? "",
        planId,
        credits: String(plan.credits),
      },
      // Habilita ajuste de quantidade
      payment_intent_data: {
        metadata: {
          userId:  userId ?? "",
          planId,
          credits: String(plan.credits),
        },
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...CORS, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } },
    );
  }
});
