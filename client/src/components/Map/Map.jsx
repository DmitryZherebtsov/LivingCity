
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './Map.css';

const Map = () => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/dmitryzh/cmgdrdox900du01sa2oenbhr8',
      center: [10, 50], // default position I set Europe
      zoom: 3.5,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    mapRef.current = map;

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      marker: false,
      placeholder: 'Search for a city',
      types: 'place',
    });

    map.addControl(geocoder, 'top-left');

    geocoder.on('result', (e) => {
      const [lng, lat] = e.result.center;
      map.flyTo({
        center: [lng, lat],
        zoom: 11,
        speed: 1.5,
        curve: 1.4,
        essential: true,
      });
    });

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current || events.length === 0) return;

    events.forEach((event) => {
      if (parseFloat(event.lat) === 0 && parseFloat(event.lon) === 0) return;


      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <h3>${event.title}</h3>
        <p><strong>${event.event_type}</strong></p>
        <p>${event.description}</p>
        <a href="${event.url}" target="_blank" rel="noopener noreferrer">More Info</a>
      `);

      new mapboxgl.Marker({ color: '#ff4d4d' })
        .setLngLat([parseFloat(event.lon), parseFloat(event.lat)])
        .setPopup(popup)
        .addTo(mapRef.current);
    });
  }, [events]);

  return (
    <>
      <div ref={containerRef} className="map-container" />
    </>
  );
};

export default Map;