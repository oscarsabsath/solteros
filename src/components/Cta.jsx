export default function Cta({ onOpenAuth }) {
  return (
    <section id="planes" className="cta">
      <h2>Tu próxima historia puede comenzar aquí</h2>

      <p>
        Únete a Solteros Adventistas y empieza a conocer personas que comparten tu fe y valores.
      </p>

      <div className="cta-actions-group">
        <button
          type="button"
          className="primary-btn cta-white-btn"
          onClick={() => onOpenAuth('register')}
        >
          Crear mi cuenta gratis
        </button>
        <button
          type="button"
          className="secondary-btn cta-transparent-btn"
          onClick={() => onOpenAuth('login')}
        >
          👤 Iniciar sesión
        </button>
      </div>
    </section>
  );
}
