import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

function eventColor(event) {
  const seed = Number(event.id) || Math.random() * 1000;

  const hue = (seed * 137.508) % 360; 

  const saturation = 70 + (seed % 10); 
  const lightness = 55 + (seed % 8);  

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

const Map = ({ onMapReady, events = [], initialCenter = null, initialZoom = 3.5 }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const startCenter =
      initialCenter && Array.isArray(initialCenter)
        ? initialCenter
        : [10, 50];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/dmitryzh/cmgdrdox900du01sa2oenbhr8',
      center: startCenter,
      zoom: initialZoom,
      pitch: 0,
      bearing: 0,
      antialias: true,
      language: 'pl',
    });

    mapRef.current = map;

    if (typeof onMapReady === 'function') {
      onMapReady(map);
    }

    if (initialCenter) {
      map.once('load', () => {
        map.flyTo({
          center: initialCenter,
          zoom: Math.max(initialZoom, 10),
          speed: 1.5,
          curve: 1.4,
          essential: true,
        });
      });
    }

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, [onMapReady, initialZoom, initialCenter?.[0], initialCenter?.[1]]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    if (!events.length) return;

    events.forEach(event => {
      const lng = Number(event.lon);
      const lat = Number(event.lat);

      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
      if (lng === 0 && lat === 0) return;

      const type = event.event_type || 'Inne';
      const color = eventColor(event);

      const imageUrl = event.first_image?.filename
        ? `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/uploads/events/${event.id}/${event.first_image.filename}`
        : null;

      const popupHTML = `
        <div style="width:220px;font-family:system-ui;background:rgba(10,15,25,0.95);padding:12px;border-radius:14px;color:#fff;">
          ${imageUrl ? `<img src="${imageUrl}" style="width:100%;height:100px;object-fit:cover;border-radius:10px;margin-bottom:10px;" />` : ``}
          <h3 style="margin:0 0 4px 0;font-size:15px;font-weight:600;line-height:1.3;">${event.title}</h3>
          <p style="margin:0 0 6px 0;font-size:12px;opacity:0.7;">${type}</p>
          <p style="margin:0 0 10px 0;font-size:13px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;opacity:0.85;">${event.description || ''}</p>
          <a href="/events/${event.id}" style="font-size:13px;font-weight:500;color:#12B9D6;text-decoration:none;">Więcej Informacji →</a>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML);

      const offset = 0.0007;

      const adjustedLng = lng + (Math.random() - 0.5) * offset;
      const adjustedLat = lat + (Math.random() - 0.5) * offset;

      const marker = new mapboxgl.Marker({ color })
        .setLngLat([adjustedLng, adjustedLat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [events]);

  console.log("MAP EVENTS:", events.length);

  return <div ref={containerRef} className="map-container" />;
};

export default Map;