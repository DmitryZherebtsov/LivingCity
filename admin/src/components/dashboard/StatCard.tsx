import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient: 1 | 2 | 3 | 4;
}

export function StatCard({ title, value, change, changeType, icon: Icon, gradient }: StatCardProps) {
  const gradientClass = {
    1: "stat-card-1",
    2: "stat-card-2",
    3: "stat-card-3",
    4: "stat-card-4",
  }[gradient];

  return (
    <div className={cn("rounded-xl p-5 text-white animate-fade-in", gradientClass)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          <p className={cn(
            "text-sm mt-2",
            changeType === "positive" && "text-white/90",
            changeType === "negative" && "text-white/70",
            changeType === "neutral" && "text-white/80"
          )}>
            {change}
          </p>
        </div>
        <div className="p-3 bg-white/20 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
