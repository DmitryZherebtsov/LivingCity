import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import api from "../../api/axios";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Image as ImgIcon,
  Trash2,
  Save,
  LogOut,
} from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const { user, backendUrl, logout, getUserData } = useContext(AppContext);

  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [attending, setAttending] = useState(() => user?.eventsGoing || []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setAttending(user?.eventsGoing || []);
    }
  }, [user]);

  const avatarUrl = user?.profile_image
    ? `${backendUrl}/uploads/users/${user.id}/${user.profile_image}`
    : null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      if (profileFile) fd.append("profile_image", profileFile);
      await api.patch("/api/users/me", fd);
      toast.success("Profil zaktualizowany");
      await getUserData();
      setEditMode(false);
    } catch (error) {
      toast.error("Błąd aktualizacji");
    }
  };

  const handleDelete = async () => {
    const password = prompt("Podaj hasło aby usunąć konto:");
    if (!password) return;
    try {
      await api.delete("/api/users/me", { data: { password, hard: true } });
      toast.success("Konto usunięte");
      await logout();
    } catch (error) {
      toast.error("Nie udało się usunąć konta");
    }
  };

  const handleCancelAttendance = (eventId) => {
    setAttending((prev) => prev.filter((e) => e.id !== eventId));
    toast.info(
      "Udział anulowany lokalnie. Wykonaj wywołanie API, aby zapisać zmiany na serwerze."
    );
  };

  console.log("USER:", user);


  return (
    <div className="lc-profile-page">
      <header className="lc-profile-topbar">
        <div className="lc-profile-user-name">
          {user?.name || "—"}
        </div>

        <div className="lc-profile-topbar-center">
          <h1 className="lc-profile-topbar-title">Panel użytkownika</h1>
        </div>

        <div className="lc-profile-topbar-right">
          <div className="lc-profile-user-mini">
            <button
              className="lc-profile-logout-btn"
              onClick={logout}
              title="Wyloguj"
            >
              <LogOut size={16} /> Wyloguj
            </button>
          </div>
        </div>
      </header>

      <main className="lc-profile-content">
        <div className="lc-profile-grid">
          <section className="lc-profile-card lc-profile-profile-card">
            <div className="lc-profile-side">
              <div className="lc-profile-avatar">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" />
                ) : (
                  <User size={60} />
                )}
              </div>

              {editMode && (
                <div className="lc-profile-upload-wrapper">
                  <label
                    htmlFor="profile-upload"
                    className="lc-profile-upload-btn"
                  >
                    <ImgIcon size={16} /> Zmień zdjęcie
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setProfileFile(e.target.files[0])
                    }
                  />
                </div>
              )}

              <div className="lc-profile-meta">
                <div className="lc-profile-meta-row">
                  <strong>Rola:</strong>
                  <span>{user?.role || "Użytkownik"}</span>
                </div>
                <div className="lc-profile-meta-row">
                  <strong>Dołączył:</strong>
                  <span>
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            <form
              className="lc-profile-form"
              onSubmit={handleSave}
            >
              <div className="lc-profile-input-group">
                <label>Imię</label>
                <div className="lc-profile-input-wrapper">
                  <User size={16} />
                  <input
                    type="text"
                    value={name}
                    disabled={!editMode}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="lc-profile-input-group">
                <label>Email</label>
                <div className="lc-profile-input-wrapper">
                  <Mail size={16} />
                  <input
                    type="email"
                    value={email}
                    disabled={!editMode}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="lc-profile-actions">
                {!editMode ? (
                  <button
                    type="button"
                    className="lc-profile-btn-primary"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditMode(true);
                    }}
                  >
                    Edytuj profil
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="lc-profile-btn-primary"
                  >
                    <Save size={16} /> Zapisz zmiany
                  </button>
                )}

                <button
                  type="button"
                  className="lc-profile-btn-danger"
                  onClick={handleDelete}
                >
                  <Trash2 size={16} /> Usuń konto
                </button>
              </div>
            </form>
          </section>

          <section className="lc-profile-card lc-profile-events-card">
            <header className="lc-profile-events-header">
              <h2>Moje wydarzenia</h2>
              <p className="lc-profile-events-sub">
                Tu zobaczysz wydarzenia, na które się zapisałeś — możesz
                zrezygnować.
              </p>
            </header>

            <div className="lc-profile-events-list">
              {attending && attending.length > 0 ? (
                attending.map((ev) => (
                  <article
                    className="lc-profile-event-item"
                    key={ev.id || ev._id || ev.title}
                  >
                    <div className="lc-profile-event-main">
                      <div className="lc-profile-event-title">
                        {ev.title || "Brak tytułu"}
                      </div>
                      <div className="lc-profile-event-meta">
                        <span>
                          {ev.start_time
                            ? new Date(
                                ev.start_time
                              ).toLocaleString()
                            : "—"}
                        </span>
                        {ev.city && (
                          <span> • {ev.city}</span>
                        )}
                      </div>
                    </div>

                    <div className="lc-profile-event-actions">
                      <button
                        className="lc-profile-btn-ghost"
                        onClick={() =>
                          handleCancelAttendance(
                            ev.id || ev._id
                          )
                        }
                        aria-label={`Anuluj udział: ${ev.title}`}
                      >
                        Rezygnuj
                      </button>
                      <a
                        className="lc-profile-btn-link"
                        href={ev.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Szczegóły
                      </a>
                    </div>
                  </article>
                ))
              ) : (
                <div className="lc-profile-empty-state">
                  <p>
                    Brak zapisanych wydarzeń. Przeglądaj
                    wydarzenia i zapisz się, aby zobaczyć je
                    tutaj.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
