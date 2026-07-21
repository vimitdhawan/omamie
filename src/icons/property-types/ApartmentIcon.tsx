import { FC } from "react";

export const ApartmentIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" />
    <path d="M3 9l9-7 9 7" />
    <path d="M9 22V9" />
    <path d="M15 22V9" />
  </svg>
);
