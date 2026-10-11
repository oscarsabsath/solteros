import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseService } from '../services/supabaseService';
import { firebaseService } from '../services/firebaseService';
import PhotoUploader from './PhotoUploader';
import Encounters from './Encounters';
import MatchModal from './MatchModal';

export default function Dashboard() {
  const { user, logout, isConfigured } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [matches, setMatches] = useState([]);
  const [likedIds, setLikedIds] = useState([]);

  // Match Modal state
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [currentMatchedProfile, setCurrentMatchedProfile] = useState(null);

  // User profile photos state
  const [myPhotos, setMyPhotos] = useState(
    user?.profile?.photos || (user?.profile?.avatar_url ? [user?.profile?.avatar_url] : [])
  );

  // Filters
  const [genderFilter, setGenderFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('encounters'); // 'encounters' | 'feed' | 'matches' | 'profile'

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const list = await supabaseService.getProfiles();
      const filtered = list.filter((p) => p.id !== user?.id && p.email !== user?.email);
      setProfiles(filtered);
      setConnections(supabaseService.getConnections());
      setMatches(supabaseService.getMatches());
      setLikedIds(supabaseService.getLikes());
      setLoading(false);
    }
    loadData();
  }, [user]);

  // Manejador de Like estilo Tinder
  const handleLike = async (targetProfile) => {
    const res = await supabaseService.likeProfile(targetProfile.id);
    setLikedIds((prev) => [...new Set([...prev, targetProfile.id])]);
    setConnections(supabaseService.getConnections());

    if (res.isMatch) {
      setMatches((prev) => [...new Set([...prev, targetProfile.id])]);
      setCurrentMatchedProfile(targetProfile);
      setIsMatchModalOpen(true);
    }
  };

  // Manejador de Dislike estilo Tinder
  const handleDislike = async (targetProfile) => {
    await supabaseService.dislikeProfile(targetProfile.id);
  };

  // Manejador de Super Like estilo Tinder
  const handleSuperLike = async (targetProfile) => {
    const res = await supabaseService.superLikeProfile(targetProfile.id);
    setLikedIds((prev) => [...new Set([...prev, targetProfile.id])]);
    setConnections(supabaseService.getConnections());

    if (res.isMatch) {
      setMatches((prev) => [...new Set([...prev, targetProfile.id])]);
      setCurrentMatchedProfile(targetProfile);
      setIsMatchModalOpen(true);
    }
  };

  const handleUpdateMyPhotos = (updatedPhotos) => {
    setMyPhotos(updatedPhotos);
    if (user && user.profile) {
      user.profile.photos = updatedPhotos;
      user.profile.avatar_url = updatedPhotos[0] || '';
      localStorage.setItem('solteros_adv_user', JSON.stringify(user));
      if (user.id) {
        firebaseService.saveProfileToFirestore(user.id, user.profile);
      }
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchesGender = genderFilter === 'Todos' || p.gender === genderFilter;
    const matchesSearch =
      !searchTerm ||
      p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.church_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGender && matchesSearch;
  });

  const matchedProfilesList = profiles.filter((p) => matches.includes(p.id));

  return (
    <div className="tinder-app-shell">
      {/* HEADER SUPERIOR MINIMALISTA Y ELEGANTE */}
      <header className="tinder-top-nav">
        <div className="tinder-brand">
          <span className="tinder-flame">♥</span>
          <span className="brand-name">Solteros Adventistas</span>
        </div>

        <nav className="tinder-tabs-menu">
          <button
            className={`tinder-nav-link ${activeTab === 'encounters' ? 'active' : ''}`}
            onClick={() => setActiveTab('encounters')}
          >
            <span className="nav-icon">🎴</span>
            <span className="nav-label">Descubrir</span>
          </button>
          <button
            className={`tinder-nav-link ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <span className="nav-icon">🔍</span>
            <span className="nav-label">Explorar</span>
          </button>
          <button
            className={`tinder-nav-link ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-label">Matches</span>
            {matches.length > 0 && <span className="nav-counter">{matches.length}</span>}
          </button>
          <button
            className={`tinder-nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-label">Mi Perfil</span>
          </button>
        </nav>

        <div className="tinder-user-corner">
          <div className="user-avatar-wrap" onClick={() => setActiveTab('profile')}>
            {myPhotos[0] ? (
              <img src={myPhotos[0]} alt="Avatar" className="tinder-nav-thumb" />
            ) : (
              <div className="tinder-nav-thumb fallback">👤</div>
            )}
            <span className="online-dot"></span>
          </div>
          <button onClick={logout} className="tinder-logout-btn" title="Cerrar sesión">
            ✕
          </button>
        </div>
      </header>

      {/* VISTA 1: DESCUBRIR (TINDER CARD DECK) */}
      {activeTab === 'encounters' && (
        <main className="tinder-main-view">
          {loading ? (
            <div className="tinder-loading">
              <div className="pulse-loader"></div>
              <p>Buscando personas con propósito...</p>
            </div>
          ) : (
            <Encounters
              profiles={filteredProfiles}
              onLike={handleLike}
              onDislike={handleDislike}
              onSuperLike={handleSuperLike}
            />
          )}
        </main>
      )}

      {/* VISTA 2: EXPLORAR (GRID DE PERFILES) */}
      {activeTab === 'feed' && (
        <main className="tinder-explore-view">
          <div className="explore-toolbar">
            <div className="explore-search">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar por nombre, país, ciudad o iglesia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="explore-filters">
              <button
                className={`filter-pill ${genderFilter === 'Todos' ? 'active' : ''}`}
                onClick={() => setGenderFilter('Todos')}
              >
                Todos ({profiles.length})
              </button>
              <button
                className={`filter-pill ${genderFilter === 'Mujer' ? 'active' : ''}`}
                onClick={() => setGenderFilter('Mujer')}
              >
                Mujeres
              </button>
              <button
                className={`filter-pill ${genderFilter === 'Hombre' ? 'active' : ''}`}
                onClick={() => setGenderFilter('Hombre')}
              >
                Hombres
              </button>
            </div>
          </div>

          {loading ? (
            <div className="tinder-loading">Cargando comunidad...</div>
          ) : filteredProfiles.length === 0 ? (
            <div className="explore-empty">
              <h3>No encontramos perfiles</h3>
              <p>Prueba con otros términos de búsqueda o filtros.</p>
            </div>
          ) : (
            <div className="tinder-grid">
              {filteredProfiles.map((p) => {
                const isLiked = likedIds.includes(p.id);
                const isMatched = matches.includes(p.id);
                const photoSrc = p.avatar_url || (p.photos && p.photos[0]);
                const photoCount = p.photos ? p.photos.length : (p.avatar_url ? 1 : 0);

                return (
                  <article key={p.id} className="tinder-grid-card">
                    <div className="grid-photo-container">
                      {photoSrc ? (
                        <img src={photoSrc} alt={p.full_name} className="grid-photo" loading="lazy" />
                      ) : (
                        <div className="grid-avatar-fallback">👤</div>
                      )}

                      {photoCount > 1 && (
                        <span className="grid-photos-count">📷 {photoCount}</span>
                      )}

                      {isMatched && (
                        <span className="grid-match-tag">✨ Match</span>
                      )}

                      <div className="grid-photo-overlay">
                        <div className="grid-name-age">
                          <h3>{p.full_name}, {p.age}</h3>
                          <span className="verified-check">✓</span>
                        </div>
                        <span className="grid-location">📍 {p.city}{p.country ? `, ${p.country}` : ''}</span>
                      </div>
                    </div>

                    <div className="grid-card-body">
                      {p.church_name && (
                        <span className="church-chip">⛪ {p.church_name}</span>
                      )}
                      <p className="grid-bio">{p.bio || 'Miembro de la comunidad adventista.'}</p>
                    </div>

                    <div className="grid-actions">
                      <button
                        className="grid-btn btn-pass"
                        onClick={() => handleDislike(p)}
                        title="Pasar"
                      >
                        ✕
                      </button>
                      <button
                        className="grid-btn btn-star"
                        onClick={() => handleSuperLike(p)}
                        title="Super Conexión"
                      >
                        ★
                      </button>
                      <button
                        className={`grid-btn btn-heart ${isLiked ? 'active' : ''}`}
                        onClick={() => handleLike(p)}
                        title="Me gusta"
                      >
                        ♥
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* VISTA 3: MATCHES & CONVERSACIONES (ESTILO TINDER CHATS) */}
      {activeTab === 'matches' && (
        <main className="tinder-matches-view">
          {/* BANDEJA SUPERIOR HORIZONTAL DE NUEVOS MATCHES */}
          <section className="new-matches-tray">
            <h4>Nuevos Matches ({matches.length})</h4>
            {matchedProfilesList.length === 0 ? (
              <p className="no-matches-hint">
                Aún no tienes nuevos matches. ¡Dale <strong>♥ Me gusta</strong> a personas en la pestaña <strong>Descubrir</strong> para conectar!
              </p>
            ) : (
              <div className="matches-scroll-row">
                {matchedProfilesList.map((m) => {
                  const photoSrc = m.avatar_url || (m.photos && m.photos[0]);
                  return (
                    <div
                      key={m.id}
                      className="match-bubble-item"
                      onClick={() => alert(`Iniciando chat con ${m.full_name}...`)}
                      title={`Chatear con ${m.full_name}`}
                    >
                      <div className="match-bubble-ring">
                        <img src={photoSrc} alt={m.full_name} className="match-bubble-img" />
                      </div>
                      <span className="match-bubble-name">{m.full_name.split(' ')[0]}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* LISTADO DE CONVERSACIONES */}
          <section className="conversations-section">
            <h4>Mensajes con Propósito</h4>
            {matchedProfilesList.length === 0 ? (
              <div className="conversations-empty">
                <div className="chat-bubble-icon">💬</div>
                <h3>Tus conversaciones aparecerán aquí</h3>
                <p>Cuando tú y otra persona os gustéis mutuamente, podréis comenzar a hablar en privado.</p>
                <button className="tinder-action-accent" onClick={() => setActiveTab('encounters')}>
                  Descubrir personas ahora
                </button>
              </div>
            ) : (
              <div className="conversations-list">
                {matchedProfilesList.map((m) => {
                  const photoSrc = m.avatar_url || (m.photos && m.photos[0]);
                  return (
                    <article
                      key={m.id}
                      className="conversation-item"
                      onClick={() => alert(`Abriendo conversación con ${m.full_name}...`)}
                    >
                      <div className="conv-avatar">
                        <img src={photoSrc} alt={m.full_name} />
                        <span className="conv-online-dot"></span>
                      </div>
                      <div className="conv-details">
                        <div className="conv-top-line">
                          <strong>{m.full_name}</strong>
                          <span className="conv-time">Nuevo</span>
                        </div>
                        <p className="conv-preview">
                          ¡Habéis conectado! Saluda a {m.full_name.split(' ')[0]} y cuéntale qué os une en la fe.
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      )}

      {/* VISTA 4: MI PERFIL (EDITOR Y GALERÍA BADOO/TINDER) */}
      {activeTab === 'profile' && (
        <main className="tinder-profile-view">
          <div className="profile-container-card">
            <div className="profile-hero-badge">
              <span className="avatar-letter">👤</span>
              <div>
                <h2>{user?.profile?.full_name || 'Mi Perfil'}</h2>
                <span>{user?.email}</span>
              </div>
            </div>

            <section className="profile-section">
              <div className="section-title">
                <h3>Tus Fotos (6 slots)</h3>
                <p>La primera foto es la que verán los demás al deslizar.</p>
              </div>
              <PhotoUploader
                photos={myPhotos}
                onPhotosChange={handleUpdateMyPhotos}
                maxPhotos={6}
              />
            </section>

            <section className="profile-section">
              <div className="section-title">
                <h3>Tus Datos & Congregación</h3>
              </div>
              <div className="profile-info-grid">
                <div className="info-box">
                  <span className="box-label">Edad</span>
                  <strong>{user?.profile?.age || 25} años</strong>
                </div>
                <div className="info-box">
                  <span className="box-label">Género</span>
                  <strong>{user?.profile?.gender || 'No especificado'}</strong>
                </div>
                <div className="info-box">
                  <span className="box-label">Ubicación</span>
                  <strong>{user?.profile?.city || 'Madrid'}, {user?.profile?.country || 'España'}</strong>
                </div>
                <div className="info-box">
                  <span className="box-label">Iglesia Adventista</span>
                  <strong>{user?.profile?.church_name || 'No indicada'}</strong>
                </div>
              </div>
            </section>

            <section className="profile-section">
              <div className="section-title">
                <h3>Tu Biografía & Propósito</h3>
              </div>
              <p className="profile-bio-text">
                {user?.profile?.bio || 'Sin biografía añadida aún. Añade una descripción para conectar mejor.'}
              </p>
            </section>
          </div>
        </main>
      )}

      {/* CELEBRACIÓN DE MATCH ESTILO TINDER */}
      <MatchModal
        isOpen={isMatchModalOpen}
        matchedProfile={currentMatchedProfile}
        userProfile={user?.profile}
        onClose={() => setIsMatchModalOpen(false)}
        onOpenChat={(profile) => {
          setActiveTab('matches');
        }}
      />
    </div>
  );
}
