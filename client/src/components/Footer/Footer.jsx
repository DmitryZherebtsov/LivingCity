import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <div className="footer-logo-icon">
              <MapPin size={18} />
            </div>
            <span>LivingCity</span>
          </div>

          <p className="footer-desc">
            Odkrywaj lokalne wydarzenia w swojej okolicy. Łącz się ze
            społecznością, poznawaj nowe doświadczenia i nigdy nie przegap
            tego, co naprawdę ma znaczenie.
          </p>
        </div>

        <div className="footer-col">
          <h4>Produkt</h4>
          <Link to="/features">Funkcje</Link>
          <Link to="/how-it-works">Jak to działa</Link>
          <Link to="/pricing">Cennik</Link>
          <Link to="/faq">FAQ</Link>
        </div>

        <div className="footer-col">
          <h4>Strona</h4>
          <Link to="/about">O nas</Link>
          <Link to="/organizer">Zostań Organizatorem</Link>
          <Link to="/map">Mapa</Link>
          <Link to="/home">Główna</Link>
        </div>

        <div className="footer-col">
          <h4>Informacje prawne</h4>
          <Link to="/privacy">Polityka prywatności</Link>
          <Link to="/terms">Regulamin</Link>
          <Link to="/cookies">Polityka plików cookie</Link>
        </div>
      </div>
    </footer>
  );
}
