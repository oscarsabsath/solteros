export default function MatchModal({ isOpen, matchedProfile, userProfile, onClose, onOpenChat }) {
  if (!isOpen || !matchedProfile) return null;

  const userPhoto = userProfile?.photos?.[0] || userProfile?.avatar_url || '';
  const matchPhoto = matchedProfile?.photos?.[0] || matchedProfile?.avatar_url || '';

  return (
    <div className="match-modal-backdrop" onClick={onClose}>
      <div className="match-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="match-sparkles">✨ ♥ ✨</div>
        <h2 className="match-title">¡Es una Conexión con Propósito!</h2>
        <p className="match-subtitle">
          A ti y a <strong>{matchedProfile.full_name}</strong> os ha gustado mutuamente vuestro perfil.
        </p>

        {/* CÍRCULOS DE MATCH ENLAZADOS */}
        <div className="match-avatars-wrap">
          <div className="match-avatar-circle">
            {userPhoto ? (
              <img src={userPhoto} alt="Tu foto" />
            ) : (
              <div className="match-avatar-fallback">👤</div>
            )}
          </div>

          <div className="match-heart-badge">♥</div>

          <div className="match-avatar-circle">
            {matchPhoto ? (
              <img src={matchPhoto} alt={matchedProfile.full_name} />
            ) : (
              <div className="match-avatar-fallback">👤</div>
            )}
          </div>
        </div>

        <div className="match-church-info">
          <span>⛪ {matchedProfile.church_name || 'Comunidad Adventista'}</span>
          <span>📍 {matchedProfile.city}, {matchedProfile.country}</span>
        </div>

        <div className="match-actions">
          <button
            className="primary-btn match-chat-btn"
            onClick={() => {
              onClose();
              if (onOpenChat) onOpenChat(matchedProfile);
            }}
          >
            💬 Enviar primer mensaje con propósito
          </button>
          <button className="secondary-btn match-keep-btn" onClick={onClose}>
            Seguir descubriendo
          </button>
        </div>
      </div>
    </div>
  );
}
