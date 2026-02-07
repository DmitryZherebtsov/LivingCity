import React, { useState, useMemo } from "react";
import useEvents from "../../hooks/useEvents";
import "./FilterMap.css";

export default function FilterMap({ events = [], loading, error }) {
  const [ search, setSearch ] = useState("");

  const filteredEvents = useMemo(() => {
    if (!search) return events;
    const q = search.toLowerCase();

    return events.filter((ev) => {
      try {
        const str = Object.values(ev)
          .map((v) => (v && typeof v === "object" ? JSON.stringify(v) : String(v)))
          .join(" ")
          .toLowerCase();
        return str.includes(q);
      } catch {
        return JSON.stringify(ev).toLowerCase().includes(q);
      }
    });
  }, [events, search]);

  return (
    <div className="filter-map-root">
      <input
        type="text"
        placeholder="Szukaj po wszystkich polach..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="filter-input"
      />

      {loading && <div className="status">Ładowanie...</div>}
      {error && <div className="status error">Błąd: {String(error)}</div>}

      <table className="tabel">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Description</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {filteredEvents.map((e) => (
            <tr key={e.id ?? `${e.title}-${Math.random()}`}>
              <td>{e.title}</td>
              <td>{typeof e.price === "number" ? e.price : e.price}</td>
              <td>{e.description}</td>
              <td>{e.lat}</td>
              <td>{e.lon ?? e.lng}</td>
              <td>
                {e.date
                  ? new Date(e.date).toLocaleString("pl-PL", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </td>
            </tr>
          ))}
          {filteredEvents.length === 0 && !loading && (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", opacity: 0.8 }}>
                Nic nie znaleziono
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
