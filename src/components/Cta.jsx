export default function Cta({ onOpenAuth }) {
  return (
    <section id="planes" className="cta">
      <h2>Tu próxima historia puede comenzar aquí</h2>

      <p>
        Únete a Solteros Adventistas y empieza a conocer personas.
      </p>

      <button className="primary-btn" onClick={() => onOpenAuth('register')}>
        Crear mi cuenta
      </button>
    </section>
  );
}
