type IconProps = {
  className?: string;
};

export default function SystemNodeIcon({ className = "h-14 w-14" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M20 20H44V44H20V20Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M26 26H38V38H26V26Z" stroke="currentColor" strokeWidth="1.2" opacity="0.58" />
      <path d="M32 8V20M32 44V56M8 32H20M44 32H56" stroke="currentColor" strokeWidth="1.4" />
      <path d="M16 16L22 22M48 16L42 22M16 48L22 42M48 48L42 42" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      <circle cx="32" cy="32" r="3" fill="currentColor" opacity="0.68" />
    </svg>
  );
}
