import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, MessageSquare, Award, Briefcase, CheckCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Notification {
  id: string;
  type: "message" | "application" | "course" | "general";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const ICON_MAP = {
  message: <MessageSquare className="h-5 w-5 text-blue-500" />,
  application: <Briefcase className="h-5 w-5 text-emerald-500" />,
  course: <Award className="h-5 w-5 text-amber-500" />,
  general: <Bell className="h-5 w-5 text-tc-text-hint" />,
};

export default function Notifications() {
  const { t } = useTranslation();
  // Empty state — real notifications will come from Supabase later
  const [notifications] = useState<Notification[]>([]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-tc-text-primary">{t("notifications.title")}</h1>
        {notifications.length > 0 && (
          <button className="flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-600 font-medium transition-colors">
            <CheckCheck className="h-4 w-4" />
            {t("notifications.markAllRead")}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell className="h-12 w-12 text-tc-text-hint mx-auto mb-4" />
            <p className="text-base font-medium text-tc-text-secondary mb-1">
              {t("notifications.none")}
            </p>
            <p className="text-sm text-tc-text-hint">
              {t("notifications.noneDesc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`transition-colors ${!n.read ? "bg-navy-50/50 border-navy-200" : ""}`}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div className="shrink-0 mt-0.5">
                  {ICON_MAP[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"} text-tc-text-primary`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-tc-text-secondary mt-0.5 line-clamp-2">
                    {n.description}
                  </p>
                </div>
                <span className="text-xs text-tc-text-hint shrink-0">
                  {n.time}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
