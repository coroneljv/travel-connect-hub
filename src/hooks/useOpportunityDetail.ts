import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OpportunityDetail {
  id: string;
  title: string;
  destination: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  created_at: string;
  organizationName: string;
  hostName: string;
  hostAvatarUrl: string | null;

  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  duration: string;
  matchPercent: number;
  minMatchPercent: number;
  isEligible: boolean;
  compensationType: string;
  workHours: string;
  responsibilities: string[];
  skills: string[];
  tipText: string;
  superLikeCredits: number;
  houseRules: string | null;
}

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop",
];

function buildFromRow(row: any): OpportunityDetail {
  // Images: use real photos from DB, fallback to stock images
  const images =
    row.photos && row.photos.length > 0
      ? row.photos
      : FALLBACK_IMAGES;

  // Category from opportunity_type
  const category =
    row.opportunity_type === "trabalho_pago"
      ? "Trabalho Pago"
      : row.opportunity_type === "voluntariado"
        ? "Voluntariado"
        : row.opportunity_type || "Oportunidade";

  // Duration from duration_min / duration_max
  let duration = "";
  if (row.duration_min && row.duration_max) {
    duration = `${row.duration_min} - ${row.duration_max}`;
  } else if (row.duration_min) {
    duration = row.duration_min;
  } else if (row.duration_max) {
    duration = row.duration_max;
  }

  // Compensation from accommodation_type + meals
  const compensationParts: string[] = [];
  if (row.accommodation_type) compensationParts.push(row.accommodation_type);
  if (row.meals && row.meals.length > 0) compensationParts.push(row.meals.join(" + "));
  const compensationType =
    compensationParts.length > 0
      ? compensationParts.join(" • ")
      : "A combinar";

  // Work hours from hours_per_day + days_per_week
  let workHours = "";
  if (row.hours_per_day && row.days_per_week) {
    const weeklyHours = row.hours_per_day * row.days_per_week;
    workHours = `${weeklyHours} horas/semana (${row.hours_per_day}h/dia, ${row.days_per_week} dias/semana)`;
  } else if (row.hours_per_day) {
    workHours = `${row.hours_per_day} horas/dia`;
  }

  // Responsibilities from task_description (split by newlines or use as single item)
  const responsibilities: string[] = [];
  if (row.task_description) {
    const lines = row.task_description
      .split(/\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);
    responsibilities.push(...lines);
  }

  // Skills from required_skills
  const skills: string[] = row.required_skills || [];

  return {
    id: row.id,
    title: row.title,
    destination: row.destination || row.organizations?.city
      ? [row.organizations?.city, row.organizations?.state].filter(Boolean).join(", ") || row.destination || ""
      : "",
    description: row.description,
    start_date: row.start_date,
    end_date: row.end_date,
    budget_min: row.budget_min,
    budget_max: row.budget_max,
    status: row.status,
    created_at: row.created_at,
    organizationName: row.organizations?.name ?? "Desconhecido",
    hostName: row.profiles?.full_name ?? "Anfitrião",
    hostAvatarUrl: row.profiles?.avatar_url ?? null,

    images,
    category,
    rating: 0,
    reviewCount: 0,
    duration,
    matchPercent: 0,
    minMatchPercent: 0,
    isEligible: true,
    compensationType,
    workHours,
    responsibilities,
    skills,
    tipText:
      "Entre em contato com o anfitrião antes de se candidatar para tirar dúvidas e se destacar!",
    superLikeCredits: 0,
    houseRules: row.house_rules ?? null,
  };
}

export function useOpportunityDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["opportunity-detail", id],
    queryFn: async () => {
      if (!id) throw new Error("ID não fornecido");

      const { data, error } = await supabase
        .from("requests")
        .select(
          "*, organizations!requests_organization_id_fkey(name, city, state, country), profiles!requests_created_by_fkey(full_name, avatar_url)"
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return buildFromRow(data);
    },
    enabled: !!id,
  });
}
