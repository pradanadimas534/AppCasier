import React from 'react';

export const SuccessCheck: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 104, color = '#34A853' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center animate-[pop_0.9s_ease-out]"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="44" fill={color} fillOpacity="0.12" />
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke={color}
          strokeWidth="7.5"
          strokeLinecap="round"
          strokeDasharray="276"
          strokeDashoffset="0"
        />
        <path
          d="M30 52L44 66L72 36"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
