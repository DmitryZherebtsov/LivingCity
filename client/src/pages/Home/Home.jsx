import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "./Home.css";

const Home = () => {
  const geocoderContainerRef = useRef(null);
  const geocoderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!geocoderContainerRef.current) return;

    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
    }

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl,
      placeholder: "Znajdź swoje miasto (np. Warszawa)",
      marker: false,
      types: "place",
      language: "pl",
    });

    geocoderRef.current = geocoder;

    const controlElement = geocoder.onAdd && geocoder.onAdd(); 
    if (controlElement) {
      geocoderContainerRef.current.appendChild(controlElement);
    }

    const onResult = (e) => {
      if (!e?.result?.center) return;
      const [lng, lat] = e.result.center;
      const place = e.result.place_name || e.result.text || "";
      navigate(
        `/map?lng=${encodeURIComponent(lng)}&lat=${encodeURIComponent(lat)}&place=${encodeURIComponent(place)}`
      );
    };

    geocoder.on("result", onResult);

    if (controlElement) {
    geocoderContainerRef.current.appendChild(controlElement);

  
  const input = controlElement.querySelector("input");
  if (input) {
      input.setAttribute("name", "city");
      input.setAttribute("id", "city-search");
      input.setAttribute("aria-label", "Search for city");

      input.setAttribute("autocomplete", "off");
    }

    controlElement.classList.add("home-geocoder-control");
  }

    return () => {
      try {
        geocoder.off && geocoder.off("result", onResult);
        geocoder.clear && geocoder.clear();
        if (geocoder.onRemove) {
          geocoder.onRemove();
        } else if (controlElement && geocoderContainerRef.current.contains(controlElement)) {
          geocoderContainerRef.current.removeChild(controlElement);
        }
      } catch (err) {
        console.error("Geocoder cleanup error:", err);
      }
      geocoderRef.current = null;
    };
  }, [navigate]);

  return (
    <div className="home-root">
      <div className="animated-gradient" aria-hidden />

      <main className="home-content">
        <header className="home-header">
          <h1 className="title">
            Odkryj, co dzieje się<br />
            <span className="title-gradient"> Twojej okolicy</span>
          </h1>

          <div className="home-geocoder-wrapper">
            <div ref={geocoderContainerRef} />
          </div>

          <p className="subtitle">
            Wybierz swoje miasto - zostaniesz przeniesiony na mapę z wydarzeniami w tym miejscu.
          </p>
        </header>
      </main>
    </div>
  );
};

export default Home;
