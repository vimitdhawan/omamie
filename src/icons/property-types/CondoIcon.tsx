"use client";

import { FC } from "react";

/**
 * CondoIcon - Wrapper for condo SVG
 * Created as wrapper because Next.js Turbopack doesn't automatically
 * convert SVG imports to React components with the current config.
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/images#svg-images
 */
export const CondoIcon: FC<{ className?: string }> = ({ className }) => (
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
    <path d="M3 21h18" />
    <path d="M3 16h18" />
    <path d="M3 11h18" />
    <path d="M3 6h18" />
    <path d="M3 3v18" />
    <path d="M21 3v18" />
  </svg>
);
