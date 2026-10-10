export default function Navbar({ onOpenAuth }) {
  return (
    <nav className="navbar tinder-navbar">
      <div className="logo-brand">
        <span className="flame-heart-icon">♥</span>
        <span className="logo-text">Solteros Adventistas</span>
      </div>

      <div className="nav-links">
        <a href="#inicio">Inicio</a>
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#planes">Propósito</a>
        <button className="login-btn tinder-nav-btn" onClick={() => onOpenAuth('login')}>
          Iniciar sesión
        </button>
      </div>
    </nav>
  );
}
