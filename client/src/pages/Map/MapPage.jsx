import { useState } from 'react';
import Map from '../../components/Map/Map';
import Sidebar from '../../components/Sidebar/Sidebar';
import './MapPage.css';

export default function MapPage() {
  const [mapInstance, setMapInstance] = useState(null);

  return (
    <div>
      <main className="map-page-main">
        <Sidebar map={mapInstance} />
        <Map onMapReady={setMapInstance} />
      </main>
    </div>
  );
}
