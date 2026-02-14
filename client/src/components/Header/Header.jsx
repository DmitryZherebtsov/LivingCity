import { NavLink, Link } from "react-router-dom";
import { MapPin, Menu, X, User } from "lucide-react";
import "./Header.css";
import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";

const navLinks = [
  { to: "/home", label: "Strona główna" },
  { to: "/map", label: "Mapa" },
  { to: "/events", label: "Wydarzenia" },
  { to: "/organizer", label: "Utwórz wydarzenie" },
  { to: "/about", label: "O nas" },
];

const Header = () => {
  const { isLoggedin, user, backendUrl } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);

  const avatarUrl =
    isLoggedin && user && user.profile_image
      ? `${backendUrl}/uploads/users/${user.id}/${user.profile_image}`
      : null;

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link to="/home" className="header-logo">
            <div className="logo-icon">
              <MapPin size={20} />
            </div>
            <span className="logo-text">LivingCity</span>
          </Link>

          <nav className="header-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <button
              className="icon-btn mobile-only"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {!isLoggedin && (
              <Link to="/login" className="login-btn desktop-only">
                <User size={16} />
                <span>Zaloguj się</span>
              </Link>
            )}

            {isLoggedin && (
              <Link
                to="/profile"
                className="avatar-circle desktop-only"
                title={user?.name || user?.email}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" />
                ) : (
                  <User size={18} />
                )}
              </Link>
            )}

            <Link
              to={isLoggedin ? "/profile" : "/login"}
              className="avatar-circle mobile-only"
            >
              {isLoggedin && avatarUrl ? (
                <img src={avatarUrl} alt="avatar" />
              ) : (
                <User size={18} />
              )}
            </Link>
          </div>
        </div>
      </header>

  
      {isOpen && <div className="mobile-backdrop" onClick={closeMenu}></div>}


      <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={closeMenu}
            className={({ isActive }) =>
              `mobile-link ${isActive ? "active" : ""}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </>
  );
};

export default Header;
