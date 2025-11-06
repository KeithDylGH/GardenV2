
import React from 'react';

export const FlowerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" {...props}>
    <defs>
      <radialGradient id="grad1" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style={{stopColor: 'rgb(255,255,100)', stopOpacity: 1}} />
        <stop offset="100%" style={{stopColor: 'rgb(251, 191, 36)', stopOpacity: 1}} />
      </radialGradient>
      <linearGradient id="petal1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: 'rgb(239, 68, 68)'}} />
        <stop offset="100%" style={{stopColor: 'rgb(251, 146, 60)'}} />
      </linearGradient>
      <linearGradient id="petal2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: 'rgb(168, 85, 247)'}} />
        <stop offset="100%" style={{stopColor: 'rgb(219, 39, 119)'}} />
      </linearGradient>
      <linearGradient id="petal3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: 'rgb(59, 130, 246)'}} />
        <stop offset="100%" style={{stopColor: 'rgb(34, 211, 238)'}} />
      </linearGradient>
       <linearGradient id="petal4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: 'rgb(34, 197, 94)'}} />
        <stop offset="100%" style={{stopColor: 'rgb(163, 230, 53)'}} />
      </linearGradient>
    </defs>
    <g transform="translate(50, 50)">
      <path d="M0 -40 C 25 -40, 25 -10, 0 0 C -25 -10, -25 -40, 0 -40" fill="url(#petal1)" transform="rotate(45)"/>
      <path d="M0 -40 C 25 -40, 25 -10, 0 0 C -25 -10, -25 -40, 0 -40" fill="url(#petal2)" transform="rotate(135)"/>
      <path d="M0 -40 C 25 -40, 25 -10, 0 0 C -25 -10, -25 -40, 0 -40" fill="url(#petal3)" transform="rotate(225)"/>
      <path d="M0 -40 C 25 -40, 25 -10, 0 0 C -25 -10, -25 -40, 0 -40" fill="url(#petal4)" transform="rotate(315)"/>
    </g>
    <circle cx="50" cy="50" r="15" fill="url(#grad1)" />
  </svg>
);
