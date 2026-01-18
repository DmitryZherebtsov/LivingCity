import { MapPin, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const eventPins = [
  { id: 1, name: "Tech Conference", x: 25, y: 35 },
  { id: 2, name: "Music Festival", x: 55, y: 55 },
  { id: 3, name: "Food Expo", x: 78, y: 28 },
  { id: 4, name: "Art Gallery", x: 18, y: 65 },
  { id: 5, name: "Startup Night", x: 42, y: 22 },
];

export function MapPreview() {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden animate-fade-in">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-card-foreground">Events Map</h3>
          <p className="text-sm text-muted-foreground">Geographic distribution</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
          Full View
        </Button>
      </div>
      <div className="relative h-64 bg-gradient-to-br from-secondary via-muted to-secondary">
        {/* Simplified map visualization */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M10,30 Q20,15 35,20 T50,30 T70,25 T90,35 L90,80 L10,80 Z"
              fill="currentColor"
              className="text-primary"
            />
            <path
              d="M5,50 Q25,40 45,55 T75,45 T95,55 L95,80 L5,80 Z"
              fill="currentColor"
              className="text-primary/50"
            />
          </svg>
        </div>
        
        {/* Event pins */}
        {eventPins.map((pin) => (
          <div
            key={pin.id}
            className="absolute transform -translate-x-1/2 -translate-y-full group cursor-pointer"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <div className="relative">
              <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping" />
              <MapPin className="w-6 h-6 text-primary drop-shadow-lg" />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
              {pin.name}
            </div>
          </div>
        ))}

        {/* Map controls */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-1">
          <Button variant="secondary" size="icon" className="w-8 h-8">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" className="w-8 h-8">
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
