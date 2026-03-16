import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Página não encontrada</p>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-primary underline hover:text-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para a página anterior
        </button>
      </div>
    </div>
  );
};

export default NotFound;
