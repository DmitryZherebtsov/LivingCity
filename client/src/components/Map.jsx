import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const Map = ({ externalMapRef }) => {
  const containerRef = useRef(null);
  const internalMapRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastTimestampRef = useRef(null);
  const isRotatingRef = useRef(true);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    // Ініціалізація карти — дуже віддалений вигляд (zoom 0)
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11', // можна змінити
      center: [0, 0],
      zoom: 0,
      pitch: 0,
      bearing: 0,
      interactive: true,
    });

    // записуємо в зовнішній ref (якщо передали)
    if (externalMapRef) externalMapRef.current = map;
    internalMapRef.current = map;

    // дуже повільне обертання (degrees per second)
    const degreesPerSecond = 0.02; // повільно; підбери значення якщо треба
    const degreesPerMs = degreesPerSecond / 1000;

    function rotateFrame(timestamp) {
      if (!lastTimestampRef.current) lastTimestampRef.current = timestamp;
      const delta = timestamp - lastTimestampRef.current;

      if (isRotatingRef.current) {
        const currentBearing = map.getBearing() || 0;
        const newBearing = currentBearing + delta * degreesPerMs;
        // миттєво оновлюємо без анімації (duration: 0)
        map.rotateTo(newBearing, { duration: 0 });
      }

      lastTimestampRef.current = timestamp;
      animationFrameRef.current = requestAnimationFrame(rotateFrame);
    }

    // після завантаження мапи запускаємо обертання
    map.on('load', () => {
      animationFrameRef.current = requestAnimationFrame(rotateFrame);
    });

    // Додаємо Geocoder (поле пошуку) і слухаємо подію результату
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      placeholder: 'Search for a city',
      countries: undefined, // можна обмежити, напр. 'pl'
      types: 'place,region,locality',
      marker: false, // не додавати маркер від geocoder — за бажанням
    });

    map.addControl(geocoder, 'top-left');

    // Коли користувач обирає результат — зупинити обертання і перелетіти
    const onResult = (e) => {
      if (!e || !e.result || !e.result.center) return;
      const [lng, lat] = e.result.center;
      // зупиняємо обертання
      isRotatingRef.current = false;
      // скасовуємо анімаційний цикл (можна лишити, але краще очистити)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // переліт до міста
      map.flyTo({
        center: [lng, lat],
        zoom: 11,
        speed: 1.2,
        curve: 1.4,
        essential: true,
      });
    };

    geocoder.on('result', onResult);

    // Очищення при демонтажі
    return () => {
      geocoder.off('result', onResult);
      try {
        map.removeControl(geocoder);
      } catch (e) {}
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (map) map.remove();
      if (externalMapRef) externalMapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // однократно при маунті

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
      }}
    />
  );
};

export default Map;
