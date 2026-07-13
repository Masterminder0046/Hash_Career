import React from 'react';

interface LogoIconProps {
  className?: string;
}

export default function LogoIcon({ className = 'w-8 h-8' }: LogoIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Premium metallic gold gradient */}
        <linearGradient id="logo-gold-grad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#9C721B" />
          <stop offset="40%" stopColor="#E6C665" />
          <stop offset="70%" stopColor="#F3E092" />
          <stop offset="100%" stopColor="#A37A20" />
        </linearGradient>
      </defs>

      {/* 4-pointed Star */}
      <path
        d="M 132 4 Q 132 16 144 16 Q 132 16 132 28 Q 132 16 120 16 Q 132 16 132 4 Z"
        fill="url(#logo-gold-grad)"
      />

      {/* Human Figure Head (floating, inherits text color) */}
      <circle cx="70" cy="36" r="15" fill="currentColor" />

      {/* Human Figure Body (inherits text color) */}
      <path
        d="M 120 24 C 112 36 92 48 64 52 C 58 53 58 53 58 54 C 42 66 26 82 14 100 C 28 100 48 105 64 118 C 68 128 64 142 52 152 C 70 145 90 120 102 92 C 108 78 114 50 120 24 Z"
        fill="currentColor"
      />

      {/* Gold Gradient Bar Chart with Slanted Tops */}
      {/* Bar 1 (Left) */}
      <path
        d="M 65 160 L 65 150 C 65 147 67 145 71 144 L 77 142 L 77 160 Z"
        fill="url(#logo-gold-grad)"
      />

      {/* Bar 2 (Middle) */}
      <path
        d="M 83 160 L 83 124 C 83 120 85 117 89 116 L 95 112 L 95 160 Z"
        fill="url(#logo-gold-grad)"
      />

      {/* Bar 3 (Right) */}
      <path
        d="M 101 160 L 101 92 C 101 87 103 83 107 81 L 113 78 L 113 160 Z"
        fill="url(#logo-gold-grad)"
      />
    </svg>
  );
}
