import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOpportunityDetail } from "@/hooks/useOpportunityDetail";
import OpportunityDetailSections from "./OpportunityDetailSections";
import OpportunityDetailSidebar from "./OpportunityDetailSidebar";
import ApplyModal from "@/components/modals/ApplyModal";

function OpportunityDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-[180px] rounded-md" />
            <Skeleton className="h-[180px] rounded-md" />
            <Skeleton className="h-[180px] rounded-md" />
          </div>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-md" />
          <Skeleton className="h-24 rounded-md" />
          <Skeleton className="h-11 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } =
    useOpportunityDetail(id);
  const [showModal, setShowModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  if (isLoading) {
    return <OpportunityDetailSkeleton />;
  }

  if (isError) {
    return (
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
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <h2 className="text-xl font-semibold text-tc-text-primary">
          Oportunidade não encontrada
        </h2>
        <p className="text-tc-text-hint">
          Esta oportunidade pode ter sido removida ou o link está incorreto.
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 text-tc-text-primary hover:text-navy-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-medium text-tc-text-primary">
              Detalhes da Oportunidade
            </h1>
            <p className="text-sm text-tc-text-hint">
              Visualize os detalhes e realize sua candidatura
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <Heart
            className={`h-6 w-6 ${
              isLiked
                ? "fill-rose-500 text-rose-500"
                : "text-navy-500 fill-navy-500"
            }`}
          />
        </button>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <OpportunityDetailSections opportunity={data} />
        <OpportunityDetailSidebar
          opportunity={data}
          onApplyClick={() => setShowModal(true)}
        />
      </div>

      {/* Apply Modal */}
      <ApplyModal
        open={showModal}
        onOpenChange={setShowModal}
        opportunityTitle={data.title}
        opportunityId={data.id}
        skills={data.skills}
      />
    </div>
  );
}
