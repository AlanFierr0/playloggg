export function ProfileAvatar({ name, className = "" }: { name: string; className?: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return <span role="img" aria-label={`${name} initials`} className={`inline-flex shrink-0 items-center justify-center bg-surface-container-high text-primary font-semibold ${className}`}>{initials || "?"}</span>;
}
