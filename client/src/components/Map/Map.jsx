import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './Map.css';

const typeColors = {
  concert: '#FF4D4D',
  sport: '#3B82F6',
  festival: '#4ae236',
  conference: '#8B5CF6',
  community: '#10B981',
  
  default: '#ff8c00',
};

const Map = ({ onMapReady, events = [] }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/dmitryzh/cmgdrdox900du01sa2oenbhr8',
      center: [10, 50],
      zoom: 3.5,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    mapRef.current = map;

    if (typeof onMapReady === 'function') {
      onMapReady(map);
    }

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [onMapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!events || events.length === 0) return;

    events.forEach((event) => {
      if (!event.lon || !event.lat) return;
      if (parseFloat(event.lat) === 0 && parseFloat(event.lon) === 0) return;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <h3>${event.title}</h3>
        <p><strong>${event.event_type}</strong></p>
        <p>${event.description}</p>
        <a href="${event.url}" target="_blank" rel="noopener noreferrer">More Info</a>
      `);

      const rawType = (event.event_type || '').toLowerCase();
      const color = typeColors[rawType] || typeColors.default;

      const marker = new mapboxgl.Marker({ color })
        .setLngLat([parseFloat(event.lon), parseFloat(event.lat)])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [events]);

  return (
    <div ref={containerRef} className="map-container">  
    
    </div>
  );
};

export default Map;