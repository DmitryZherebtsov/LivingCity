import { useMemo, useState } from "react";
import Map from "../../components/Map/Map";
import Sidebar from "../../components/Sidebar/Sidebar";
import useEvents from "../../hooks/useEvents";
import "./MapPage.css";

export default function MapPage() {
  const { events, loading, error } = useEvents();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [map, setMap] = useState(null);

  const filteredEvents = useMemo(() => {
  return events.filter((event) => {
    if (!event.start_time || !event.end_time) return false;

    const eventStart = new Date(event.start_time);
    const eventEnd = new Date(event.end_time);

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);

      if (eventEnd < from) return false;
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);

      if (eventStart > to) return false;
    }

    return true;
  });
}, [events, dateFrom, dateTo]);


  return (
    <div className="map-page-root">
      <Sidebar
        map={map}
        dateFrom={dateFrom}
        dateTo={dateTo}
        setDateFrom={setDateFrom}
        setDateTo={setDateTo}
        events={filteredEvents}
        loading={loading}
        error={error}
      />

      <Map 
        events={filteredEvents}
        onMapReady={setMap}
      />
    </div>
  );
}
