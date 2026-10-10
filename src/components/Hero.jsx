import heroImage from "../assets/hero-solteros.jpg";

export default function Hero() {
  return (
    <main id="inicio" className="hero">
      <div className="hero-content">
        <span className="badge">♥ Conecta con propósito</span>

        <h1>
          Encuentra a alguien
          <span> especial</span>
        </h1>

        <p>
          Un espacio para conocer personas que comparten tu fe,
          tus valores y tus deseos de construir una relación significativa.
        </p>

        <div className="hero-buttons">
          <button className="primary-btn">Crear mi cuenta</button>
          <button className="secondary-btn">Conocer más</button>
        </div>

        <div className="trust">
          <span>✓ Perfiles reales</span>
          <span>✓ Conexiones con propósito</span>
          <span>✓ Comunidad segura</span>
        </div>
      </div>

      <div className="hero-image">
        <img
          src={heroImage}
          alt="Comunidad de solteros adventistas"
        />
      </div>
    </main>
  );
}
