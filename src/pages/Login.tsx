import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AuthBackground } from "@/components/AuthBackground";
import { Logo } from "@/components/Logo";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, selectedUIRole } = useAuth();
  const navigate = useNavigate();

  const isViajante = selectedUIRole === "viajante";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Falha ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthBackground>
      <div className="w-full max-w-[480px] flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6">
          <Logo size="lg" />
        </div>

        {/* Title */}
        <h1 className="text-[2rem] font-bold text-navy-900 mb-2">Login</h1>
        <p className="text-[#6B7280] text-base mb-8">
          Preencha os campos abaixo para acessar a plataforma!
        </p>

        {/* Form Card */}
        <div className="w-full bg-white rounded-2xl shadow-sm px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-navy-800 mb-1.5"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="e-mail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-sm text-navy-800 placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-transparent transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-navy-800 mb-1.5"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg text-sm text-navy-800 placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-transparent transition-colors"
              />
            </div>

            {/* Forgot password */}
            <div>
              <Link
                to="#"
                className={`text-sm font-medium ${
                  isViajante
                    ? "text-rose-500 hover:text-rose-600"
                    : "text-navy-500 hover:text-navy-600"
                } hover:underline`}
              >
                Esqueceu sua senha?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-lg text-white font-semibold text-base transition-colors disabled:opacity-50 ${
                isViajante
                  ? "bg-rose-500 hover:bg-rose-600"
                  : "bg-navy-500 hover:bg-navy-600"
              }`}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>

            {/* Register link */}
            <p className="text-center text-sm text-[#6B7280]">
              Não possui conta?{" "}
              <Link
                to="/register"
                className={`font-semibold hover:underline ${
                  isViajante
                    ? "text-rose-500 hover:text-rose-600"
                    : "text-navy-500 hover:text-navy-600"
                }`}
              >
                Cadastre-se
              </Link>
            </p>

            {/* Back link */}
            <Link
              to="/"
              className="block text-center text-sm text-[#6B7280] hover:text-navy-600 hover:underline transition-colors"
            >
              Voltar para a Tela Inicial
            </Link>
          </form>
        </div>
      </div>
    </AuthBackground>
  );
};

export default Login;
