import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const TYPE_COLORS = {
  concert: '#e74c3c',
  festival: '#8e44ad',
  sport: '#3498db',
  meetup: '#27ae60',
  conference: '#f39c12',
  market: '#16a085',
  concert_rock: '#c0392b',
  default: '#f1c40f'
};

const resolveColor = (event) => {
  if (!event) return TYPE_COLORS.default;
  const t = (event.event_type || event.type || '').toLowerCase();
  return TYPE_COLORS[t] || TYPE_COLORS.default;
};

const MapEvents = ({ mapRef, isRotatingRef, endpoint = 'http://localhost:3000/api/events' }) => {
  const markersRef = useRef([]);

  useEffect(() => {
    let cancelled = false;

    const clearMarkers = () => {
      markersRef.current.forEach((m) => {
        try { m.remove(); } catch (e) {}
      });
      markersRef.current = [];
    };

    const createMarker = (map, ev) => {
      // Support both flat lon/lat and GeoJSON-like { location: { coordinates: [lng,lat] } }
      const lon = ev.lon ?? (ev.location && ev.location.coordinates && ev.location.coordinates[0]);
      const lat = ev.lat ?? (ev.location && ev.location.coordinates && ev.location.coordinates[1]);

      if (lon === undefined || lat === undefined) return null;
      const lngn = Number(lon);
      const latn = Number(lat);
      if (!isFinite(lngn) || !isFinite(latn)) return null;

      const color = resolveColor(ev);

      // create custom element so we can style it
      const el = document.createElement('div');
      el.className = 'event-marker';
      el.style.backgroundColor = color;
      el.style.width = '18px';
      el.style.height = '18px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.5)';
      el.style.cursor = 'pointer';

      const popupHtml = `
        <div style="min-width:180px">
          <strong style="display:block;margin-bottom:6px">${ev.title || 'Event'}</strong>
          <div style="font-size:12px;margin-bottom:6px">${ev.address || ''}</div>
          <div style="font-size:12px;color:#666;margin-bottom:6px">${ev.start_time ? (new Date(ev.start_time)).toLocaleString() : ''}</div>
          ${ev.description ? `<div style="font-size:12px;margin-bottom:6px">${ev.description.slice(0, 200)}${ev.description.length>200 ? '...' : ''}</div>` : ''}
          ${ev.url ? `<a href="${ev.url}" target="_blank" rel="noreferrer">Details</a>` : ''}
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lngn, latn])
        .setPopup(new mapboxgl.Popup({ offset: 15 }).setHTML(popupHtml))
        .addTo(map);

      // click behavior: fly to and stop rotation
      el.addEventListener('click', (e) => {
        try { isRotatingRef.current = false; } catch (err) {}
        map.flyTo({ center: [lngn, latn], zoom: 12, speed: 1.2, curve: 1.4, essential: true });
        // open popup after fly (popup opens on click anyway)
        setTimeout(() => marker.togglePopup(), 500);
      });

      return marker;
    };

    const load = async () => {
      const map = mapRef.current;
      if (!map) return;

      try {
        const res = await fetch(endpoint);
        if (!res.ok) {
          console.error('Failed to fetch events', res.status);
          return;
        }
        const data = await res.json();
        if (cancelled) return;

        clearMarkers();

        // Expecting an array
        const arr = Array.isArray(data) ? data : (data.rows || data.items || []);
        for (const ev of arr) {
          const m = createMarker(map, ev);
          if (m) markersRef.current.push(m);
        }
      } catch (err) {
        console.error('Error loading events', err);
      }
    };

    // initial load (map might not be ready immediately; wait until map exists and is loaded)
    const tryWhenMapReady = () => {
      const map = mapRef.current;
      if (!map) {
        // try later
        const to = setTimeout(tryWhenMapReady, 200);
        return () => clearTimeout(to);
      }
      if (map.loaded()) {
        load();
      } else {
        const onLoad = () => {
          load();
          map.off('load', onLoad);
        };
        map.on('load', onLoad);
      }
      return undefined;
    };

    const cancel = tryWhenMapReady();

    // cleanup
    return () => {
      cancelled = true;
      if (typeof cancel === 'function') cancel();
      clearMarkers();
    };
  }, [mapRef, isRotatingRef, endpoint]);

  return null;
};

export default MapEvents;
