interface AuthBackgroundProps {
  children: React.ReactNode;
  variant?: "full" | "split";
}

export function AuthBackground({ children, variant = "full" }: AuthBackgroundProps) {
  return (
    <div className="min-h-screen bg-warm-gray relative overflow-hidden">

      {/* ── World map silhouette – right side ── */}
      <svg
        className="absolute pointer-events-none"
        style={{ top: "10%", right: "-5%", width: "55%", height: "80%" }}
        viewBox="0 0 700 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* North America */}
        <path
          d="M80 90 Q110 50 170 65 Q210 35 250 55 Q280 90 250 140 Q210 180 170 170 Q120 195 85 170 Q55 145 80 90Z"
          fill="#2D3A4A"
          opacity="0.12"
        />
        {/* Central America */}
        <path
          d="M170 180 Q185 175 195 190 Q200 210 190 225 Q175 230 165 215 Q160 195 170 180Z"
          fill="#2D3A4A"
          opacity="0.12"
        />
        {/* South America */}
        <path
          d="M160 240 Q190 220 220 240 Q240 285 230 360 Q210 420 180 440 Q150 415 140 355 Q130 290 160 240Z"
          fill="#2D3A4A"
          opacity="0.12"
        />
        {/* Europe */}
        <path
          d="M340 60 Q375 40 410 60 Q445 50 465 80 Q455 115 425 125 Q390 135 360 115 Q332 95 340 60Z"
          fill="#2D3A4A"
          opacity="0.12"
        />
        {/* Africa */}
        <path
          d="M360 160 Q405 140 450 165 Q470 210 460 290 Q440 370 405 395 Q370 370 355 290 Q340 215 360 160Z"
          fill="#2D3A4A"
          opacity="0.12"
        />
        {/* Middle East */}
        <path
          d="M470 110 Q500 100 520 120 Q530 145 515 160 Q495 165 480 150 Q465 130 470 110Z"
          fill="#2D3A4A"
          opacity="0.12"
        />
        {/* Asia */}
        <path
          d="M500 50 Q560 30 630 55 Q670 80 680 120 Q670 170 630 190 Q580 200 540 170 Q505 140 500 100 Q495 75 500 50Z"
          fill="#2D3A4A"
          opacity="0.12"
        />
        {/* Southeast Asia */}
        <path
          d="M600 210 Q630 200 650 220 Q660 245 645 260 Q620 265 605 245 Q595 225 600 210Z"
          fill="#2D3A4A"
          opacity="0.12"
        />
        {/* Australia */}
        <path
          d="M580 340 Q625 315 670 340 Q690 375 675 410 Q640 430 600 410 Q575 385 580 340Z"
          fill="#2D3A4A"
          opacity="0.12"
        />
      </svg>

      {/* ── Navy airplane – top left (large, prominent) ── */}
      <svg
        className="absolute pointer-events-none"
        style={{ top: "2%", left: "3%", width: "200px", height: "200px" }}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="rotate(-35, 100, 100)" opacity="0.25">
          {/* Fuselage */}
          <ellipse cx="100" cy="100" rx="12" ry="65" fill="#2D3A4A" />
          {/* Wings */}
          <ellipse cx="100" cy="90" rx="65" ry="10" fill="#2D3A4A" />
          {/* Tail */}
          <ellipse cx="100" cy="155" rx="25" ry="7" fill="#2D3A4A" />
          {/* Nose refinement */}
          <ellipse cx="100" cy="38" rx="7" ry="12" fill="#2D3A4A" />
        </g>
      </svg>

      {/* ── Navy dotted flight path – from top-left airplane curving down ── */}
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        style={{ width: "35%", height: "100%" }}
        viewBox="0 0 400 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMinYMin meet"
      >
        {/* S-curve dotted path from airplane area going down-left */}
        <path
          d="M200 130 Q260 220 220 340 Q170 470 240 560 Q180 650 120 720 Q80 770 60 830"
          stroke="#2D3A4A"
          strokeWidth="5"
          strokeDasharray="1 12"
          strokeLinecap="round"
          fill="none"
          opacity="0.2"
        />
      </svg>

      {/* ── Rose airplane – top right (smaller) ── */}
      <svg
        className="absolute pointer-events-none"
        style={{ top: "4%", right: "8%", width: "100px", height: "100px" }}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="rotate(35, 60, 60)" opacity="0.35">
          {/* Fuselage */}
          <ellipse cx="60" cy="60" rx="8" ry="38" fill="#DC3545" />
          {/* Wings */}
          <ellipse cx="60" cy="55" rx="38" ry="7" fill="#DC3545" />
          {/* Tail */}
          <ellipse cx="60" cy="92" rx="15" ry="5" fill="#DC3545" />
        </g>
      </svg>

      {/* ── Rose dashed flight path – top right curving around map ── */}
      <svg
        className="absolute top-0 right-0 pointer-events-none"
        style={{ width: "45%", height: "90%" }}
        viewBox="0 0 600 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMaxYMin meet"
      >
        <path
          d="M350 60 Q250 120 300 250 Q350 380 250 500 Q200 580 300 650"
          stroke="#DC3545"
          strokeWidth="3"
          strokeDasharray="8 8"
          strokeLinecap="round"
          fill="none"
          opacity="0.2"
        />
      </svg>

      {/* ── Location pin – bottom left ── */}
      <svg
        className="absolute pointer-events-none"
        style={{ bottom: "5%", left: "4%", width: "60px", height: "80px" }}
        viewBox="0 0 24 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 0C7.03 0 3 4.03 3 9c0 6.63 9 16.5 9 16.5s9-9.87 9-16.5C21 4.03 16.97 0 12 0z"
          fill="#2D3A4A"
          opacity="0.2"
        />
        <circle cx="12" cy="9" r="3.5" fill="#F5F4F0" opacity="0.8" />
      </svg>

      {/* ── Content ── */}
      {variant === "split" ? (
        <div className="flex min-h-screen relative z-10">
          {/* Left panel - illustration */}
          <div className="hidden lg:flex lg:w-[42%] relative items-center justify-center">
            <div className="flex flex-col items-center gap-8">
              {/* Large logo in split mode */}
              <svg
                width={96}
                height={96}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="45" cy="50" r="28" stroke="#2D3A4A" strokeWidth="3" fill="none" />
                <ellipse cx="45" cy="50" rx="28" ry="12" stroke="#2D3A4A" strokeWidth="2" fill="none" />
                <ellipse cx="45" cy="50" rx="12" ry="28" stroke="#2D3A4A" strokeWidth="2" fill="none" />
                <line x1="45" y1="22" x2="45" y2="78" stroke="#2D3A4A" strokeWidth="2" />
                <line x1="17" y1="50" x2="73" y2="50" stroke="#2D3A4A" strokeWidth="2" />
                <circle cx="50" cy="45" r="35" stroke="#2D3A4A" strokeWidth="2.5" strokeDasharray="3 5" fill="none" transform="rotate(-20, 50, 45)" />
                <circle cx="78" cy="25" r="5" fill="#DC3545" />
              </svg>
              <div className="font-bold leading-tight text-4xl text-center">
                <span className="text-navy-500 tracking-wide">TRAVEL</span>
                <br />
                <span className="text-navy-500 tracking-wide">CONNECT</span>
              </div>
            </div>
          </div>
          {/* Right panel - form */}
          <div className="flex-1 flex items-start justify-center overflow-y-auto py-8 px-6 lg:px-12">
            {children}
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          {children}
        </div>
      )}
    </div>
  );
}
