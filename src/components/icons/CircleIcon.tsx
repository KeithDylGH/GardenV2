import React from 'react';

export const CircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M12 21a9 9 0 100-18 9 9 0 000 18z"
      clipRule="evenodd"
    />
  </svg>
);