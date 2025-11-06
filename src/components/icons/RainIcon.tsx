import React from 'react';

export const RainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
    >
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 21a9.01 9.01 0 006.36-2.64c2.05-2.05 2.64-5.1-1.39-9.07C13.23 4.54 12 2.25 12 2.25S10.77 4.54 7.03 9.29c-4.03 3.97-3.44 7.02-1.39 9.07A9.01 9.01 0 0012 21z"
    />
  </svg>
);
