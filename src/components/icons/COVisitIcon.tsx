import React from "react";

interface COVisitIconProps {
  className?: string;
}

export const COVisitIcon: React.FC<COVisitIconProps> = ({ className }) => (
  <svg
    viewBox="0 0 512 512"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g>
      <rect x="54.929" y="284.162" width="402.142" height="24.109"></rect>
      <polygon points="75.036,384.717 97.463,384.717 97.463,355.746 414.537,355.746 414.537,384.717 436.965,384.717 457.071,321.279 54.929,321.279 "></polygon>
      <rect x="111.121" y="369.396" width="289.759" height="142.604"></rect>
      <circle cx="256" cy="69.512" r="69.512"></circle>
      <path d="M256,156.942c-85.155,0-106.004,112.531-106.004,112.531h212.008C362.004,269.473,341.155,156.942,256,156.942 z"></path>
    </g>
  </svg>
);
