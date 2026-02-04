// Full Page for Map View (Sidebar + Map)
// Todo: implement filtering logic and pass filtered events to Map component
//     - header
import React, { useEffect, useMemo, useState } from 'react';
import Map from '../../components/Map/Map';
import Sidebar from '../../components/Sidebar/Sidebar';
import './MapPage.css';

export default function MapPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    event_type: [], 
    is_free: null,
    dateFrom: '',
    dateTo: '',
    sortBy: 'soonest', 
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setEvents(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed loading events', err);
        setEvents([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => (mounted = false);
  }, []);

  const availableTypes = useMemo(() => {
    const set = new Set();
    events.forEach((e) => e.event_type && set.add(e.event_type));
    return Array.from(set).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    let out = events.slice();

    if (filters.event_type && filters.event_type.length > 0) {
      out = out.filter((e) => filters.event_type.includes(e.event_type));
    }

    if (filters.is_free === true) out = out.filter((e) => !!e.is_free === true);
    if (filters.is_free === false) out = out.filter((e) => !!e.is_free === false);

    const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const to = filters.dateTo ? new Date(filters.dateTo) : null;
    if (from) out = out.filter((e) => new Date(e.start_time) >= from);
    if (to) out = out.filter((e) => new Date(e.start_time) <= to);

    if (filters.sortBy === 'soonest') {
      out.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    } else if (filters.sortBy === 'popular') {
      out.sort((a, b) => (b.visitor_count || 0) - (a.visitor_count || 0));
    } else if (filters.sortBy === 'newest') {
      out.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return out;
  }, [events, filters]);

  return (
    <div className="map-page-root">
      <aside className="map-page-sidebar">
        <Sidebar
          filters={filters}
          setFilters={setFilters}
          availableTypes={availableTypes}
          totalCount={events.length}
          filteredCount={filteredEvents.length}
          loading={loading}
        />
      </aside>

      <main className="map-page-main">
        <Map events={filteredEvents} />
      </main>
    </div>
  );
}