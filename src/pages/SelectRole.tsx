import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Heart, Globe2, Building, Users, HeartHandshake, ArrowRight } from "lucide-react";
import type { UIRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";

const SelectRole = () => {
  const { t } = useTranslation();
  const { selectRole } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (role: UIRole) => {
    selectRole(role);
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center py-8 overflow-hidden">

      {/* Avião — esquerda (Figma: wrapper left:-463px top:-104px 1230×1129, inner 1044×652 rotate(-34.53deg) opacity 0.5) */}
      <div className="absolute pointer-events-none" style={{ left: "-463px", top: "-104px", width: "1229.608px", height: "1129.051px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: "rotate(-34.53deg)" }}>
          <img src="/images/bg-airplane.png" alt="" style={{ width: "1044px", height: "652px", opacity: 0.5 }} />
        </div>
      </div>

      {/* Mapa — direita (Figma: left:1023px top:9px 480×300 opacity 0.5, sem rotação) */}
      <img
        src="/images/bg-map.png"
        alt=""
        className="absolute pointer-events-none"
        style={{ right: "-63px", top: "9px", width: "480px", height: "300px", opacity: 0.5 }}
      />

      {/* Conteúdo centralizado */}
      <div className="relative z-10 w-full max-w-[1200px] flex flex-col items-center gap-6 px-4">

        {/* Logo */}
        <img
          src="/images/logo-travel-connect.svg"
          alt="Travel Connect"
          style={{ height: 80, width: "auto", transform: "scaleY(-1)" }}
        />

        {/* Heading */}
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-[28px] font-semibold text-[#12100f]">{t("selectRole.welcome")}</h1>
          <p className="text-[18px] font-normal text-[#3f444c] max-w-2xl mx-auto">
            {t("selectRole.subtitle")}
          </p>
        </div>

        {/* Cards */}
        <div className="flex gap-4 w-full items-stretch">

          {/* ── Viajante ── */}
          <div className="flex-1 bg-white rounded-[10px] border border-[#dbdbdb] flex flex-col overflow-hidden">
            <div className="px-4 py-8 flex flex-col gap-4" style={{ background: "#364763" }}>
              <p className="text-[28px] font-semibold leading-none text-white">{t("selectRole.traveler.title")}</p>
              <p className="text-[16px] font-normal leading-none text-white">
                {t("selectRole.traveler.subtitle")}
              </p>
            </div>

            <div className="flex flex-col gap-4 px-4 py-8 flex-1">
              <div className="flex flex-col gap-4">
                {[
                  { icon: MapPin, label: t("selectRole.traveler.f1title"), desc: t("selectRole.traveler.f1desc") },
                  { icon: Heart, label: t("selectRole.traveler.f2title"), desc: t("selectRole.traveler.f2desc") },
                  { icon: Globe2, label: t("selectRole.traveler.f3title"), desc: t("selectRole.traveler.f3desc") },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex gap-4 items-center w-full">
                    <div
                      className="shrink-0 rounded-[10px] flex items-center justify-center"
                      style={{ width: 40, height: 40, background: "rgba(54,71,99,0.1)" }}
                    >
                      <Icon style={{ width: 20, height: 20, color: "#364763" }} />
                    </div>
                    <div className="flex flex-col leading-snug">
                      <span className="text-[16px] font-medium text-[#12100f]">{label}</span>
                      <span className="text-[16px] font-normal text-[#3f444c]">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelect("viajante")}
                className="w-full flex items-center justify-center gap-4 py-3 rounded-[10px] text-[14px] font-normal text-white hover:opacity-90 transition-opacity mt-auto"
                style={{ background: "#364763" }}
              >
                {t("selectRole.traveler.cta")}
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {/* ── Anfitrião ── */}
          <div className="flex-1 bg-white rounded-[10px] border border-[#dbdbdb] flex flex-col overflow-hidden">
            <div
              className="px-4 py-8 flex flex-col gap-4"
              style={{ background: "#cf3952", borderBottom: "1px solid #364763" }}
            >
              <p className="text-[28px] font-semibold leading-none text-white">{t("selectRole.host.title")}</p>
              <p className="text-[16px] font-normal leading-none text-white">
                {t("selectRole.host.subtitle")}
              </p>
            </div>

            <div className="flex flex-col gap-4 px-4 py-8 flex-1">
              <div className="flex flex-col gap-4">
                {[
                  { icon: Building, label: t("selectRole.host.f1title"), desc: t("selectRole.host.f1desc") },
                  { icon: Users, label: t("selectRole.host.f2title"), desc: t("selectRole.host.f2desc") },
                  { icon: HeartHandshake, label: t("selectRole.host.f3title"), desc: t("selectRole.host.f3desc") },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex gap-4 items-center w-full">
                    <div
                      className="shrink-0 rounded-[10px] flex items-center justify-center"
                      style={{ width: 40, height: 40, background: "rgba(207,57,82,0.1)" }}
                    >
                      <Icon style={{ width: 20, height: 20, color: "#cf3952" }} />
                    </div>
                    <div className="flex flex-col leading-snug">
                      <span className="text-[16px] font-medium text-[#12100f]">{label}</span>
                      <span className="text-[16px] font-normal text-[#3f444c]">{desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelect("anfitriao")}
                className="w-full flex items-center justify-center gap-4 py-3 rounded-[10px] text-[14px] font-normal text-white border border-[#364763] hover:opacity-90 transition-opacity mt-auto"
                style={{ background: "#cf3952" }}
              >
                {t("selectRole.host.cta")}
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SelectRole;
