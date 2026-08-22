import heroImage from "./assets/hero-solteros.jpg";

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">Solteros Adventistas</div>

        <div className="nav-links">
          <a href="#inicio">Inicio</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#planes">Planes</a>
          <button className="login-btn">Iniciar sesión</button>
        </div>
      </nav>

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

      <section id="como-funciona" className="features">
        <h2>Conectar puede ser sencillo</h2>

        <p className="section-description">
          Estamos construyendo una comunidad para ayudarte a encontrar
          personas compatibles contigo.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="icon">👤</div>
            <h3>Crea tu perfil</h3>
            <p>Cuéntanos quién eres y qué estás buscando.</p>
          </div>

          <div className="feature-card">
            <div className="icon">♥</div>
            <h3>Descubre personas</h3>
            <p>Recibe sugerencias basadas en tus preferencias.</p>
          </div>

          <div className="feature-card">
            <div className="icon">💬</div>
            <h3>Conecta</h3>
            <p>
              Cuando haya interés mutuo, podrán comenzar a conversar.
            </p>
          </div>
        </div>
      </section>

      <section id="planes" className="cta">
        <h2>Tu próxima historia puede comenzar aquí</h2>

        <p>
          Únete a Solteros Adventistas y empieza a conocer personas.
        </p>

        <button className="primary-btn">Crear mi cuenta</button>
      </section>

      <footer>
        <p>© 2026 Solteros Adventistas</p>
      </footer>
    </div>
  );
}

export default App;