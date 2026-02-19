interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  color?: "navy" | "white";
}

const PALETTE = {
  navy: { main: "#364763", accent: "#CF3952" },
  white: { main: "#FFFFFF", accent: "#CF3952" },
};

function LogoIcon({ size, color = "navy" }: { size: number; color?: "navy" | "white" }) {
  const { main, accent } = PALETTE[color];
  // Scale factor based on a 120x120 base viewBox
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* === Globe === */}
      <circle cx="52" cy="56" r="32" stroke={main} strokeWidth="3.5" fill="none" />
      <ellipse cx="52" cy="56" rx="14" ry="32" stroke={main} strokeWidth="2" fill="none" />
      <ellipse cx="52" cy="56" rx="26" ry="32" stroke={main} strokeWidth="1.5" fill="none" />
      <ellipse cx="52" cy="56" rx="32" ry="12" stroke={main} strokeWidth="2" fill="none" />
      <ellipse cx="52" cy="42" rx="28" ry="8" stroke={main} strokeWidth="1.5" fill="none" />
      <ellipse cx="52" cy="70" rx="28" ry="8" stroke={main} strokeWidth="1.5" fill="none" />
      <line x1="52" y1="24" x2="52" y2="88" stroke={main} strokeWidth="2" />
      <line x1="20" y1="56" x2="84" y2="56" stroke={main} strokeWidth="2" />
      {/* Diagonal stripes */}
      <line x1="70" y1="30" x2="30" y2="78" stroke={main} strokeWidth="3" strokeLinecap="round" />
      <line x1="76" y1="36" x2="36" y2="84" stroke={main} strokeWidth="3" strokeLinecap="round" />
      {/* Red dot trail */}
      <circle cx="8" cy="82" r="2.5" fill={accent} />
      <circle cx="12" cy="78" r="2.8" fill={accent} />
      <circle cx="17" cy="74" r="3" fill={accent} />
      <circle cx="22" cy="70.5" r="3.2" fill={accent} />
      <circle cx="27.5" cy="67.5" r="3.5" fill={accent} />
      <circle cx="33" cy="65" r="3.5" fill={accent} />
      <circle cx="39" cy="63" r="3.2" fill={accent} />
      <circle cx="90" cy="22" r="5.5" fill={accent} />
    </svg>
  );
}

export function Logo({ size = "md", className = "", showText = true, color = "navy" }: LogoProps) {
  const sizeMap = {
    sm: { icon: 40, text: "text-base", gap: "gap-2" },
    md: { icon: 56, text: "text-xl", gap: "gap-2.5" },
    lg: { icon: 80, text: "text-3xl", gap: "gap-3" },
    xl: { icon: 100, text: "text-4xl", gap: "gap-4" },
  };

  const { icon, text, gap } = sizeMap[size];
  const { main } = PALETTE[color];
  const textColor = color === "white" ? "text-white" : "text-navy-500";

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      <LogoIcon size={icon} color={color} />
      {showText && (
        <div className={`font-bold leading-[1.1] tracking-wide ${text}`}>
          <span className={textColor}>TRAVEL</span>
          <br />
          <span className={textColor}>C</span>
          <span className={`inline-flex items-center ${textColor}`}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="inline-block"
              style={{
                width: "0.72em",
                height: "0.72em",
                marginBottom: "-0.04em",
              }}
            >
              <circle cx="12" cy="12" r="10" stroke={main} strokeWidth="3" fill="none" />
              <circle cx="12" cy="12" r="4" fill={main} />
            </svg>
          </span>
          <span className={textColor}>NNECT</span>
        </div>
      )}
    </div>
  );
}
