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
  art: 'faff0a',
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

    if (typeof onMapReady === "function") {
      onMapReady(map);
    }

    return () => {
      // cleanup
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [onMapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // for debug:
    // console.log('Map - events length:', events?.length, events?.slice?.(0,3));

    // remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!events || events.length === 0) return; // no events to show

    events.forEach((event) => {
      const lng = Number(event.lon);
      const lat = Number(event.lat);

      if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
        // console.warn('Invalid coords for event', event.id, event.lon, event.lat);
        return;
      }

      if (lng === 0 && lat === 0) return;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <h3>${event.title}</h3>
        <p><strong>${event.event_type}</strong></p>
        <p>${event.description}</p>
        ${event.url ? `<a href="${event.url}" target="_blank" rel="noopener noreferrer">Więcej Informacji</a>` : ''}
      `);

      const rawType = (event.event_type || '').toLowerCase();
      const color = typeColors[rawType] || typeColors.default;

      const marker = new mapboxgl.Marker({ color })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [events]);

  return (
    <div ref={containerRef} className="map-container" />
  );
};

export default Map;
