import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthBackground } from "@/components/AuthBackground";
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
  { code: "IN", name: "Índia" },
  { code: "ID", name: "Indonésia" },
  { code: "IE", name: "Irlanda" },
  { code: "IT", name: "Itália" },
  { code: "JP", name: "Japão" },
  { code: "MX", name: "México" },
  { code: "NZ", name: "Nova Zelândia" },
  { code: "NL", name: "Países Baixos" },
  { code: "PE", name: "Peru" },
  { code: "PT", name: "Portugal" },
  { code: "GB", name: "Reino Unido" },
  { code: "TH", name: "Tailândia" },
  { code: "UY", name: "Uruguai" },
];

function flagUrl(code: string) {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
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
    <AuthBackground>
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-navy-500">Bem-vindo!</h1>
          <p className="text-muted-foreground text-lg">
            Vamos começar selecionando seu país de residência atual
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto px-2 py-1">
          {countries.map((country) => (
            <button
              key={country.code}
              onClick={() => handleSelect(country.code)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border bg-white text-left transition-all hover:border-navy-300 hover:shadow-sm ${
                selected === country.code
                  ? "border-navy-500 ring-2 ring-navy-500/20 shadow-md"
                  : "border-gray-200"
              }`}
            >
              <img
                src={flagUrl(country.code)}
                alt={country.name}
                className="w-8 h-5 object-cover rounded-sm flex-shrink-0"
              />
              <span className="text-sm font-medium text-navy-500 truncate">
                {country.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </AuthBackground>
  );
};

export default Index;
