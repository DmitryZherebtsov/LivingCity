import './Sidebar.css';
import { useEffect, useRef, useState } from "react";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import mapboxgl from "mapbox-gl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";

const stringToHsl = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  const s = 65;
  const l = 52;
  return { h, s, l };
};

const hslToCss = (h, s, l, a = 1) => `hsla(${h}, ${s}%, ${l}%, ${a})`;

const Sidebar = ({
  map,
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  events,
  loading,
  error,
  selectedTypes,
  setSelectedTypes,
}) => {
  const searchRef = useRef(null);
  const geocoderRef = useRef(null);
  const containerElRef = useRef(null);
  const [imgError, setImgError] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const [eventTypes, setEventTypes] = useState([]);
  const tagsRef = useRef(null);
  const [compactScroll, setCompactScroll] = useState(false);

  const EVENTS_STEP = 20;
  const [visibleCount, setVisibleCount] = useState(EVENTS_STEP);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await axios.get('/api/events/event-types');
        const types = res.data || [];
        setEventTypes(types);
        if (!selectedTypes || selectedTypes.length === 0) {
          setSelectedTypes(types.slice());
        }
      } catch (err) {
        console.error('Failed to load event types', err);
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    if (!tagsRef.current) return;
    const el = tagsRef.current;
    requestAnimationFrame(() => {
      const children = el.children;
      if (!children || children.length === 0) {
        setCompactScroll(false);
        return;
      }
      const first = children[0];
      const tagH = first.getBoundingClientRect().height || 36;
      const maxTwoRows = tagH * 2 + 8;
      const actualHeight = el.scrollHeight;
      if (actualHeight > maxTwoRows + 2) {
        setCompactScroll(true);
      } else {
        setCompactScroll(false);
      }
    });
  }, [eventTypes, window.innerWidth, events?.length, selectedTypes]);

  useEffect(() => {
    if (!map || !searchRef.current) return;
    if (geocoderRef.current) return;

    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    }

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: "Znajdź swoje miasto",
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

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const getEventImage = (event) => {
    const first = event.first_image || (Array.isArray(event.images) && event.images[0]);
    if (!first) return null;
    return `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/uploads/events/${event.id}/${first.filename}`;
  };

  useEffect(() => {
    setVisibleCount(EVENTS_STEP);
  }, [events, selectedTypes, dateFrom, dateTo]);

  return (
    <aside
      className={`sidebar-root ${isOpen ? "open" : "closed"}`}
      lang="pl"
    >
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      <div className="sidebar-search" ref={searchRef}></div>

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

      <div className="event-type-filters">
        <span className="filters-title">Typ wydarzenia</span>

        <div className={`event-type-tags ${compactScroll ? "compact" : "multirow"}`} ref={tagsRef}>
          {eventTypes.map((type) => {
            const { h, s, l } = stringToHsl(type || "Inne");
            const baseBg = hslToCss(h, s, l, 0.08);
            const baseBorder = hslToCss(h, s, l, 0.25);
            const activeBg = hslToCss(h, s, l, 0.25);
            const activeBox = `0 0 0 6px ${hslToCss(h, s, l, 0.12)}`;
            const isActive = selectedTypes.includes(type);

            const style = isActive
              ? { background: activeBg, borderColor: baseBorder, boxShadow: activeBox, color: '#fff' }
              : { background: baseBg, borderColor: baseBorder, color: '#cbd5f5' };

            return (
              <button
                key={type}
                type="button"
                data-type={type}
                className={`event-type-tag ${isActive ? "active" : ""}`}
                onClick={() => toggleType(type)}
                style={style}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sidebar-events">
        <div className="sidebar-events-header">
          <span>Wydarzenia w pobliżu</span>
          <span className="events-count">{events.length} znalezionych</span>
        </div>

        {loading && <div className="sidebar-events-state">Ładowanie wydarzeń…</div>}
        {error && <div className="sidebar-events-state error">Nie udało się załadować wydarzeń…</div>}

        {!loading && !error && events.length === 0 && (
          <div className="sidebar-events-state">Nie znaleziono wydarzeń :\</div>
        )}

        <ul className="sidebar-events-list">
          {events.slice(0, visibleCount).map((event) => {
            const imageUrl = getEventImage(event);
            return (
              <li key={event.id} className="sidebar-event-card">
                <div className="event-image">
                  {imageUrl && !imgError ? (
                    <img
                      src={imageUrl}
                      alt={event.title}
                      loading="lazy"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="event-image-placeholder">
                      {event.event_type}
                    </div>
                  )}
                </div>
                <div className="event-content">
                  <h4 className="event-title">{event.title}</h4>

                  <div>
                    <span className='event-description'>{event.description}</span>
                  </div>

                  <div className="event-meta">
                    <span className="event-type">
                      {event.is_free ? (
                        <span className="event-free">Bezpłatne</span>
                      ) : (
                        <span className="event-paid">Bilety</span>
                      )}
                      {event.event_type}
                    </span>

                    <span className="event-date">
                      {new Date(event.start_time).toLocaleDateString("pl-PL")}
                    </span>
                  </div>

                </div>
              </li>
            );
          })}
          {visibleCount < events.length && (
          <button
            className="show-more-btn"
            onClick={() => setVisibleCount(prev => prev + EVENTS_STEP)}
          >
            Pokaż więcej
          </button>
        )}
        </ul>
  
      </div>
    </aside>
  );
};

export default Sidebar;