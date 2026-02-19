import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";

const countries = [
  { code: "ZA", name: "África do Sul" },
  { code: "DE", name: "Alemanha" },
  { code: "AO", name: "Angola" },
  { code: "AR", name: "Argentina" },
  { code: "AU", name: "Austrália" },
  { code: "AT", name: "Áustria" },
  { code: "BE", name: "Bélgica" },
  { code: "BO", name: "Bolívia" },
  { code: "BR", name: "Brasil" },
  { code: "CV", name: "Cabo Verde" },
  { code: "CA", name: "Canadá" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colômbia" },
  { code: "KR", name: "Coreia do Sul" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croácia" },
  { code: "DK", name: "Dinamarca" },
  { code: "EG", name: "Egito" },
  { code: "AE", name: "E. Árabes Unidos" },
  { code: "EC", name: "Equador" },
  { code: "ES", name: "Espanha" },
  { code: "US", name: "Estados Unidos" },
  { code: "FJ", name: "Fiji" },
  { code: "PH", name: "Filipinas" },
  { code: "FI", name: "Finlândia" },
  { code: "FR", name: "França" },
  { code: "GH", name: "Gana" },
  { code: "GR", name: "Grécia" },
  { code: "NL", name: "Holanda" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungria" },
  { code: "IN", name: "Índia" },
  { code: "ID", name: "Indonésia" },
  { code: "IE", name: "Irlanda" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Itália" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japão" },
  { code: "JO", name: "Jordânia" },
  { code: "LA", name: "Laos" },
  { code: "MY", name: "Malásia" },
  { code: "MA", name: "Marrocos" },
  { code: "MX", name: "México" },
  { code: "MZ", name: "Moçambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NP", name: "Nepal" },
  { code: "NG", name: "Nigéria" },
  { code: "NO", name: "Noruega" },
  { code: "NZ", name: "Nova Zelândia" },
  { code: "PA", name: "Panamá" },
  { code: "PY", name: "Paraguai" },
  { code: "PE", name: "Peru" },
  { code: "PL", name: "Polônia" },
  { code: "PT", name: "Portugal" },
  { code: "KE", name: "Quênia" },
  { code: "GB", name: "Reino Unido" },
  { code: "CZ", name: "Rep. Tcheca" },
  { code: "RO", name: "Romênia" },
  { code: "SN", name: "Senegal" },
  { code: "SG", name: "Singapura" },
  { code: "LK", name: "Sri Lanka" },
  { code: "TH", name: "Tailândia" },
  { code: "CH", name: "Suíça" },
  { code: "TW", name: "Taiwan" },
  { code: "TZ", name: "Tanzânia" },
  { code: "TR", name: "Turquia" },
  { code: "UG", name: "Uganda" },
  { code: "UY", name: "Uruguai" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnã" },
];

function flagUrl(code: string) {
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
}

const Index = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSelect = (code: string) => {
    setSelected(code);
    const country = countries.find((c) => c.code === code);
    if (country) {
      sessionStorage.setItem("selectedCountry", country.name);
    }
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
        Bem-vindo!
      </h1>

      {/* Subtitle */}
      <p className="relative z-10 text-[18px] text-[#3f444c] text-center mb-6">
        Vamos começar selecionando seu país de residência atual
      </p>

      {/* Country grid */}
      <div className="relative z-10 w-full max-w-[1000px] flex-1 min-h-0 overflow-y-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {countries.map((country) => (
            <button
              key={country.code}
              onClick={() => handleSelect(country.code)}
              className={`flex items-center gap-4 p-4 rounded-[14px] bg-white text-left transition-all hover:border-[#364763] hover:shadow-sm cursor-pointer ${
                selected === country.code
                  ? "border-[1.25px] border-[#364763] shadow-md"
                  : "border-[1.25px] border-[#e5e7eb]"
              }`}
            >
              <img
                src={flagUrl(country.code)}
                alt={country.name}
                className="w-10 h-7 object-cover rounded-sm shrink-0"
              />
              <span
                className={`text-[14px] truncate ${
                  selected === country.code
                    ? "font-medium text-[#12100f]"
                    : "font-normal text-[#3f444c]"
                }`}
              >
                {country.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
