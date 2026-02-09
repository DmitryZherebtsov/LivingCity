import "./About.css";
import bgImage from "../../assets/event.jpg"; 
import eventsIcon from "../../assets/events.svg";
import organizerIcon from "../../assets/think.svg";
import friendsIcon from "../../assets/friends.svg";

export default function About() {
  return (
    <div className="about-page">
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(rgba(6,10,15,0.55), rgba(6,10,15,0.55)), url(${bgImage})`,
        }}
        aria-label="Hero - znajdź wydarzenia"
      >
        <div className="hero-inner">
          <span className="hero-pill">EventMap</span>

          <h1 className="hero-title">
            Odkrywaj wydarzenia <span className="accent">w Twoim mieście</span>
          </h1>

          <p className="hero-sub">
            Znajduj koncerty, festiwale i spotkania lokalne na interaktywnej mapie.
            Dołącz do społeczności — dziel się wydarzeniami i łatwo nawiązuj kontakty.
          </p>

          <a className="btn-primary" href="/contact">
            Skontaktuj się
          </a>
        </div>
      </section>

      <section className="features">
        <div className="features-inner">
          <div className="features-header">
            <h2 className="features-pre">CO MOŻESZ ZROBIĆ</h2>
            <h3 className="features-title">Jedno miejsce do odkrywania i dzielenia się wydarzeniami</h3>
            <p className="features-sub">
              EventMap łączy lokalne społeczności — znajdź wydarzenie, zostań organizatorem lub poznaj nowych ludzi.
            </p>
          </div>

          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon">
                <img src={eventsIcon} alt="Znajdź wydarzenia" />
              </div>
              <h4 className="feature-title">Znajdź i udostępniaj wydarzenia</h4>
              <p className="feature-desc">
                Odkrywaj lokalne koncerty, festiwale, meetupy i spotkania społecznościowe na interaktywnej mapie.
                Udostępniaj ulubione wydarzenia znajomym i nigdy nie przegap tego, co dzieje się w okolicy.
              </p>
            </article>


            <article className="feature-card">
              <div className="feature-icon">
                <img src={organizerIcon} alt="Zostań organizatorem" />
              </div>
              <h4 className="feature-title">Zostań organizatorem</h4>
              <p className="feature-desc">
                Przejmij inicjatywę i twórz własne wydarzenia. Nasza platforma daje wszystkie narzędzia do promocji,
                zarządzania i rozwoju wydarzeń — docierając bez wysiłku do zaangażowanej lokalnej publiczności.
              </p>
            </article>


            <article className="feature-card">
              <div className="feature-icon">
                <img src={friendsIcon} alt="Znajdź nowych przyjaciół" />
              </div>
              <h4 className="feature-title">Znajdź nowych przyjaciół</h4>
              <p className="feature-desc">
                Nawiąż kontakt z osobami o podobnych zainteresowaniach. Czy to muzyka, sztuka, sport czy kuchnia —
                EventMap łączy społeczności i pomaga budować trwałe znajomości.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
