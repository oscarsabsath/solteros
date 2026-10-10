const FEATURE_ITEMS = [
  {
    icon: "👤",
    title: "Crea tu perfil",
    description: "Cuéntanos quién eres y qué estás buscando.",
  },
  {
    icon: "♥",
    title: "Descubre personas",
    description: "Recibe sugerencias basadas en tus preferencias.",
  },
  {
    icon: "💬",
    title: "Conecta",
    description: "Cuando haya interés mutuo, podrán comenzar a conversar.",
  },
];

export default function Features() {
  return (
    <section id="como-funciona" className="features">
      <h2>Conectar puede ser sencillo</h2>

      <p className="section-description">
        Estamos construyendo una comunidad para ayudarte a encontrar
        personas compatibles contigo.
      </p>

      <div className="feature-grid">
        {FEATURE_ITEMS.map((item, index) => (
          <div key={index} className="feature-card">
            <div className="icon">{item.icon}</div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
