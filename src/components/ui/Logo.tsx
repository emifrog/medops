interface LogoProps {
  className?: string;
  title?: string;
}

/**
 * Logo MedOps — Croix médicale stylisée formant une capsule.
 *
 * Combine le symbole médical universel (croix) avec la silhouette d'un
 * médicament (capsule). Le fond utilise le dégradé ambre → rouge (pompiers).
 */
export function Logo({ className = "", title = "MedOps" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      {/* Dégradé de fond pompiers */}
      <defs>
        <linearGradient id="medops-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>

      {/* Fond arrondi */}
      <rect width="48" height="48" rx="10" fill="url(#medops-bg)" />

      {/* Capsule inclinée (fond de la croix) */}
      <g transform="rotate(-45 24 24)">
        <rect
          x="10"
          y="20"
          width="28"
          height="8"
          rx="4"
          fill="#ffffff"
          fillOpacity="0.25"
        />
        {/* Séparation des deux moitiés de la capsule */}
        <line
          x1="24"
          y1="20"
          x2="24"
          y2="28"
          stroke="#ffffff"
          strokeOpacity="0.4"
          strokeWidth="0.75"
        />
      </g>

      {/* Croix médicale blanche par-dessus */}
      <path
        d="M 20 12 L 28 12 L 28 20 L 36 20 L 36 28 L 28 28 L 28 36 L 20 36 L 20 28 L 12 28 L 12 20 L 20 20 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
