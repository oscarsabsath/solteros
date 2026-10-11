import { useState, useEffect } from 'react';

export default function Encounters({ profiles = [], onLike, onDislike, onSuperLike }) {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState('');
  const [showFullInfo, setShowFullInfo] = useState(false);

  const currentProfile = profiles[currentIndex] || null;

  // Lista de fotos del perfil actual
  const profilePhotos = currentProfile
    ? (currentProfile.photos && currentProfile.photos.length > 0
        ? currentProfile.photos
        : [currentProfile.avatar_url].filter(Boolean))
    : [];

  // Reset de la foto al cambiar de perfil
  useEffect(() => {
    setCurrentPhotoIndex(0);
    setShowFullInfo(false);
  }, [currentIndex]);

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (currentPhotoIndex < profilePhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    } else {
      setCurrentPhotoIndex(0);
    }
  };

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    } else {
      setCurrentPhotoIndex(profilePhotos.length - 1);
    }
  };

  const triggerAction = (type) => {
    if (!currentProfile) return;

    if (type === 'dislike') {
      setAnimationClass('tinder-swipe-nope');
      setTimeout(() => {
        setHistory((prev) => [...prev, { profile: currentProfile, action: 'dislike' }]);
        onDislike(currentProfile);
        nextProfile();
      }, 260);
    } else if (type === 'like') {
      setAnimationClass('tinder-swipe-like');
      setTimeout(() => {
        setHistory((prev) => [...prev, { profile: currentProfile, action: 'like' }]);
        onLike(currentProfile);
        nextProfile();
      }, 260);
    } else if (type === 'superlike') {
      setAnimationClass('tinder-swipe-super');
      setTimeout(() => {
        setHistory((prev) => [...prev, { profile: currentProfile, action: 'superlike' }]);
        onSuperLike(currentProfile);
        nextProfile();
      }, 260);
    }
  };

  const handleRewind = () => {
    if (history.length === 0 || currentIndex === 0) return;
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setAnimationClass('');
  };

  const nextProfile = () => {
    setAnimationClass('');
    setCurrentIndex((prev) => prev + 1);
  };

  if (!currentProfile || currentIndex >= profiles.length) {
    return (
      <div className="tinder-empty-deck">
        <div className="radar-animation">
          <div className="radar-circle circle-1"></div>
          <div className="radar-circle circle-2"></div>
          <div className="radar-circle circle-3"></div>
          <div className="radar-avatar">✨</div>
        </div>
        <h3>No hay más personas cerca por ahora</h3>
        <p>Has explorado todos los solteros adventistas disponibles. ¡Vuelve más tarde o ajusta tus filtros!</p>
        <button
          className="tinder-reload-btn"
          onClick={() => {
            setCurrentIndex(0);
            setHistory([]);
          }}
        >
          🔄 Volver a ver perfiles
        </button>
      </div>
    );
  }

  const currentPhoto = profilePhotos[currentPhotoIndex] || null;

  return (
    <div className="tinder-deck-container">
      {/* TARJETA DE PERFIL ESTILO TINDER */}
      <div className={`tinder-card ${animationClass}`}>
        {/* SELLOS DE ESTADO (LIKE / NOPE / SUPER LIKE) */}
        <div className="tinder-stamp stamp-like">LIKE</div>
        <div className="tinder-stamp stamp-nope">NOPE</div>
        <div className="tinder-stamp stamp-super">SUPER LIKE</div>

        {/* CONTENEDOR FOTOGRÁFICO */}
        <div className="tinder-photo-viewport">
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt={currentProfile.full_name}
              className="tinder-card-img"
            />
          ) : (
            <div className="tinder-avatar-fallback">👤</div>
          )}

          {/* BARRITAS DE NAVEGACIÓN ESTILO INSTA/TINDER STORIES */}
          {profilePhotos.length > 1 && (
            <div className="tinder-story-bars">
              {profilePhotos.map((_, idx) => (
                <div
                  key={idx}
                  className={`tinder-bar ${idx === currentPhotoIndex ? 'active' : ''}`}
                ></div>
              ))}
            </div>
          )}

          {/* ZONAS TÁCTILES IZQ / DCHA */}
          {profilePhotos.length > 1 && (
            <>
              <div
                className="tinder-tap-zone zone-left"
                onClick={handlePrevPhoto}
                title="Foto anterior"
              />
              <div
                className="tinder-tap-zone zone-right"
                onClick={handleNextPhoto}
                title="Foto siguiente"
              />
            </>
          )}

          {/* OVERLAY DEGRADADO CON NOMBRE Y DETALLES */}
          <div className="tinder-gradient-overlay">
            <div className="tinder-headline">
              <div className="tinder-name-age">
                <h1>{currentProfile.full_name}</h1>
                <span className="tinder-age">{currentProfile.age}</span>
                <span className="tinder-badge-verified" title="Perfil adventista verificado">✓</span>
              </div>

              <button
                type="button"
                className="tinder-info-btn"
                onClick={() => setShowFullInfo(!showFullInfo)}
                title="Ver biografía completa"
              >
                {showFullInfo ? '✕' : 'ℹ'}
              </button>
            </div>

            <div className="tinder-pills-row">
              <span className="tinder-pill location-pill">
                📍 {currentProfile.city}, {currentProfile.country}
              </span>
              {currentProfile.church_name && (
                <span className="tinder-pill church-pill">
                  ⛪ {currentProfile.church_name}
                </span>
              )}
            </div>

            {/* ATRIBUTOS CLAVE (ESTATURA, DIETA, ETNIA, HABITOS) */}
            <div className="tinder-traits-cloud">
              {currentProfile.height && (
                <span className="trait-tag" title="Estatura">📏 {currentProfile.height}</span>
              )}
              {currentProfile.diet && (
                <span className="trait-tag" title="Dieta">🥗 {currentProfile.diet}</span>
              )}
              {currentProfile.ethnicity && (
                <span className="trait-tag" title="Etnia">🧬 {currentProfile.ethnicity}</span>
              )}
              {currentProfile.weight && showFullInfo && (
                <span className="trait-tag" title="Complexión / Peso">⚖️ {currentProfile.weight}</span>
              )}
              {currentProfile.smokes === 'No' && (
                <span className="trait-tag" title="No fuma">🚭 No fuma</span>
              )}
              {currentProfile.drinks === 'No' && (
                <span className="trait-tag" title="No bebe">🍷 No bebe</span>
              )}
              {currentProfile.marital_status && showFullInfo && (
                <span className="trait-tag" title="Estado civil">💍 {currentProfile.marital_status}</span>
              )}
              {currentProfile.occupation && (
                <span className="trait-tag" title="Ocupación">💼 {currentProfile.occupation}</span>
              )}
              {currentProfile.baptized === 'Sí' && (
                <span className="trait-tag" title="Bautizado adventista">💧 Bautizado/a</span>
              )}
            </div>

            {/* VISTA RESUMIDA O EXPANDIDA DE LA BIOGRAFÍA */}
            <p className={`tinder-bio ${showFullInfo ? 'expanded' : ''}`}>
              {currentProfile.bio || 'Miembro activo adventista con metas de vida claras y fe compartida.'}
            </p>

            {/* CHIPS DE INTERESES / ESTILO DE VIDA */}
            {currentProfile.interests && currentProfile.interests.length > 0 && (
              <div className="tinder-interests-cloud">
                {currentProfile.interests.map((tag, i) => (
                  <span key={i} className="tinder-interest-tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BARRA DE ACCIONES TINDER (REWIND, NOPE, SUPER LIKE, LIKE, BOOST) */}
      <div className="tinder-controls-bar">
        <button
          type="button"
          className="tinder-ctrl-btn btn-rewind"
          onClick={handleRewind}
          disabled={history.length === 0}
          title="Deshacer última acción"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M12.5 8c-2.65 0-5.05 1-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
          </svg>
        </button>

        <button
          type="button"
          className="tinder-ctrl-btn btn-nope"
          onClick={() => triggerAction('dislike')}
          title="No me interesa (Pasar)"
        >
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        <button
          type="button"
          className="tinder-ctrl-btn btn-super"
          onClick={() => triggerAction('superlike')}
          title="Super Conexión con propósito"
        >
          <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
          </svg>
        </button>

        <button
          type="button"
          className="tinder-ctrl-btn btn-like"
          onClick={() => triggerAction('like')}
          title="Me gusta (Conectar con propósito)"
        >
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>

      <div className="tinder-keyboard-hint">
        <span>Usa los botones o haz clic a los lados para cambiar de foto</span>
      </div>
    </div>
  );
}
