import { useId } from 'react';

type BrandMarkProps = {
  className?: string;
};

const BrandMark = ({ className }: BrandMarkProps) => {
  const gradientId = useId();

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="10" x2="54" y1="8" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#16A34A" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${gradientId})`} />
      <path d="M24 23v-3.5A3.5 3.5 0 0 1 27.5 16h9a3.5 3.5 0 0 1 3.5 3.5V23" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
      <rect x="13" y="22" width="38" height="29" rx="7" fill="none" stroke="#fff" strokeWidth="4" />
      <path d="m24 37 6 6 11-13" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default BrandMark;
