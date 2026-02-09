import React, { useEffect, useMemo, useState } from "react";
import useEvents from "../../hooks/useEvents";
import "./EventsPage.css";
import { Link } from "react-router-dom";

const getEventImage = (event) => {
  const first = event.first_image || (Array.isArray(event.images) && event.images[0]);
  if (!first) return null;
  return `http://localhost:3000/uploads/events/${event.id}/${first.filename}`;
};

const formatDateRange = (startIso, endIso) => {
  if (!startIso) return "—";
  const start = new Date(startIso);
  const end = endIso ? new Date(endIso) : null;

  const dateFormatter = (d) =>
    d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const timeFormatter = (d) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (!end) return `${dateFormatter(start)}, ${timeFormatter(start)}`;

  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${dateFormatter(start)}, ${timeFormatter(start)} — ${timeFormatter(end)}`;
  }
  return `${dateFormatter(start)} — ${dateFormatter(end)}`;
};


const truncate = (text = "", max = 140) =>
  text.length > max ? text.slice(0, max - 1).trim() + "…" : text;

export default function EventsPage() {
  const { events = [], loading, error } = useEvents();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const eventTypes = useMemo(() => {
    const s = new Set();
    (events || []).forEach((e) => { if (e.event_type) s.add(e.event_type); });
    return Array.from(s);
  }, [events]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (events || []).filter((ev) => {
      if (q) {
        const hay = [
          ev.title,
          ev.description,
          ev.address,
          ev.city,
          ev.organizer,
          ev.event_type,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (selectedTypes.length > 0 && !selectedTypes.includes(ev.event_type)) return false;
      return true;
    });
  }, [events, searchQuery, selectedTypes]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedTypes]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageStart = (page - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  const toggleType = (t) => {
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const gotoPrev = () => setPage((p) => Math.max(1, p - 1));
  const gotoNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="events-page">
      <div className="events-header">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="page-sub">Browse and manage events from API</p>
        </div>
        <div>
          <Link to="/organizer"><button className="create-btn">＋ Create Event</button></Link>
        </div>
      </div>

      <div className="controls">
        <div className="search">
          <input
            placeholder="Search by title, city, organizer, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters">
          {eventTypes.length === 0 ? (
            <div className="muted">No type filters</div>
          ) : (
            eventTypes.map((t) => (
              <button
                key={t}
                className={`type-btn ${selectedTypes.includes(t) ? "active" : ""}`}
                onClick={() => toggleType(t)}
              >
                {t}
              </button>
            ))
          )}
        </div>
      </div>

      {loading ? (
        <div className="muted">Loading events…</div>
      ) : error ? (
        <div className="muted">Error loading events</div>
      ) : (
        <>
          <div className="cards-grid" role="list">
            {pageItems.map((ev) => (
              <article key={ev.id} className="card" role="listitem">
                <div className="card-image-wrap">
                  {getEventImage(ev) ? (
                    <img src={getEventImage(ev)} alt={ev.title} className="card-image" />
                  ) : (
                    <div className="card-image placeholder">No image</div>
                  )}
                  <div className="card-badge">{ev.event_type || "—"}</div>
                </div>

                <div className="card-body">
                  <h2 className="card-title">{ev.title}</h2>
                  <p className="card-desc">{truncate(ev.description)}</p>

                  <div className="card-meta">
                    <div className="meta-row">
                      <span className="meta-emoji">📍</span>
                      <span className="muted">{ev.city || ev.address || "—"}</span>
                    </div>

                    <div className="meta-row">
                      <span className="meta-emoji">📅</span>
                      <span className="muted">{formatDateRange(ev.start_time, ev.end_time)}</span>
                    </div>

                    <div className="meta-row">
                      <span className="meta-emoji">👥</span>
                      <span className="muted">{(ev.visitor_count ?? 0).toLocaleString()} going</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    {ev.url ? (
                      <a className="btn-ghost" href={ev.url} target="_blank" rel="noreferrer">
                        Learn More →
                      </a>
                    ) : (
                      <a className="btn-ghost" href={`#/events/${ev.id}`}>
                        Learn More →
                      </a>
                    )}
                    <div className="spacer" />
                    <span className={`ticket-badge ${ev.is_free ? "free" : "paid"}`}>
                      {ev.is_free ? "Free" : ev.capacity ? "Paid" : "Paid"}
                    </span>
                  </div>
                </div>
              </article>
            ))}

            {pageItems.length === 0 && (
              <div className="no-results muted">No events found</div>
            )}
          </div>


    {/* pagination for page */}
          <div className="pagination-row">
            <div className="pagination-info">
              Showing <strong>{pageItems.length}</strong> of <strong>{filtered.length}</strong> results
            </div>

            <div className="pagination-controls">
              <button className="page-btn" onClick={() => { setPage(1); }} disabled={page === 1}>
                «
              </button>
              <button className="page-btn" onClick={gotoPrev} disabled={page === 1}>
                Previous
              </button>
              <span className="page-indicator">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>
              </span>
              <button className="page-btn" onClick={gotoNext} disabled={page === totalPages}>
                Next
              </button>
              <button className="page-btn" onClick={() => { setPage(totalPages); }} disabled={page === totalPages}>
                »
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
