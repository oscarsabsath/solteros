import heroImage from "../assets/hero-solteros.jpg";

export default function Hero({ onOpenAuth }) {
  const scrollToFeatures = () => {
    const el = document.getElementById('como-funciona');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main id="inicio" className="hero tinder-hero">
      <div className="hero-content">
        <div className="tinder-pill-badge">
          <span className="flame-sparkle">🔥</span> Conecta con propósito & fe compartida
        </div>

        <h1 className="hero-title-gradient">
          Desliza hacia tu
          <span> próximo gran amor</span>
        </h1>

        <p className="hero-description">
          La primera plataforma creada para jóvenes y adultos adventistas que buscan construir
          una relación significativa basada en los mismos principios, valores y visión de futuro.
        </p>

        <div className="hero-buttons">
          <button className="primary-btn tinder-cta-btn" onClick={() => onOpenAuth('register')}>
            Crear mi cuenta gratis
          </button>
          <button className="secondary-btn tinder-secondary-btn" onClick={scrollToFeatures}>
            Ver cómo funciona
          </button>
        </div>

        <div className="trust-badges-bar">
          <div className="trust-badge-item">
            <span className="trust-icon">✓</span>
            <div>
              <strong>Perfiles Reales</strong>
              <small>Verificados en la comunidad</small>
            </div>
          </div>
          <div className="trust-badge-item">
            <span className="trust-icon">⛪</span>
            <div>
              <strong>Misma Fe</strong>
              <small>Principios bíblicos</small>
            </div>
          </div>
          <div className="trust-badge-item">
            <span className="trust-icon">🔒</span>
            <div>
              <strong>100% Seguro</strong>
              <small>Privacidad garantizada</small>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-image-wrap">
        <div className="hero-photo-card">
          <img
            src={heroImage}
            alt="Comunidad de solteros adventistas"
            className="hero-main-img"
          />
          <div className="hero-floating-card card-top">
            <span className="floating-emoji">♥</span>
            <div>
              <strong>Nueva Conexión</strong>
              <small>Interés mutuo en IASD</small>
            </div>
          </div>
          <div className="hero-floating-card card-bottom">
            <span className="floating-emoji">✨</span>
            <div>
              <strong>Compatibilidad Espiritual</strong>
              <small>Visión y valores alineados</small>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
