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
  Menu,
  X,
} from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const { user, backendUrl, logout, getUserData } =
    useContext(AppContext);

  const [editMode, setEditMode] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileFile, setProfileFile] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const avatarUrl =
    user?.profile_image
      ? `${backendUrl}/uploads/users/${user.id}/${user.profile_image}`
      : null;

  const handleSave = async (e) => {
    e.preventDefault();
    console.log('handleSave called', { editMode, name, email });

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
    console.log('handleDelete called');
    const password = prompt("Podaj hasło aby usunąć konto:");
    if (!password) return;

    try {
      await api.delete("/api/users/me", {
        data: { password, hard: true },
      });

      toast.success("Konto usunięte");
      await logout();
    } catch (error) {
      toast.error("Nie udało się usunąć konta");
    }
  };

  return (
    <div className="dashboard">
        <>
        <aside className={`dashboard-sidebar ${mobileMenu ? "open" : ""}`}>
            <div className="sidebar-top">
            <div className="sidebar-logo">LivingCity</div>

            <button
                className="close-btn"
                onClick={() => setMobileMenu(false)}
                >
                <X size={28} strokeWidth={2.5} />
                </button>
            </div>

            <nav className="sidebar-nav">
            <button
                className="active"
                onClick={() => setMobileMenu(false)}
            >
                <User size={18} /> Profil
            </button>
            </nav>

            <button
            className="logout-btn"
            onClick={() => {
                setMobileMenu(false);
                logout();
            }}
            >
            <LogOut size={16} /> Wyloguj
            </button>
        </aside>

        {mobileMenu && (
            <div
            className="sidebar-overlay"
            onClick={() => setMobileMenu(false)}
            />
        )}
        </>


      <main className="dashboard-content">
        <header className="dashboard-header">
          <div className="header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenu(!mobileMenu)}
            >
              <Menu size={22} />
            </button>
            <h1>Panel użytkownika</h1>
          </div>
        </header>

        <div className="dashboard-wrapper">
         <div className="dashboard-card">
          <div className="card-left">
            <div className="profile-avatar-big">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" />
              ) : (
                <User size={60} />
              )}
            </div>

            {editMode && (
              <div className="upload-wrapper">
                <label htmlFor="profile-upload" className="upload-btn">
                    <ImgIcon size={16} />
                    Zmień zdjęcie
                </label>

                <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileFile(e.target.files[0])}
                />
                </div>
            )}
          </div>

          <form className="card-right" onSubmit={handleSave}>
            <div className="input-group">
              <label>Imię</label>
              <div className="input-wrapper">
                <User size={16} />
                <input
                  type="text"
                  value={name}
                  disabled={!editMode}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail size={16} />
                <input
                  type="email"
                  value={email}
                  disabled={!editMode}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="actions">
              {!editMode ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditMode(true); }}
                >
                  Edytuj profil
                </button>
              ) : (
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  Zapisz zmiany
                </button>
              )}

              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
              >
                <Trash2 size={16} />
                Usuń konto
              </button>
            </div>
          </form>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
