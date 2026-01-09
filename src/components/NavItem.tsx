import { LucideIcon } from "lucide-preact";

interface Props {
  item: { id: string; icon: LucideIcon; label: string };
  onClick: (id: string) => void;
  isActive: boolean;
}
export default function NavItem({ item, isActive, onClick }: Props) {
  return (
    <button
      onClick={() => onClick(item.id)}
      title={item.label}
      className={`w-14 h-14 flex items-center justify-center rounded-xl transition-all duration-200 relative group hover:cursor-pointer ${
        isActive
          ? "bg-primary-500 text-white shadow-md shadow-primary-500/30 scale-105"
          : "text-secondary-600 hover:bg-primary-50 hover:text-primary-600 hover:scale-105"
      }`}
    >
      <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />

      {/* Tooltip mejorado */}
      <span className="absolute left-full ml-3 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
        {item.label}
      </span>
    </button>
  );
}
