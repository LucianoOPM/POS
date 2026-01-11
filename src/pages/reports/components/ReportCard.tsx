import { LucideIcon } from "lucide-preact";

interface ReportCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick?: () => void;
}

const ReportCard = ({ title, description, icon: Icon, color, onClick }: ReportCardProps) => {
  return (
    <div
      className="relative overflow-hidden rounded-xl bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover border border-border h-full flex flex-col"
      onClick={onClick}
    >
      {/* Gradient accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-80 group-hover:opacity-100 transition-opacity"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
      />

      {/* Icon container */}
      <div
        className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-6 h-6 transition-colors" style={{ color }} />
      </div>

      {/* Content */}
      <h3 className="text-base font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>

      {/* Arrow indicator */}
      <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        Ver reporte
        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};

export default ReportCard;
