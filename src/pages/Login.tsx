import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || t("auth.login.error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center py-8 overflow-hidden">

      {/* Avião — esquerda (Figma: wrapper left:-463px top:-104px 1230×1129, inner 1044×652 rotate(-34.53deg) opacity 0.7) */}
      <div className="absolute pointer-events-none" style={{ left: "-463px", top: "-104px", width: "1229.608px", height: "1129.051px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: "rotate(-34.53deg)" }}>
          <img src="/images/bg-airplane.png" alt="" style={{ width: "1044px", height: "652px", opacity: 0.7 }} />
        </div>
      </div>

      {/* Mapa — direita (Figma: wrapper left:954px top:215px 741×607, inner 638×399 rotate(-21.69deg) opacity 0.7) */}
      <div className="absolute pointer-events-none" style={{ right: "-255px", top: "215px", width: "741.003px", height: "606.989px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: "rotate(-21.69deg)" }}>
          <img src="/images/bg-map.png" alt="" style={{ width: "638px", height: "399px", opacity: 0.7 }} />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-[500px] flex flex-col items-center gap-6 px-4">

        {/* Logo */}
        <img
          src="/images/logo-travel-connect.svg"
          alt="Travel Connect"
          style={{ height: 80, width: "auto", transform: "scaleY(-1)" }}
        />

        {/* Títulos */}
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-[28px] font-semibold text-[#12100f]">{t("auth.login.title")}</h1>
          <p className="text-[18px] font-normal text-[#3f444c]">
            {t("auth.login.subtitle")}
          </p>
        </div>

        {/* Card do formulário */}
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white rounded-[10px] border border-[#dbdbdb] p-4 flex flex-col gap-4"
        >
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[14px] font-normal text-[#12100f]">
              {t("auth.login.email")}
            </label>
            <input
              id="email"
              type="email"
              placeholder={t("auth.login.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-[50px] px-4 bg-[#f3f3f3] border border-[#dbdbdb] rounded-[10px] text-[14px] text-[#12100f] placeholder:text-[#9c9c9c] focus:outline-none focus:ring-1 focus:ring-[#364763] transition-colors"
            />
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[14px] font-normal text-[#12100f]">
              {t("auth.login.password")}
            </label>
            <input
              id="password"
              type="password"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-[50px] px-4 bg-[#f3f3f3] border border-[#dbdbdb] rounded-[10px] text-[14px] text-[#12100f] placeholder:text-[#9c9c9c] focus:outline-none focus:ring-1 focus:ring-[#364763] transition-colors"
            />
          </div>

          {/* Esqueceu a senha */}
          <Link
            to="#"
            className="text-[14px] font-medium text-[#cf3952] hover:underline self-start"
          >
            {t("auth.login.forgotPassword")}
          </Link>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[46px] rounded-[10px] text-[14px] font-normal text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ background: "#364763" }}
          >
            {isLoading ? t("auth.login.submitting") : t("auth.login.submit")}
          </button>

          {/* Cadastre-se */}
          <div className="flex gap-2 items-center justify-center text-[14px]">
            <span className="font-normal text-[#3f444c]">{t("auth.login.noAccount")}</span>
            <Link
              to="/register"
              className="font-medium text-[#cf3952] hover:underline"
            >
              {t("auth.login.signUp")}
            </Link>
          </div>

          {/* Voltar */}
          <Link
            to="/"
            className="text-[14px] font-medium text-[#12100f] hover:underline text-center"
          >
            {t("auth.login.backToHome")}
          </Link>

        </form>
      </div>
    </div>
  );
};

export default Login;
