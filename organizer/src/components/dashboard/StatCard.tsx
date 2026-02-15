import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  gradient?: 1 | 2 | 3 | 4;
}

const gradients: Record<number, string> = {
  1: "bg-gradient-to-br from-orange-500 to-orange-600",
  2: "bg-gradient-to-br from-emerald-500 to-green-600",
  3: "bg-gradient-to-br from-yellow-500 to-amber-600",
  4: "bg-gradient-to-br from-blue-500 to-indigo-600",
};

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  gradient = 1,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "text-white border-0 shadow-xl rounded-2xl",
        gradients[gradient]
      )}
    >
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm opacity-90">{title}</p>
          <Icon className="h-5 w-5 opacity-90" />
        </div>

        <div>
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm opacity-80 mt-1">{change}</p>
        </div>
      </div>
    </Card>
  );
}
