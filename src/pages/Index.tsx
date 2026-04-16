import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { useTranslation } from "react-i18next";

const COUNTRY_CODES = [
  "ZA", "DE", "AO", "AR", "AU", "AT", "BE", "BO", "BR", "CV",
  "CA", "CL", "CN", "CO", "KR", "CR", "HR", "DK", "EG", "AE",
  "EC", "ES", "US", "FJ", "PH", "FI", "FR", "GH", "GR", "NL",
  "HK", "HU", "IN", "ID", "IE", "IL", "IT", "JM", "JP", "JO",
  "LA", "MY", "MA", "MX", "MZ", "MM", "NP", "NG", "NO", "NZ",
  "PA", "PY", "PE", "PL", "PT", "KE", "GB", "CZ", "RO", "SN",
  "SG", "LK", "TH", "CH", "TW", "TZ", "TR", "UG", "UY", "VE", "VN",
];

function flagUrl(code: string) {
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
}

const Index = () => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSelect = (code: string) => {
    setSelected(code);
    sessionStorage.setItem("selectedCountry", code);
    setTimeout(() => navigate("/select-role"), 300);
  };

  return (
    <div className="relative min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center py-8 overflow-hidden">
      {/* Background: airplane silhouette (left, rotated) */}
      <img
        src="/images/bg-airplane.png"
        alt=""
        className="absolute pointer-events-none opacity-50"
        style={{
          top: "-104px",
          left: "-250px",
          width: "1044px",
          height: "652px",
          transform: "rotate(-34.53deg)",
        }}
      />

      {/* Background: world map (top right) */}
      <img
        src="/images/bg-map.png"
        alt=""
        className="absolute pointer-events-none opacity-50"
        style={{
          top: "9px",
          right: "-60px",
          width: "620px",
          height: "390px",
        }}
      />

      {/* Logo */}
      <div className="relative z-10 flex justify-center mb-6">
        <Logo size="xl" />
      </div>

      {/* Title */}
      <h1 className="relative z-10 text-[28px] font-semibold text-[#12100f] text-center mb-2">
        {t("index.welcome")}
      </h1>

      {/* Subtitle */}
      <p className="relative z-10 text-[18px] text-[#3f444c] text-center mb-6">
        {t("index.selectCountry")}
      </p>

      {/* Country grid */}
      <div className="relative z-10 w-full max-w-[1000px] flex-1 min-h-0 overflow-y-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {COUNTRY_CODES.map((code) => {
            const name = t(`countries.${code}`);
            return (
              <button
                key={code}
                onClick={() => handleSelect(code)}
                className={`flex items-center gap-4 p-4 rounded-[14px] bg-white text-left transition-all hover:border-[#364763] hover:shadow-sm cursor-pointer ${
                  selected === code
                    ? "border-[1.25px] border-[#364763] shadow-md"
                    : "border-[1.25px] border-[#e5e7eb]"
                }`}
              >
                <img
                  src={flagUrl(code)}
                  alt={name}
                  className="w-10 h-7 object-cover rounded-sm shrink-0"
                />
                <span
                  className={`text-[14px] truncate ${
                    selected === code
                      ? "font-medium text-[#12100f]"
                      : "font-normal text-[#3f444c]"
                  }`}
                >
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;
