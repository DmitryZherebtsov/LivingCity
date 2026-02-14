import "./Organizer.css";
import bgImage from "../../assets/working_space.jpg";

import promoteIcon from "../../assets/man.svg";
import statsIcon from "../../assets/folder_stats.svg";
import cultureIcon from "../../assets/man_stats.svg";
import Footer from "../../components/Footer/Footer";

export default function OrganizerPage() {
  return (
    <>
    <div className="organizer-page">
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(6,10,15,0.55), rgba(6,10,15,0.55)), url(${bgImage})`,
        }}
      >
        <div className="hero-inner">
          <span className="hero-pill">Dla organizatorów</span>

          <h1 className="hero-title">
            Wprowadź swoje wydarzenia <span className="accent">do życia</span>
          </h1>

          <p className="hero-sub">
            Dołącz jako organizator i połącz się ze swoją lokalną społecznością.
            Twórz, zarządzaj i promuj wydarzenia — wszystko z jednego panelu.
          </p>

          <a className="btn-primary-org" href="/organizer/signup">
            Zostań organizatorem
          </a>
        </div>
      </section>

      <section className="features">
        <div className="features-inner">
          <div className="features-header">
            <h2 className="features-pre">DLACZEGO WARTO</h2>
            <h3 className="features-title">
              Wszystko, czego potrzebujesz, by odnieść sukces
            </h3>
            <p className="features-sub">
              Narzędzia, publiczność i statystyki, które pomagają rozwijać wydarzenia.
            </p>
          </div>

          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon">
                <img src={promoteIcon} alt="Promuj wydarzenia" />
              </div>
              <h4 className="feature-title">Promuj swoje wydarzenia</h4>
              <p className="feature-desc">
                Dotrzyj do tysięcy lokalnych uczestników i skutecznie promuj
                koncerty, festiwale oraz spotkania.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <img src={statsIcon} alt="Statystyki wydarzeń" />
              </div>
              <h4 className="feature-title">Szczegółowe statystyki</h4>
              <p className="feature-desc">
                Panel organizatora z analizami w czasie rzeczywistym: frekwencja,
                zainteresowanie, dane odbiorców.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <img src={cultureIcon} alt="Kultura miasta" />
              </div>
              <h4 className="feature-title">Twórz kulturę miasta</h4>
              <p className="feature-desc">
                Angażuj społeczność i buduj wydarzenia, które realnie wpływają
                na życie kulturalne regionu.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>

    <Footer />
  </>
  );
}
