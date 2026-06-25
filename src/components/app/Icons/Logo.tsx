type LogoProps = {
  className?: string;
  title?: string;
};

export function Logo({ className, title = "FinSight AI" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 40"
      fill="none"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="logo-icon-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7F77DD" />
          <stop offset="100%" stopColor="#534AB7" />
        </linearGradient>
        <linearGradient id="logo-pulse-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#AFA9EC" stopOpacity="0" />
          <stop offset="40%" stopColor="#AFA9EC" />
          <stop offset="100%" stopColor="#534AB7" />
        </linearGradient>
      </defs>

      <rect
        x="0"
        y="2"
        width="36"
        height="36"
        rx="9"
        fill="url(#logo-icon-grad)"
      />
      <line
        x1="5"
        y1="23.5"
        x2="31"
        y2="23.5"
        stroke="#AFA9EC"
        strokeWidth="0.6"
        strokeOpacity="0.4"
      />
      <polyline
        points="5,23  10,23  13,14  15,26  17,19  20,23  31,23"
        stroke="url(#logo-pulse-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="14" r="2.2" fill="#EEEDFE" />
      <circle cx="13" cy="14" r="1.2" fill="#534AB7" />
      <line
        x1="23"
        y1="9"
        x2="30"
        y2="9"
        stroke="#AFA9EC"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
      <line
        x1="23"
        y1="12.5"
        x2="28"
        y2="12.5"
        stroke="#AFA9EC"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />

      <text
        x="43"
        y="25"
        fontFamily="'SF Pro Display', 'DM Sans', 'Geist', system-ui, sans-serif"
        fontSize="22"
        fill="currentColor"
      >
        <tspan fontWeight="300" letterSpacing="-0.3">
          Fin
        </tspan>
        <tspan
          dx="0"
          fontWeight="600"
          letterSpacing="-0.5"
          fill="hsl(var(--primary))"
        >
          Sight
        </tspan>
      </text>
      <rect
        x="135"
        y="14"
        width="20"
        height="14"
        rx="3"
        fill="hsl(var(--primary-soft))"
      />
      <text
        x="145"
        y="24"
        textAnchor="middle"
        fontFamily="'SF Mono', 'Geist Mono', 'Fira Code', monospace"
        fontSize="9"
        fontWeight="600"
        letterSpacing="0.5"
        fill="hsl(var(--primary))"
      >
        AI
      </text>
    </svg>
  );
}

export function LogoMark({ className, title = "FinSight AI" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 36 40"
      fill="none"
      role="img"
      aria-label={title}
      className={className}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id="logo-mark-icon-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7F77DD" />
          <stop offset="100%" stopColor="#534AB7" />
        </linearGradient>
        <linearGradient id="logo-mark-pulse-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#AFA9EC" stopOpacity="0" />
          <stop offset="40%" stopColor="#AFA9EC" />
          <stop offset="100%" stopColor="#534AB7" />
        </linearGradient>
      </defs>

      <rect
        x="0"
        y="2"
        width="36"
        height="36"
        rx="9"
        fill="url(#logo-mark-icon-grad)"
      />
      <line
        x1="5"
        y1="23.5"
        x2="31"
        y2="23.5"
        stroke="#AFA9EC"
        strokeWidth="0.6"
        strokeOpacity="0.4"
      />
      <polyline
        points="5,23  10,23  13,14  15,26  17,19  20,23  31,23"
        stroke="url(#logo-mark-pulse-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="14" r="2.2" fill="#EEEDFE" />
      <circle cx="13" cy="14" r="1.2" fill="#534AB7" />
      <line
        x1="23"
        y1="9"
        x2="30"
        y2="9"
        stroke="#AFA9EC"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
      <line
        x1="23"
        y1="12.5"
        x2="28"
        y2="12.5"
        stroke="#AFA9EC"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />
    </svg>
  );
}
