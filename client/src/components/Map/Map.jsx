import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import './Map.css';


const Map = () => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const isRotatingRef = useRef(false);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/dmitryzh/cmgdrdox900du01sa2oenbhr8',
      center: [10, 50], // Європа
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

  return (
    <>
      <div ref={containerRef} className="map-container" />

    </>
  );
};

export default Map;
