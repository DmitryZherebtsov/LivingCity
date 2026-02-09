import './Sidebar.css';
import { useEffect, useRef, useState } from "react";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import mapboxgl from "mapbox-gl";

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
  const searchRef = useRef(null); // Reference to the search container div
  const geocoderRef = useRef(null); /// Reference to the geocoder instance
  const containerElRef = useRef(null); // Reference to the geocoder control element
  const [imgError, setImgError] = useState(false);
   
  const EVENT_TYPES = [
    "concert",
    "sport",
    "festival",
    "conference",
    "community",
    "meeting",
    "art",
    "standup",
    "other",
  ];
  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

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

  // console.log('events sample', events?.slice?.(0,21));
  // console.log("Sidebar events:", events.length);

  const getEventImage = (event) => {
    const first = event.first_image || (Array.isArray(event.images) && event.images[0]);
    if (!first) return null;

    return `http://localhost:3000/uploads/events/${event.id}/${first.filename}`;
  };


  useEffect(() => {
    if (!events || events.length === 0) return;

    const withImages = events.find(
      e => Array.isArray(e.images) && e.images.length > 1
    );

    // if (withImages) {
    //   console.log("EVENT WITH MULTIPLE IMAGES:", withImages);
    // }
  }, [events]);


  return (
    <aside className="sidebar-root" lang="pl">

      <div className="sidebar-search" ref={searchRef}>  </div>

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

      {/* <img src="http://localhost:3000/uploads/events/21/1770423805797-92c39196-8b3a-4ce9-8c77-704a10145aa5.png" alt="" /> */}

      <div className="event-type-filters">
        <span className="filters-title">Typ wydarzenia</span>

        <div className="event-type-tags">
          {EVENT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              data-type={type}
              className={`event-type-tag ${
                selectedTypes.includes(type) ? "active" : ""
              }`}
              onClick={() => toggleType(type)}
            >
              {type}
            </button>
          ))}
        </div>

      </div>
      {/* <FilterMap events={events} loading={loading} error={error} /> */}

      <div className="sidebar-events">
        <div className="sidebar-events-header">
          <span>Wydarzenia w pobliżu</span>
          <span className="events-count">{events.length} found</span>
        </div>

        {loading && <div className="sidebar-events-state">Loading events…</div>}
        {error && <div className="sidebar-events-state error">Failed to load events</div>}

        {!loading && !error && events.length === 0 && (
          <div className="sidebar-events-state">Nie znaleziono wydarzeń :\</div>
        )}

        <ul className="sidebar-events-list">
          {events.map((event) => {
            const imageUrl = getEventImage(event);
            // console.log(`Event ${event.id} image URL:`, imageUrl);
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

                      {event.is_free && (
                        <span className="event-free">Free</span>
                      ) || (
                        <span className="event-paid">Tickets</span>
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
        </ul>
      </div>
      
    </aside>
  );
};

export default Sidebar;
