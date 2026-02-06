import './Sidebar.css';
import { useEffect, useRef } from "react";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import mapboxgl from "mapbox-gl";
import FilterMap from './FilterMap';

const Sidebar = ({ 
  map, 
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  events,
  loading,
  error, }) => {
  const searchRef = useRef(null); // Reference to the search container div
  const geocoderRef = useRef(null); /// Reference to the geocoder instance
  const containerElRef = useRef(null); // Reference to the geocoder control element

  useEffect(() => {
    if (!map || !searchRef.current) return; // wait until map and ref are ready
    if (geocoderRef.current) return;

    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    }

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: "Szukaj miasta",
      types: "place",
      language: "pl",
    });

    geocoderRef.current = geocoder;

    const ctrlEl = geocoder.onAdd(map);
    containerElRef.current = ctrlEl;

    searchRef.current.appendChild(ctrlEl);


    const onResult = (e) => {
      const [lng, lat] = e.result.center;
      map.flyTo({
        center: [lng, lat],
        zoom: 11,
        speed: 1.5,
        curve: 1.4,
        essential: true,
      });
    };

    geocoder.on("result", onResult);


    return () => { 
      try {
        geocoder.off && geocoder.off("result", onResult);
        geocoder.clear && geocoder.clear();
        if (geocoder.onRemove) {
          geocoder.onRemove();
        } else if (containerElRef.current && searchRef.current.contains(containerElRef.current)) {
          searchRef.current.removeChild(containerElRef.current);
        }
      } catch (err) {
        console.error("Error during geocoder cleanup:", err);
      }
      geocoderRef.current = null;
      containerElRef.current = null;
    };
  }, [map]);

  return (
    <aside className="sidebar-root" lang="pl">
      <div className="sidebar-search" ref={searchRef} />

      <div className="date-filters">
        <label>
          Od:
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            language="pl"
          />
        </label>

        <label>
          Do:
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            language="pl"
          />
        </label>
      </div>


      {/* <FilterMap events={events} loading={loading} error={error} /> */}
      
    </aside>
  );
};

export default Sidebar;
