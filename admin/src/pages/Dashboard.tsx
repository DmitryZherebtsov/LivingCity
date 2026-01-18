import { CalendarDays, Users, MapPin, TrendingUp, Plus, Filter, Download } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentEventsTable } from "@/components/dashboard/RecentEventsTable";
import { MapPreview } from "@/components/dashboard/MapPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-header">Dashboard</h1>
          <p className="page-description">Overview of your event management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search events, locations..."
            className="pl-10"
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events"
          value="1,284"
          change="+12% from last month"
          changeType="positive"
          icon={CalendarDays}
          gradient={1}
        />
        <StatCard
          title="Active Locations"
          value="156"
          change="+8 new this week"
          changeType="positive"
          icon={MapPin}
          gradient={2}
        />
        <StatCard
          title="Total Attendees"
          value="48.5K"
          change="+23% from last month"
          changeType="positive"
          icon={Users}
          gradient={3}
        />
        <StatCard
          title="Growth Rate"
          value="18.2%"
          change="+2.4% from last week"
          changeType="positive"
          icon={TrendingUp}
          gradient={4}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentEventsTable />
        </div>
        <div>
          <MapPreview />
        </div>
      </div>
    </div>
  );
}
