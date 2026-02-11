import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Share2,
  Heart,
  ExternalLink,
  Mail,
  Globe,
} from "lucide-react";
import useEvents from "../../hooks/useEvents";
import "./EventDetail.css";

const getEventImageUrl = (event, index = 0) => {
  if (!event) return null;
  const imgObj =
    (index === 0 && event.first_image) ||
    (Array.isArray(event.images) && event.images[index]) ||
    null;
  if (!imgObj || !imgObj.filename) return null;
  return `${import.meta.env.VITE_API_BASE_URL}/uploads/events/${event.id}/${imgObj.filename}`;
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};
const formatTimeRange = (s, e) => {
  if (!s) return "—";
  const fmt = (dt) => new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return e ? `${fmt(s)} — ${fmt(e)}` : fmt(s);
};

export default function EventDetail() {
  const { id } = useParams();
  const { events, loading, error } = useEvents();

  const [cityImage, setCityImage] = useState(null);
  const [pixabayError, setPixabayError] = useState(null);
  const event = events.find((e) => Number(e.id) === Number(id));



  const heroImage = getEventImageUrl(event, 0);
  const allGallery = Array.isArray(event?.images) ? event.images : [];
  const galleryUrls = allGallery.map((_, i) => getEventImageUrl(event, i)).filter(Boolean);
  const galleryUrlsExcludingHero = heroImage ? galleryUrls.filter((u) => u !== heroImage) : galleryUrls;

  const capacity = event?.capacity || null;
  const visitors = Number(event?.visitor_count || 0);
  const spotsLeft = capacity ? Math.max(0, capacity - visitors) : null;
  const fillPercent = capacity ? Math.round((visitors / capacity) * 100) : null;
  const priceLabel = event?.is_free ? "Free" : event?.price ? event.price : "Paid";

  const PIXABAY_KEY = import.meta.env.VITE_PIXABAY_KEY || import.meta.env.PIXABAY_KEY || null;

  
useEffect(() => {
  if (!event?.city || !PIXABAY_KEY) return;

  let ignore = false;

  const fetchCityImage = async () => {
    try {
      const q = encodeURIComponent(event.city);
      const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${q}&image_type=photo&per_page=3`;

      console.log("Fetching Pixabay:", url);

      const res = await fetch(url);
      const data = await res.json();

      if (ignore) return;

      if (data?.hits?.length > 0) {
        setCityImage(data.hits[0].webformatURL);
      } else {
        setCityImage(null);
      }
          console.log("EVENT:", event);
    console.log("CITY:", event?.city);
    } catch (err) {
      console.error("Pixabay error:", err);
      if (!ignore) setCityImage(null);
    }
  };


  fetchCityImage();

  return () => {
    ignore = true;
  };
}, [event?.city]);



  if (loading) return <div className="ed-loading ed-container"><p>Ładowanie wydarzenia…</p></div>;
  if (error) return (
    <div className="ed-error ed-container">
      <p>Błąd podczas ładowania danych.</p>
      <Link to="/events" className="ed-backlink"><ArrowLeft /> Powrót do wydarzeń</Link>
    </div>
  );
  if (!event) return (
    <div className="ed-notfound ed-container">
      <h2>Wydarzenie nie znalezione</h2>
      <Link to="/events" className="ed-backlink"><ArrowLeft /> Powrót do wydarzeń</Link>
    </div>
  );

  return (
    <div className="ed-page">
      <div className="ed-container">
        <Link to="/events" className="ed-backlink"><ArrowLeft /> Powrót do wydarzeń</Link>
      </div>

      {heroImage && (
        <div className="ed-hero-wrapper ed-container">
          <div className="ed-hero" style={{ backgroundImage: `url(${heroImage})` }}>
            <div className="ed-hero-overlay" />
            <div className="ed-hero-tags">
              {(event.metadata?.genre ?? [event.event_type]).slice(0,3).filter(Boolean).map(t => <span className="ed-tag" key={t}>{t}</span>)}
            </div>
          </div>
        </div>
      )}

      <div className="ed-container ed-grid">
        <main className="ed-main">
          <div className="ed-title-row">
            <div>
              <span className="ed-category">{event.event_type || "—"}</span>
              <h1 className="ed-title">{event.title}</h1>
              <p className="ed-sub">{event.description}</p>
            </div>
            <div className="ed-actions">
              <button className="ed-icon-btn" title="like"><Heart /></button>
              <button className="ed-icon-btn" title="share"><Share2 /></button>
            </div>
          </div>

          <div className="ed-details-grid">
            <div className="ed-detail-card"><div className="ed-detail-label"><Calendar /> DATE</div><div className="ed-detail-value">{formatDate(event.start_time)}</div></div>
            <div className="ed-detail-card"><div className="ed-detail-label"><Clock /> TIME</div><div className="ed-detail-value">{formatTimeRange(event.start_time, event.end_time)}</div></div>
            <div className="ed-detail-card"><div className="ed-detail-label"><MapPin /> LOCATION</div><div className="ed-detail-value">{event.city || event.address || "—"}</div></div>
            <div className="ed-detail-card"><div className="ed-detail-label"><Users /> ATTENDEES</div><div className="ed-detail-value">{visitors.toLocaleString()} going</div></div>
          </div>

          <div className="ed-divider" />
          <section className="ed-section"><h3>About this event</h3><p className="ed-text">{event.full_description || event.description || "No description."}</p></section>

          {galleryUrlsExcludingHero.length > 0 && (
            <>
              <div className="ed-divider" />
              <section className="ed-section">
                <h3>Gallery</h3>
                <div className="ed-gallery">
                  {galleryUrlsExcludingHero.map((src,i) => (
                    <div key={i} className="ed-gallery-item"><img src={src} alt={`${event.title} ${i+1}`} loading="lazy" /></div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>

        <aside className="ed-aside">
          <div className="ed-ticket-card">
            <div className="ed-price-row"><div className="ed-price">{priceLabel}</div>{!event.is_free && <div className="ed-price-sub">per person</div>}</div>

            {capacity ? (
              <>
                <div className="ed-spots"><div className="ed-spots-left">{spotsLeft.toLocaleString()} spots left</div><div className="ed-fill">{fillPercent}% full</div></div>
                <div className="ed-progress"><div className="ed-progress-fill" style={{width:`${fillPercent}%`}} /></div>
              </>
            ) : <div className="ed-muted">No capacity limit</div>}

            <button className="ed-cta">Register Now</button>
            <div className="ed-small">Free cancellation up to 48 hours before</div>

            <div className="ed-sep" />
            <div className="ed-organizer">
              <h4>Organizer</h4>
              <div className="ed-org-row">
                {event.organizer?.avatar && <img className="ed-avatar" src={event.organizer.avatar} alt={event.organizer?.name || "Organizer"} onError={(e)=>{e.currentTarget.style.display='none'}} />}
                <div><div className="ed-org-name">{event.organizer?.name || "—"}</div><div className="ed-org-sub">{event.organizer?.eventsHosted ? `${event.organizer.eventsHosted} events hosted` : ""}</div></div>
              </div>
              {event.organizer?.bio && <p className="ed-text ed-small">{event.organizer.bio}</p>}
              <div className="ed-contact-list">
                {event.organizer?.email && <a href={`mailto:${event.organizer.email}`} className="ed-contact"><Mail /> {event.organizer.email}</a>}
                {event.organizer?.website && <a href={event.organizer.website} target="_blank" rel="noreferrer" className="ed-contact"><Globe /> {new URL(event.organizer.website).hostname}<ExternalLink className="ed-external" /></a>}
              </div>
            </div>

            <div className="ed-sep" />

            <div>
                <div className="ed-price-row_location">
                    <MapPin />
                    <h4 className="ed-text ed-small"> {event.city || event.address || "—"}</h4>
                </div>
             
                {cityImage && (
                    <div className="ed-map-preview">
                        <img src={cityImage} alt={event.city} loading="lazy" />
                    </div>
                )}
                {pixabayError && <div className="ed-muted" style={{marginTop:8}}>Image not available ({pixabayError})</div>}
            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}
