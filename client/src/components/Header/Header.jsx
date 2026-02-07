import { NavLink } from "react-router-dom";
import { MapPin, Menu, User } from "lucide-react";
import "./Header.css";
import { Link } from "react-router-dom";

const navLinks = [
  { to: "/home", label: "Home" },
  { to: "/map", label: "Map" },
  { to: "/events", label: "Events" },
  { to: "/organizer", label: "Create an Event" },
  { to: "/about", label: "About" },
];

const Header = () => {
  return (
    <header className="header">
      <div className="header-inner">
        
        {/* 1 */}
        <Link to="/home">
          <div className="header-logo">
              <div className="logo-icon">
                <MapPin size={20} />
              </div>
              <span className="logo-text">LivingCity</span>
          </div>
        </Link>

        {/* 2 */}
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

        {/* 3 */}
        <div className="header-actions">
          <button className="icon-btn mobile-only">
            <Menu size={20} />
          </button>

          <button className="login-btn desktop-only">
            <User size={16} />
            <span>Login</span>
          </button>

          <button className="icon-btn mobile-only">
            <User size={18} />
          </button>
        </div>
          
      </div>
    </header>
  );
};

export default Header;
