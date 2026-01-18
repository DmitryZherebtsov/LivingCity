import { useState } from "react";
import { MapPin, Search, Filter, Layers, ZoomIn, ZoomOut, Crosshair, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const eventLocations = [
  { id: 1, name: "Tech Conference 2024", location: "San Francisco, CA", x: 15, y: 40, attendees: 1250, category: "Technology" },
  { id: 2, name: "Music Festival", location: "Austin, TX", x: 45, y: 65, attendees: 5000, category: "Entertainment" },
  { id: 3, name: "Food & Wine Expo", location: "New York, NY", x: 85, y: 35, attendees: 800, category: "Food & Drink" },
  { id: 4, name: "Art Gallery Opening", location: "Los Angeles, CA", x: 12, y: 55, attendees: 320, category: "Arts" },
  { id: 5, name: "Startup Pitch Night", location: "Seattle, WA", x: 10, y: 20, attendees: 150, category: "Business" },
  { id: 6, name: "Marathon 2024", location: "Boston, MA", x: 90, y: 30, attendees: 8500, category: "Sports" },
];

export default function MapView() {
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [showList, setShowList] = useState(true);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border bg-card/50">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="page-header">Map View</h1>
            <p className="page-description">Explore events by location</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Input placeholder="Search locations..." className="pl-10" />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <Button
              variant={showList ? "default" : "outline"}
              size="icon"
              onClick={() => setShowList(!showList)}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 flex">
        {/* Map */}
        <div className="flex-1 relative bg-gradient-to-br from-muted via-secondary to-muted overflow-hidden">
          {/* Decorative map elements */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Stylized map shapes */}
          <div className="absolute inset-0 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
              <path d="M0,40 Q10,35 20,40 T40,35 T60,40 T80,35 T100,40 L100,100 L0,100 Z" fill="currentColor" className="text-primary"/>
              <path d="M0,55 Q15,50 30,55 T60,50 T90,55 T100,50 L100,100 L0,100 Z" fill="currentColor" className="text-primary/60"/>
              <path d="M0,70 Q20,65 40,70 T80,65 T100,70 L100,100 L0,100 Z" fill="currentColor" className="text-primary/30"/>
            </svg>
          </div>

          {/* Event Pins */}
          {eventLocations.map((event) => (
            <div
              key={event.id}
              className={`absolute transform -translate-x-1/2 -translate-y-full cursor-pointer transition-all duration-200 ${
                selectedEvent === event.id ? "z-20 scale-125" : "z-10 hover:scale-110"
              }`}
              style={{ left: `${event.x}%`, top: `${event.y}%` }}
              onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
            >
              <div className="relative">
                {selectedEvent === event.id && (
                  <div className="absolute -inset-3 bg-primary/30 rounded-full animate-ping" />
                )}
                <div className={`p-2 rounded-full shadow-lg ${
                  selectedEvent === event.id ? "bg-primary" : "bg-card border border-border"
                }`}>
                  <MapPin className={`w-5 h-5 ${selectedEvent === event.id ? "text-primary-foreground" : "text-primary"}`} />
                </div>
              </div>
              
              {/* Event tooltip */}
              {selectedEvent === event.id && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 bg-card border border-border rounded-lg shadow-xl p-4 min-w-64 animate-fade-in">
                  <h4 className="font-semibold text-card-foreground">{event.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{event.location}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline">{event.category}</Badge>
                    <span className="text-sm text-muted-foreground">{event.attendees.toLocaleString()} attendees</span>
                  </div>
                  <Button size="sm" className="w-full mt-3">View Details</Button>
                </div>
              )}
            </div>
          ))}

          {/* Map Controls */}
          <div className="absolute right-4 bottom-4 flex flex-col gap-2">
            <Button variant="secondary" size="icon" className="shadow-lg">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="icon" className="shadow-lg">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="icon" className="shadow-lg">
              <Crosshair className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="icon" className="shadow-lg">
              <Layers className="w-4 h-4" />
            </Button>
          </div>

          {/* Map legend */}
          <div className="absolute left-4 bottom-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs">
            <p className="font-medium text-card-foreground mb-2">Event Density</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary/30" />
                <span className="text-muted-foreground">Low</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary/60" />
                <span className="text-muted-foreground">Medium</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Events List Sidebar */}
        {showList && (
          <div className="w-80 border-l border-border bg-card animate-slide-in">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-card-foreground">Nearby Events</h3>
              <p className="text-sm text-muted-foreground">{eventLocations.length} events found</p>
            </div>
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="p-4 space-y-3">
                {eventLocations.map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedEvent === event.id
                        ? "border-primary bg-accent"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                  >
                    <h4 className="font-medium text-card-foreground">{event.name}</h4>
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.location}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className="text-xs">{event.category}</Badge>
                      <span className="text-xs text-muted-foreground">{event.attendees.toLocaleString()} attendees</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
