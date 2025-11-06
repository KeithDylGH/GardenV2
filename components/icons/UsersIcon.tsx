import React from 'react';

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}>
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M18 18.72a9.094 9.094 0 00-12 0m12 0a9.094 9.094 0 01-12 0m12 0A4.956 4.956 0 0121 13.5a4.956 4.956 0 01-2.25 4.22m-13.5 0A4.956 4.956 0 013 13.5a4.956 4.956 0 012.25 4.22m13.5 0V21m-13.5-2.28V21m0 0h13.5m-13.5 0H3.002M12 3v5.25m0 0a2.25 2.25 0 01-2.25 2.25H9a2.25 2.25 0 01-2.25-2.25V3.004A2.25 2.25 0 019 1.5h.004A2.25 2.25 0 0112 3.75z" 
    />
  </svg>
);
