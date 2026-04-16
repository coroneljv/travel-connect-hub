import { useEffect, useState } from "react";
import { Bell, CheckCheck, MessageSquare, Award, Briefcase } from "lucide-react";
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
  general: <Bell className="h-5 w-5 text-gray-400" />,
};

export function NotificationsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Empty — real notifications will come from Supabase later
  const notifications: Notification[] = [];

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Two rAFs to ensure the initial (invisible) state is painted before we add the visible class
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-start justify-center pt-24 px-4 transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
          visible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-3"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#1e2939]">
            {t("notifications.title")}
          </h2>
          {notifications.length > 0 && (
            <button className="flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-600 font-medium transition-colors">
              <CheckCheck className="h-4 w-4" />
              {t("notifications.markAllRead")}
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-base font-medium text-gray-600 mb-1">
                {t("notifications.none")}
              </p>
              <p className="text-sm text-gray-400">
                {t("notifications.noneDesc")}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
                    !n.read ? "bg-navy-50/50 border border-navy-100" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="shrink-0 mt-0.5">{ICON_MAP[n.type]}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"} text-[#1e2939]`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {n.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{n.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
