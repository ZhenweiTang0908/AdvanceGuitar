import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, note, icon: Icon }: StatCardProps) {
  return (
    <article className="stat-card">
      <span className="stat-card__icon"><Icon aria-hidden="true" size={18} /></span>
      <span className="stat-card__label">{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
