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
  UserPlus,
  UserCheck,
} from "lucide-react";
import useEvents from "../../hooks/useEvents";
import "./EventDetail.css";
import api from "../../api/axios";
import { toast } from "react-toastify";

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
  return new Date(iso).toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTimeRange = (start, end) => {
  if (!start) return "—";
  const fmt = (dt) =>
    new Date(dt).toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return end ? `${fmt(start)} — ${fmt(end)}` : fmt(start);
};

export default function EventDetail() {
  const { id } = useParams();
  const { events, loading, error } = useEvents();

  const [cityImage, setCityImage] = useState(null);
  const [pixabayError, setPixabayError] = useState(null);

  const event = events.find((e) => Number(e.id) === Number(id));

  const heroImage = getEventImageUrl(event, 0);

  const allGallery = Array.isArray(event?.images) ? event.images : [];
  const galleryUrls = allGallery
    .map((_, i) => getEventImageUrl(event, i))
    .filter(Boolean);

  const galleryWithoutHero = heroImage
    ? galleryUrls.filter((u) => u !== heroImage)
    : galleryUrls;

  const capacity = event?.capacity || null;
  const initialVisitors = Number(event?.visitor_count || 0);
  const [localVisitors, setLocalVisitors] = useState(initialVisitors);

  useEffect(() => {
    setLocalVisitors(Number(event?.visitor_count || 0));
  }, [event?.visitor_count]);

  const spotsLeft = capacity ? Math.max(0, capacity - localVisitors) : null;
  const fillPercent = capacity ? Math.round((localVisitors / capacity) * 100) : null;

  const priceLabel = event?.is_free
    ? "Darmowe"
    : event?.price
    ? event.price
    : "Płatne";

  const PIXABAY_KEY =
    import.meta.env.VITE_PIXABAY_KEY ||
    import.meta.env.PIXABAY_KEY ||
    null;

  const [isGoing, setIsGoing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!event) return;

    const check = async () => {
      try {
        const res = await api.get(`/api/participation/${event.id}/check`);
        setIsGoing(!!res.data?.going);
      } catch (err) {
    
      }
    };

    check();
  }, [event]);

  useEffect(() => {
    if (!event?.city || !PIXABAY_KEY) return;

    let ignore = false;

    const fetchCityImage = async () => {
      try {
        const q = encodeURIComponent(event.city);
        const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${q}&image_type=photo&per_page=3`;

        const res = await fetch(url);
        const data = await res.json();

        if (ignore) return;

        if (data?.hits?.length > 0) {
          setCityImage(data.hits[0].webformatURL);
        } else {
          setCityImage(null);
        }
      } catch (err) {
        if (!ignore) setCityImage(null);
        setPixabayError("Nie udało się pobrać obrazu");
      }
    };

    fetchCityImage();

    return () => {
      ignore = true;
    };
  }, [event?.city]);

  const handleToggleParticipation = async () => {
    if (!event) return;

    setActionLoading(true);

    try {
      if (!isGoing) {
        await api.post(`/api/participation/${event.id}`);
        setIsGoing(true);
        setLocalVisitors((v) => v + 1);
        toast?.({ title: "Dołączono do wydarzenia" });
      } else {
        await api.delete(`/api/participation/${event.id}`);
        setIsGoing(false);
        setLocalVisitors((v) => Math.max(0, v - 1));
        toast?.({ title: "Wypisano z wydarzenia" });
      }
    } catch (err) {
      if (err?.response?.status === 401) {
        window.alert("Zaloguj się, aby wziąć udział w wydarzeniu.");
      } else if (err?.response?.data?.error) {
        toast?.({ title: "Błąd", description: err.response.data.error, variant: "destructive" });
      } else {
        toast?.({ title: "Błąd", description: "Operacja nie powiodła się", variant: "destructive" });
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return (
      <div className="ed-loading ed-container">
        <p>Ładowanie wydarzenia…</p>
      </div>
    );

  if (error)
    return (
      <div className="ed-error ed-container">
        <p>Wystąpił błąd podczas ładowania danych.</p>
        <Link to="/events" className="ed-backlink">
          <ArrowLeft /> Powrót do wydarzeń
        </Link>
      </div>
    );

  if (!event)
    return (
      <div className="ed-notfound ed-container">
        <h2>Nie znaleziono wydarzenia</h2>
        <Link to="/events" className="ed-backlink">
          <ArrowLeft /> Powrót do wydarzeń
        </Link>
      </div>
    );

  return (
    <div className="ed-page">
      <div className="ed-container">
        <Link to="/events" className="ed-backlink">
          <ArrowLeft /> Powrót do wydarzeń
        </Link>
      </div>

      {heroImage && (
        <div className="ed-hero-wrapper ed-container">
          <div
            className="ed-hero"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="ed-hero-overlay" />
            <div className="ed-hero-tags">
              {(event.metadata?.genre ?? [event.event_type])
                .slice(0, 3)
                .filter(Boolean)
                .map((tag) => (
                  <span key={tag} className="ed-tag">
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      <div className="ed-container ed-grid">
        <main className="ed-main">
          <div className="ed-title-row">
            <div>
              <span className="ed-category">
                {event.event_type || "—"}
              </span>
              <h1 className="ed-title">{event.title}</h1>
              {/* <p className="ed-sub">{event.description}</p> */}
            </div>

            <div className="ed-actions">
              <button className="ed-icon-btn" title="Polub">
                <Heart />
              </button>
              <button className="ed-icon-btn" title="Udostępnij">
                <Share2 />
              </button>
            </div>
          </div>

          <div className="ed-details-grid">
            <div className="ed-detail-card">
              <div className="ed-detail-label">
                <Calendar /> Data
              </div>
              <div className="ed-detail-value">
                {formatDate(event.start_time)}
              </div>
            </div>

            <div className="ed-detail-card">
              <div className="ed-detail-label">
                <Clock /> Godzina
              </div>
              <div className="ed-detail-value">
                {formatTimeRange(
                  event.start_time,
                  event.end_time
                )}
              </div>
            </div>

            <div className="ed-detail-card">
              <div className="ed-detail-label">
                <MapPin /> Lokalizacja
              </div>
              <div className="ed-detail-value">
                {event.city || event.address || "—"}
              </div>
            </div>

            <div className="ed-detail-card">
              <div className="ed-detail-label">
                <Users /> Uczestnicy
              </div>
              <div className="ed-detail-value">
                {localVisitors.toLocaleString("pl-PL")} zapisanych
              </div>
            </div>
          </div>

          <div className="ed-divider" />

          <section className="ed-section">
            <h3>O wydarzeniu</h3>
            <p className="ed-text">
              {event.full_description ||
                event.description ||
                "Brak opisu."}
            </p>
          </section>

          {galleryWithoutHero.length > 0 && (
            <>
              <div className="ed-divider" />
              <section className="ed-section">
                <h3>Galeria</h3>
                <div className="ed-gallery">
                  {galleryWithoutHero.map((src, i) => (
                    <div key={i} className="ed-gallery-item">
                      <img
                        src={src}
                        alt={`${event.title} ${i + 1}`}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>

        <aside className="ed-aside">
          <div className="ed-ticket-card">
            <div className="ed-price-row">
              <div className="ed-price">{priceLabel}</div>
              {!event.is_free && (
                <div className="ed-price-sub">
                  za osobę
                </div>
              )}
            </div>

            {capacity ? (
              <>
                <div className="ed-spots">
                  <div className="ed-spots-left">
                    {spotsLeft?.toLocaleString("pl-PL")} miejsc pozostało
                  </div>
                  <div className="ed-fill">
                    {fillPercent}% zajęte
                  </div>
                </div>
                <div className="ed-progress">
                  <div
                    className="ed-progress-fill"
                    style={{ width: `${fillPercent}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="ed-muted">
                Brak limitu miejsc
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <button
                className={`ed-cta ed-cta-participation ${isGoing ? "joined" : ""}`}
                onClick={handleToggleParticipation}
                disabled={actionLoading || (capacity && spotsLeft === 0 && !isGoing)}
                aria-pressed={isGoing}
              >
                <span className="ed-cta-icon" aria-hidden>
                  {isGoing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                </span>
                <span className="ed-cta-text">
                  {isGoing ? "Uczestniczę" : "Wezmę udział"}
                </span>
              </button>
            </div>

    
            <div className="ed-sep" />

            <div className="ed-organizer">
              <h4>Organizator</h4>

              <div className="ed-org-name">
                {typeof event.organizer === "string"
                  ? event.organizer
                  : event.organizer?.name || "—"}
              </div>

              {event.organizer?.bio && (
                <p className="ed-text ed-small">
                  {event.organizer.bio}
                </p>
              )}

              <div className="ed-contact-list">
                {event.organizer?.email && (
                  <a
                    href={`mailto:${event.organizer.email}`}
                    className="ed-contact"
                  >
                    <Mail /> {event.organizer.email}
                  </a>
                )}

                {event.organizer?.website && (
                  <a
                    href={event.organizer.website}
                    target="_blank"
                    rel="noreferrer"
                    className="ed-contact"
                  >
                    <Globe />{" "}
                    {new URL(
                      event.organizer.website
                    ).hostname}
                    <ExternalLink className="ed-external" />
                  </a>
                )}
              </div>
            </div>

            <div className="ed-sep" />

            <div>
              <div className="ed-price-row_location">
                <MapPin />
                <h4 className="ed-text ed-small">
                  {event.city ||
                    event.address ||
                    "—"}
                </h4>
              </div>

              {cityImage && (
                <div className="ed-map-preview">
                  <img
                    src={cityImage}
                    alt={event.city}
                    loading="lazy"
                  />
                </div>
              )}

              {pixabayError && (
                <div className="ed-muted">
                  Obraz niedostępny
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
