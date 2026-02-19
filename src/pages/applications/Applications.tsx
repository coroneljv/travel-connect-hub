import { useState } from "react";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ApplicationCard from "./ApplicationCard";

const PAGE_SIZE = 10;

export default function Applications() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["my-applications", user?.id, page],
    queryFn: async () => {
      if (!user?.id) throw new Error("Nao autenticado");

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("proposals")
        .select(
          "id, status, message, created_at, request_id, requests!proposals_request_id_fkey(title, destination, organizations!requests_organization_id_fkey(name))",
          { count: "exact" }
        )
        .eq("supplier_profile_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        items: data ?? [],
        total: count ?? 0,
      };
    },
    enabled: !!user?.id,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-base font-medium text-tc-text-primary">
          Minhas Candidaturas
        </h1>
        <p className="text-sm text-tc-text-hint">
          Acompanhe o status das suas candidaturas
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white border border-border rounded-md p-5 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-6 w-20 rounded-pill" />
              </div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-36" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <h2 className="text-xl font-semibold text-destructive">
            Erro ao carregar
          </h2>
          <p className="text-tc-text-hint">
            {(error as Error)?.message || "Tente novamente mais tarde."}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white border border-border rounded-md">
          <FileText className="h-12 w-12 text-tc-text-placeholder" />
          <h2 className="text-base font-medium text-tc-text-primary">
            Nenhuma candidatura ainda
          </h2>
          <p className="text-sm text-tc-text-hint text-center max-w-md">
            Quando voce se candidatar a uma oportunidade, ela aparecera aqui
            para voce acompanhar o status.
          </p>
        </div>
      ) : (
        <>
          {/* Count */}
          <p className="text-sm text-tc-text-hint">
            {total} candidatura{total !== 1 ? "s" : ""}
          </p>

          {/* List */}
          <div className="space-y-4">
            {items.map((item: any) => {
              const req = item.requests;
              return (
                <ApplicationCard
                  key={item.id}
                  id={item.id}
                  requestId={item.request_id}
                  requestTitle={req?.title ?? "Oportunidade"}
                  destination={req?.destination ?? ""}
                  hostName={req?.organizations?.name ?? "Anfitriao"}
                  status={item.status}
                  message={item.message}
                  createdAt={item.created_at}
                />
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <span className="text-sm text-tc-text-secondary">
                {page + 1} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Proxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
