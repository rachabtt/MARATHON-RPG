type IconProps = {
  className?: string;
};

export default function ArchiveLogIcon({ className = "h-14 w-14" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M14 15H50V49H14V15Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M18 20H46" stroke="currentColor" strokeWidth="1.4" opacity="0.52" />
      <path d="M18 44H46" stroke="currentColor" strokeWidth="1.4" opacity="0.52" />
      <path d="M21 33H26L29 26L34 40L38 30L41 33H46" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="bevel" />
      <path d="M23 11H41" stroke="currentColor" strokeWidth="1.4" opacity="0.38" />
      <path d="M23 53H41" stroke="currentColor" strokeWidth="1.4" opacity="0.38" />
      <path d="M10 24V40" stroke="currentColor" strokeWidth="1.4" opacity="0.42" />
      <path d="M54 24V40" stroke="currentColor" strokeWidth="1.4" opacity="0.42" />
      <rect x="20" y="24" width="24" height="17" stroke="currentColor" strokeWidth="0.8" opacity="0.24" />
      <path d="M14 15L19 10H45L50 15" stroke="currentColor" strokeWidth="1.2" opacity="0.34" />
    </svg>
  );
}
