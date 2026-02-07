import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Map from "../../components/Map/Map";
import Sidebar from "../../components/Sidebar/Sidebar";
import useEvents from "../../hooks/useEvents";
import "./MapPage.css";

export default function MapPage() {
  const { events, loading, error } = useEvents();

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [map, setMap] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState([]);

  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const lng = parseFloat(params.get("lng"));
  const lat = parseFloat(params.get("lat"));
  const place = params.get("place") || "";
  const hasInitialCenter = Number.isFinite(lng) && Number.isFinite(lat);
  const initialCenter = hasInitialCenter ? [lng, lat] : null;
  const initialZoom = hasInitialCenter ? 11 : 3.5;

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

      if (selectedTypes.length > 0) {
        if (!selectedTypes.includes(event.event_type)) {
          return false;
        }
      }

      return true;
    });
  }, [events, dateFrom, dateTo, selectedTypes]);

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
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
      />

      <Map
        events={filteredEvents}
        onMapReady={setMap}
        initialCenter={initialCenter}
        initialZoom={initialZoom}
      />
    </div>
  );
}
