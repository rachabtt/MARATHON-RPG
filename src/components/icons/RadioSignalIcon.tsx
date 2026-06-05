type IconProps = {
  className?: string;
};

export default function RadioSignalIcon({ className = "h-14 w-14" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M32 46V26" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <path d="M25 52H39" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <path d="M28 46H36L39 56H25L28 46Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M32 26L23 14" stroke="currentColor" strokeWidth="1.5" />
      <path d="M32 26L41 14" stroke="currentColor" strokeWidth="1.5" />
      <path d="M20 26C20 20 25 15 32 15C39 15 44 20 44 26" stroke="currentColor" strokeWidth="1.5" opacity="0.72" />
      <path d="M14 28C14 18 22 9 32 9C42 9 50 18 50 28" stroke="currentColor" strokeWidth="1.5" opacity="0.38" />
      <path d="M11 42H18M46 42H53" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <path d="M9 36H15M49 36H55" stroke="currentColor" strokeWidth="1.5" opacity="0.28" />
      <circle cx="32" cy="26" r="3" fill="currentColor" opacity="0.85" />
    </svg>
  );
}
