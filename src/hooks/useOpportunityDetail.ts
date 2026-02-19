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

  // TODO: substituir por colunas reais quando existirem no DB
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
}

// TODO: substituir por imagens reais do DB
const IMAGE_SETS = [
  // Hotel na praia
  [
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop",
  ],
  // Pousada ecologica / natureza
  [
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop",
  ],
  // Hostel / surf / aventura
  [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1502680390548-bdbac40e4ce2?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=600&h=400&fit=crop",
  ],
  // Amazonia / eco resort
  [
    "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop",
  ],
  // Retiro yoga / holístico
  [
    "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=400&fit=crop",
  ],
];

function pickImageSet(id: string): string[] {
  // Simple hash from ID to pick a consistent image set
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return IMAGE_SETS[Math.abs(hash) % IMAGE_SETS.length];
}

// TODO: cada campo mock sera substituido por dados reais do DB
function enrichWithMockData(dbRow: {
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
  organizations: { name: string } | null;
  profiles: { full_name: string; avatar_url: string | null } | null;
}): OpportunityDetail {
  return {
    id: dbRow.id,
    title: dbRow.title,
    destination: dbRow.destination,
    description: dbRow.description,
    start_date: dbRow.start_date,
    end_date: dbRow.end_date,
    budget_min: dbRow.budget_min,
    budget_max: dbRow.budget_max,
    status: dbRow.status,
    created_at: dbRow.created_at,
    organizationName: dbRow.organizations?.name ?? "Desconhecido",
    hostName: dbRow.profiles?.full_name ?? "Anfitriao",
    hostAvatarUrl: dbRow.profiles?.avatar_url ?? null,

    // TODO: substituir por request_images ou requests.images JSONB
    images: pickImageSet(dbRow.id),
    // TODO: substituir por requests.category
    category: "Voluntariado",
    // TODO: computar a partir da tabela reviews
    rating: 4.9,
    reviewCount: 48,
    // TODO: computar a partir de end_date - start_date
    duration: "1 mes",
    // TODO: computar via algoritmo de matching
    matchPercent: 95,
    minMatchPercent: 75,
    isEligible: true,
    // TODO: substituir por requests.compensation
    compensationType: "Quarto Privado \u2022 Cafe da manha",
    // TODO: substituir por requests.work_hours
    workHours: "25 horas/semana de trabalho",
    // TODO: substituir por requests.responsibilities JSONB
    responsibilities: [
      "Recepcao e check-in/check-out de hospedes",
      "Auxiliar com informacoes sobre a regiao",
      "Manter a area de recepcao organizada",
      "Apoiar na gestao de reservas",
      "Participar de atividades comunitarias",
    ],
    // TODO: buscar de profiles.skills do usuario atual
    skills: ["Atendimento ao Cliente", "Comunicacao", "Marketing"],
    tipText:
      "Entre em contato com o anfitriao antes de se candidatar para tirar duvidas e se destacar!",
    // TODO: buscar do sistema de creditos do usuario
    superLikeCredits: 5,
  };
}

export function useOpportunityDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["opportunity-detail", id],
    queryFn: async () => {
      if (!id) throw new Error("ID nao fornecido");

      const { data, error } = await supabase
        .from("requests")
        .select(
          "*, organizations!requests_organization_id_fkey(name), profiles!requests_created_by_fkey(full_name, avatar_url)"
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) return null;

      return enrichWithMockData(data);
    },
    enabled: !!id,
  });
}
