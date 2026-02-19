import {
  CheckCircle2,
  Send,
  Info,
  MessageCircle,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useChatStore } from "@/hooks/useChatStore";
import type { OpportunityDetail } from "@/hooks/useOpportunityDetail";

interface Props {
  opportunity: OpportunityDetail;
  onApplyClick: () => void;
}

function MatchCard({
  matchPercent,
  minMatchPercent,
  isEligible,
}: {
  matchPercent: number;
  minMatchPercent: number;
  isEligible: boolean;
}) {
  return (
    <div className="rounded-md border border-tc-green-border bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-tc-green-text" />
        <span className="text-sm font-medium text-tc-green-text">
          Seu Match
        </span>
      </div>
      <p className="text-3xl font-bold text-tc-text-primary">{matchPercent}%</p>
      <Progress
        value={matchPercent}
        className="h-2 bg-tc-green-bg [&>div]:bg-tc-green-text"
      />
      <div className="flex items-center justify-between text-xs">
        <span className="text-tc-text-hint">Minimo: {minMatchPercent}%</span>
        {isEligible && (
          <span className="flex items-center gap-1 text-tc-green-text font-medium">
            <CheckCircle2 className="h-3 w-3" />
            Elegivel
          </span>
        )}
      </div>
    </div>
  );
}

function CompensationCard({
  compensationType,
  workHours,
}: {
  compensationType: string;
  workHours: string;
}) {
  return (
    <div className="rounded-md border border-border bg-white p-4 space-y-1">
      <h4 className="text-sm font-medium text-tc-text-primary">
        Tipo de compensacao
      </h4>
      <p className="text-sm text-tc-text-secondary">{compensationType}</p>
      <p className="text-sm text-tc-text-secondary">{workHours}</p>
    </div>
  );
}

function TipInfoBox({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-navy-500 bg-navy-500/10 p-4 flex gap-3">
      <Info className="h-5 w-5 text-navy-500 shrink-0 mt-0.5" />
      <div className="text-sm text-navy-500">
        <span className="font-medium">Dica:</span>
        <br />
        {text}
      </div>
    </div>
  );
}

function SuperLikeSection({ credits }: { credits: number }) {
  return (
    <div className="rounded-md border border-border bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-navy-500 fill-navy-500" />
        <div>
          <p className="text-sm font-medium text-tc-text-primary">Super Like</p>
          <p className="text-xs text-tc-text-hint">Destaque-se!</p>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-md bg-navy-500 px-3 py-2">
        <span className="text-xs text-white font-medium">Seus creditos</span>
        <span className="flex items-center gap-1 text-xs text-white font-medium">
          {credits}
          <Star className="h-3 w-3 fill-white" />
        </span>
      </div>
    </div>
  );
}

export default function OpportunityDetailSidebar({
  opportunity,
  onApplyClick,
}: Props) {
  const navigate = useNavigate();
  const { createConversationFromApplication } = useChatStore();

  const handleContact = () => {
    const convId = createConversationFromApplication(
      `opp-${opportunity.id}`,
      {
        name: opportunity.organizationName || opportunity.hostName,
        avatar: opportunity.hostAvatarUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(opportunity.organizationName)}&background=364763&color=fff&size=96`,
      },
    );
    navigate(`/chat/${convId}`);
  };

  return (
    <div className="space-y-4">
      <MatchCard
        matchPercent={opportunity.matchPercent}
        minMatchPercent={opportunity.minMatchPercent}
        isEligible={opportunity.isEligible}
      />

      <CompensationCard
        compensationType={opportunity.compensationType}
        workHours={opportunity.workHours}
      />

      <Button
        className="w-full bg-navy-500 hover:bg-navy-600 text-white gap-2"
        onClick={onApplyClick}
      >
        <Send className="h-4 w-4" />
        Candidatar-se
      </Button>

      <p className="text-xs text-center text-tc-text-hint">
        Resposta em ate 48 horas
      </p>

      <TipInfoBox text={opportunity.tipText} />

      <Button
        variant="outline"
        className="w-full bg-navy-500 hover:bg-navy-600 text-white border-navy-500 gap-2"
        onClick={handleContact}
      >
        <MessageCircle className="h-4 w-4" />
        Entrar em contato
      </Button>

      <SuperLikeSection credits={opportunity.superLikeCredits} />
    </div>
  );
}
