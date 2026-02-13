interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export function Logo({ size = "md", className = "", showText = true }: LogoProps) {
  const sizeMap = {
    sm: { icon: 40, text: "text-lg" },
    md: { icon: 64, text: "text-2xl" },
    lg: { icon: 96, text: "text-4xl" },
  };

  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Globe */}
        <circle cx="45" cy="50" r="28" stroke="#2D3A4A" strokeWidth="3" fill="none" />
        {/* Horizontal line */}
        <ellipse cx="45" cy="50" rx="28" ry="12" stroke="#2D3A4A" strokeWidth="2" fill="none" />
        {/* Vertical line */}
        <ellipse cx="45" cy="50" rx="12" ry="28" stroke="#2D3A4A" strokeWidth="2" fill="none" />
        {/* Vertical center line */}
        <line x1="45" y1="22" x2="45" y2="78" stroke="#2D3A4A" strokeWidth="2" />
        {/* Horizontal center line */}
        <line x1="17" y1="50" x2="73" y2="50" stroke="#2D3A4A" strokeWidth="2" />
        {/* Orbit dotted circle */}
        <circle
          cx="50"
          cy="45"
          r="35"
          stroke="#2D3A4A"
          strokeWidth="2.5"
          strokeDasharray="3 5"
          fill="none"
          transform="rotate(-20, 50, 45)"
        />
        {/* Red dot on orbit */}
        <circle cx="78" cy="25" r="5" fill="#DC3545" />
      </svg>
      {showText && (
        <div className={`font-bold leading-tight ${text}`}>
          <span className="text-navy-500 tracking-wide">TRAVEL</span>
          <br />
          <span className="text-navy-500 tracking-wide">C</span>
          <span className="text-navy-500 tracking-wide">ONNECT</span>
        </div>
      )}
    </div>
  );
}
