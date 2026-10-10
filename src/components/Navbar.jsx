export default function Navbar({ onOpenAuth }) {
  return (
    <nav className="navbar tinder-navbar">
      <div className="logo-brand">
        <span className="flame-heart-icon">♥</span>
        <span className="logo-text">Solteros Adventistas</span>
      </div>

      <div className="nav-links">
        <a href="#inicio" className="nav-desktop-only">Inicio</a>
        <a href="#como-funciona" className="nav-desktop-only">Cómo funciona</a>
        <a href="#planes" className="nav-desktop-only">Propósito</a>
        
        {/* BOTÓN DESTACADO Y CLARO DE INICIAR SESIÓN */}
        <button
          type="button"
          className="prominent-login-btn"
          onClick={() => onOpenAuth('login')}
          title="Iniciar sesión en tu cuenta"
        >
          <span className="login-user-icon">👤</span>
          <span>Iniciar sesión</span>
        </button>
      </div>
    </nav>
  );
}
