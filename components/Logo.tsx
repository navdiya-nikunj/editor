interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 40, showText = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circle background */}
        <circle cx="50" cy="50" r="45" fill="#3B82F6" />
        
        {/* Two devices */}
        <rect x="20" y="30" width="25" height="35" rx="3" fill="white" opacity="0.9" />
        <rect x="55" y="30" width="25" height="35" rx="3" fill="white" opacity="0.9" />
        
        {/* Sync arrows */}
        <path
          d="M 42 45 L 48 45 L 45 41 M 48 45 L 45 49"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 58 55 L 52 55 L 55 51 M 52 55 L 55 59"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {showText && (
        <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          ClipSync
        </span>
      )}
    </div>
  );
}


