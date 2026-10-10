import { useState } from 'react';

export default function Encounters({ profiles = [], onLike, onDislike, onSuperLike }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState('');

  const currentProfile = profiles[currentIndex] || null;

  // Lista de fotos del perfil actual
  const profilePhotos = currentProfile
    ? (currentProfile.photos && currentProfile.photos.length > 0
        ? currentProfile.photos
        : [currentProfile.avatar_url].filter(Boolean))
    : [];

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
      setAnimationClass('swipe-left');
      setTimeout(() => {
        onDislike(currentProfile);
        nextProfile();
      }, 250);
    } else if (type === 'like') {
      setAnimationClass('swipe-right');
      setTimeout(() => {
        onLike(currentProfile);
        nextProfile();
      }, 250);
    } else if (type === 'superlike') {
      setAnimationClass('swipe-up');
      setTimeout(() => {
        onSuperLike(currentProfile);
        nextProfile();
      }, 250);
    }
  };

  const nextProfile = () => {
    setAnimationClass('');
    setCurrentPhotoIndex(0);
    setCurrentIndex((prev) => prev + 1);
  };

  if (!currentProfile || currentIndex >= profiles.length) {
    return (
      <div className="encounters-empty-card">
        <div className="encounters-empty-icon">✨</div>
        <h3>¡Has visto a todos por ahora!</h3>
        <p>Has explorado todos los perfiles adventistas disponibles según tus preferencias.</p>
        <button
          className="primary-btn"
          onClick={() => {
            setCurrentIndex(0);
            setCurrentPhotoIndex(0);
          }}
        >
          Volver a explorar desde el inicio
        </button>
      </div>
    );
  }

  const currentPhoto = profilePhotos[currentPhotoIndex] || null;

  return (
    <div className="encounters-wrapper">
      <div className={`encounters-card ${animationClass}`}>
        {/* FOTO PRINCIPAL Y NAVEGACIÓN ESTILO STORIES */}
        <div className="encounters-photo-container">
          {currentPhoto ? (
            <img
              src={currentPhoto}
              alt={currentProfile.full_name}
              className="encounters-main-photo"
            />
          ) : (
            <div className="encounters-avatar-placeholder">
              👤
            </div>
          )}

          {/* BARRITAS DE FOTOS ESTILO BADOO/STORIES */}
          {profilePhotos.length > 1 && (
            <div className="photo-stories-bars">
              {profilePhotos.map((_, idx) => (
                <div
                  key={idx}
                  className={`story-bar ${idx === currentPhotoIndex ? 'active' : ''}`}
                ></div>
              ))}
            </div>
          )}

          {/* CONTROLES TÁCTILES IZQUIERDA / DERECHA */}
          {profilePhotos.length > 1 && (
            <>
              <button
                type="button"
                className="photo-tap-left"
                onClick={handlePrevPhoto}
                aria-label="Foto anterior"
              />
              <button
                type="button"
                className="photo-tap-right"
                onClick={handleNextPhoto}
                aria-label="Foto siguiente"
              />
            </>
          )}

          {/* DEGRADADO CON NOMBRE Y UBICACIÓN */}
          <div className="encounters-overlay-info">
            <div className="encounters-name-row">
              <h2>{currentProfile.full_name}, {currentProfile.age}</h2>
              <span className="encounters-verified-badge" title="Perfil verificado">✓ Verificado</span>
            </div>

            <div className="encounters-meta">
              <span>📍 {currentProfile.city}, {currentProfile.country}</span>
              {currentProfile.church_name && (
                <span className="church-tag">⛪ {currentProfile.church_name}</span>
              )}
            </div>

            {currentProfile.bio && (
              <p className="encounters-bio">{currentProfile.bio}</p>
            )}

            {currentProfile.interests && currentProfile.interests.length > 0 && (
              <div className="encounters-interests">
                {currentProfile.interests.map((tag, i) => (
                  <span key={i} className="interest-pill">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BOTONES DE ACCIÓN FLOTANTES DE BADOO (✕, ⭐, ❤️) */}
        <div className="badoo-actions-bar">
          <button
            type="button"
            className="badoo-action-btn btn-dislike"
            onClick={() => triggerAction('dislike')}
            title="Pasar / No me interesa"
            aria-label="Dislike"
          >
            ✕
          </button>

          <button
            type="button"
            className="badoo-action-btn btn-superlike"
            onClick={() => triggerAction('superlike')}
            title="Super Conexión con propósito"
            aria-label="Super Like"
          >
            ★
          </button>

          <button
            type="button"
            className="badoo-action-btn btn-like"
            onClick={() => triggerAction('like')}
            title="Me gusta / Conectar"
            aria-label="Like"
          >
            ♥
          </button>
        </div>
      </div>

      <div className="encounters-keyboard-tip">
        <span>💡 Puedes hacer clic en los lados de la foto para ver más fotos de {currentProfile.full_name.split(' ')[0]}</span>
      </div>
    </div>
  );
}
