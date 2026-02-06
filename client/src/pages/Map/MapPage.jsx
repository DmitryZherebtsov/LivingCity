import { useState } from 'react';
import Map from '../../components/Map/Map';
import Sidebar from '../../components/Sidebar/Sidebar';
import useEvents from '../../hooks/useEvents';
import './MapPage.css';

export default function MapPage() {
  const { events, loading, error } = useEvents();
  const [mapInstance, setMapInstance] = useState(null);

  return (
    <div className="map-page-root">
      <Sidebar map={mapInstance} />
      <Map onMapReady={setMapInstance} events={events} />
    </div>
  );
}