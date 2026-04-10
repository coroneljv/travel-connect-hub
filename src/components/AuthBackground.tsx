interface AuthBackgroundProps {
  children: React.ReactNode;
  variant?: "full" | "split";
}

export function AuthBackground({ children, variant = "full" }: AuthBackgroundProps) {
  if (variant === "split") {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex overflow-hidden">
        {/* Painel esquerdo — imagens do Figma */}
        <div className="hidden lg:flex lg:w-[42%] relative items-start justify-center pt-[100px]">
          {/* Branding — topo (Figma: 1440×900, right:-292px, top:0) */}
          <img
            src="/images/bg-airplane.png"
            alt=""
            className="absolute pointer-events-none"
            style={{ top: 0, right: "-292px", width: "1440px", height: "900px" }}
          />
          {/* Mapa rotacionado — base (Figma: wrapper left:-40px top:472px 743×521, inner 691×432 rotate:-7.79deg) */}
          <div className="absolute pointer-events-none" style={{ left: "-40px", top: "472px", width: "743.677px", height: "521.923px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ transform: "rotate(-7.79deg)" }}>
              <img src="/images/bg-map.png" alt="" style={{ width: "691px", height: "432px" }} />
            </div>
          </div>
          {/* Logo (Figma: 80px tall) */}
          <img
            src="/images/logo-travel-connect.svg"
            alt="Travel Connect"
            className="relative z-10"
            style={{ height: 80, width: "auto", transform: "scaleY(-1)" }}
          />
        </div>

        {/* Painel direito — formulário */}
        <div className="flex-1 relative z-10 flex items-start justify-center overflow-y-auto py-8 px-6 lg:px-12">
          {children}
        </div>
      </div>
    );
  }

  // variant === "full"
  return (
    <div className="min-h-screen bg-[#f3f3f3] relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {children}
      </div>
    </div>
  );
}
