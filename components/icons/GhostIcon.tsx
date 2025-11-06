import React from 'react';

export const GhostIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-1.5-1.5L18 21l-1.5-1.5L15 21l-1.5-1.5L12 21l-1.5-1.5L9 21l-1.5-1.5L6 21l-1.5-1.5L3 21V12a9 9 0 019-9h0a9 9 0 019 9v9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h.01M15 12h.01" />
    </svg>
);
