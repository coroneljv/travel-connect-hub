import { useNavigate } from "react-router-dom";
import { AuthBackground } from "@/components/AuthBackground";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Heart, Globe2, Building, Users, HeartHandshake, ArrowRight } from "lucide-react";
import type { UIRole } from "@/lib/roles";

const SelectRole = () => {
  const { selectRole } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (role: UIRole) => {
    selectRole(role);
    navigate("/login");
  };

  return (
    <AuthBackground>
      <div className="w-full max-w-5xl space-y-8">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-navy-500">Bem-vindo!</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Conecte-se com pessoas ao redor do mundo. Escolha como você quer começar sua jornada:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Viajante Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col">
            <div className="bg-navy-500 text-white p-6">
              <h2 className="text-2xl font-bold">Sou Viajante</h2>
              <p className="text-navy-100 mt-1">
                Explore o mundo e encontre experiências autênticas
              </p>
            </div>
            <div className="p-6 flex-1 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-navy-500" />
                </div>
                <div>
                  <p className="font-semibold text-navy-500">Descubra Oportunidades</p>
                  <p className="text-sm text-muted-foreground">
                    Experiências únicas de trabalho voluntário e hospedagem.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center flex-shrink-0">
                  <Heart className="h-5 w-5 text-navy-500" />
                </div>
                <div>
                  <p className="font-semibold text-navy-500">Conecte-se com Anfitriões</p>
                  <p className="text-sm text-muted-foreground">
                    Construa relacionamentos significativos ao redor do mundo.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-navy-50 flex items-center justify-center flex-shrink-0">
                  <Globe2 className="h-5 w-5 text-navy-500" />
                </div>
                <div>
                  <p className="font-semibold text-navy-500">Cresça e Aprenda</p>
                  <p className="text-sm text-muted-foreground">
                    Desenvolva habilidades enquanto conhece novas culturas.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => handleSelect("viajante")}
                className="w-full bg-navy-500 hover:bg-navy-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Começar como Viajante
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Anfitrião Card */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col">
            <div className="bg-rose-500 text-white p-6">
              <h2 className="text-2xl font-bold">Sou Anfitrião</h2>
              <p className="text-rose-100 mt-1">
                Compartilhe seu espaço e receba viajantes incríveis
              </p>
            </div>
            <div className="p-6 flex-1 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <Building className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="font-semibold text-navy-500">Crie Oportunidades</p>
                  <p className="text-sm text-muted-foreground">
                    Publique vagas de voluntariado e receba ajuda qualificada.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="font-semibold text-navy-500">Receba Viajantes</p>
                  <p className="text-sm text-muted-foreground">
                    Conheça pessoas de diferentes culturas e histórias.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                  <HeartHandshake className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="font-semibold text-navy-500">Impacte Vidas</p>
                  <p className="text-sm text-muted-foreground">
                    Faça parte de experiências transformadoras.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button
                onClick={() => handleSelect("anfitriao")}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Começar como Anfitrião
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthBackground>
  );
};

export default SelectRole;
