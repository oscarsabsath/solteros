export default function Navbar({ onOpenAuth }) {
  return (
    <nav className="navbar">
      <div className="logo">Solteros Adventistas</div>

      <div className="nav-links">
        <a href="#inicio">Inicio</a>
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#planes">Planes</a>
        <button className="login-btn" onClick={() => onOpenAuth('login')}>
          Iniciar sesión
        </button>
      </div>
    </nav>
  );
}
