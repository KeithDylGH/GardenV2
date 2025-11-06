import React from 'react';

export const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2} 
        stroke="currentColor" 
        {...props}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M16.023 9.348A9 9 0 1 0 6.023 21.348" 
        />
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M15.75 2.25v6h-6" 
        />
    </svg>
);