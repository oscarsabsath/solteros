import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseService } from '../services/supabaseService';
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
      // Filtrar el perfil propio para no mostrarse a sí mismo
      const filtered = list.filter((p) => p.id !== user?.id && p.email !== user?.email);
      setProfiles(filtered);
      setConnections(supabaseService.getConnections());
      setMatches(supabaseService.getMatches());
      setLikedIds(supabaseService.getLikes());
      setLoading(false);
    }
    loadData();
  }, [user]);

  // Manejador de Like estilo Badoo
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

  // Manejador de Dislike estilo Badoo
  const handleDislike = async (targetProfile) => {
    await supabaseService.dislikeProfile(targetProfile.id);
  };

  // Manejador de Super Like estilo Badoo
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
    <div className="dashboard-container">
      {/* BARRA SUPERIOR DE NAVEGACIÓN ESTILO BADOO */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="logo">Solteros Adventistas</div>
          <span className="platform-tag">Badoo Edition</span>
        </div>

        <nav className="dashboard-nav">
          <button
            className={`nav-tab-btn ${activeTab === 'encounters' ? 'active' : ''}`}
            onClick={() => setActiveTab('encounters')}
          >
            🃏 Encuentros
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            👥 Explorar ({profiles.length})
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            ♥ Matches & Likes ({matches.length})
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Mi Perfil
          </button>
        </nav>

        <div className="user-control">
          {myPhotos[0] ? (
            <img src={myPhotos[0]} alt="Avatar" className="user-nav-avatar" />
          ) : (
            <div className="user-nav-avatar-fallback">👤</div>
          )}
          <span className="user-name">Hola, {user?.profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>
          <button onClick={logout} className="logout-btn">
            Salir
          </button>
        </div>
      </header>

      {/* BANNER DE ESTADO */}
      {!isConfigured ? (
        <div className="status-banner local-banner">
          <span>🟢 <strong>Modo Interactivo:</strong> Sistema de Likes, Matches y fotos activo.</span>
        </div>
      ) : (
        <div className="status-banner cloud-banner">
          <span>☁️ <strong>Conectado a Google Firebase:</strong> Proyecto <code>solteros-adventistas-ff39e</code> sincronizado.</span>
        </div>
      )}

      {/* VISTA 1: ENCUENTROS ESTILO BADOO (DESLIZAR / DAR LIKE ✕ ⭐ ♥) */}
      {activeTab === 'encounters' && (
        <main className="dashboard-main encounters-page">
          <div className="encounters-section-header">
            <h2>Encuentros con Propósito</h2>
            <p>Descubre personas una a una. Pulsa <strong>♥</strong> para dar like o <strong>✕</strong> para pasar.</p>
          </div>

          {loading ? (
            <div className="loading-state">Cargando perfiles...</div>
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

      {/* VISTA 2: EXPLORAR CUADRÍCULA DE PERFILES */}
      {activeTab === 'feed' && (
        <main className="dashboard-main">
          <div className="dashboard-toolbar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar por nombre, país, ciudad o iglesia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Ver:</label>
              <button
                className={`filter-btn ${genderFilter === 'Todos' ? 'active' : ''}`}
                onClick={() => setGenderFilter('Todos')}
              >
                Todos
              </button>
              <button
                className={`filter-btn ${genderFilter === 'Mujer' ? 'active' : ''}`}
                onClick={() => setGenderFilter('Mujer')}
              >
                Mujeres
              </button>
              <button
                className={`filter-btn ${genderFilter === 'Hombre' ? 'active' : ''}`}
                onClick={() => setGenderFilter('Hombre')}
              >
                Hombres
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Cargando personas de la comunidad...</div>
          ) : filteredProfiles.length === 0 ? (
            <div className="empty-state">
              <h3>No se encontraron perfiles con esos criterios</h3>
              <p>Prueba ajustando los filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="profiles-grid">
              {filteredProfiles.map((p) => {
                const isLiked = likedIds.includes(p.id);
                const isMatched = matches.includes(p.id);
                const photoSrc = p.avatar_url || (p.photos && p.photos[0]);
                const photoCount = p.photos ? p.photos.length : (p.avatar_url ? 1 : 0);

                return (
                  <article key={p.id} className="user-card badoo-card">
                    <div className="badoo-card-photo-wrap">
                      {photoSrc ? (
                        <img
                          src={photoSrc}
                          alt={p.full_name}
                          className="badoo-card-photo"
                          loading="lazy"
                        />
                      ) : (
                        <div className="card-avatar-placeholder">👤</div>
                      )}

                      {photoCount > 1 && (
                        <span className="badoo-photo-badge">📷 {photoCount} fotos</span>
                      )}

                      {isMatched && (
                        <span className="badoo-match-badge">✨ Match con Propósito</span>
                      )}

                      <div className="badoo-photo-gradient-overlay">
                        <h3>{p.full_name}, {p.age}</h3>
                        <span className="badoo-location-text">📍 {p.city}{p.country ? `, ${p.country}` : ''}</span>
                      </div>
                    </div>

                    <div className="card-info">
                      {p.church_name && (
                        <div className="church-pill">
                          ⛪ {p.church_name}
                        </div>
                      )}

                      <p className="card-bio">{p.bio || 'Miembro adventista que busca conectar con propósito.'}</p>

                      {p.interests && p.interests.length > 0 && (
                        <div className="interests-wrap">
                          {p.interests.map((tag, i) => (
                            <span key={i} className="interest-tag">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="card-footer badoo-grid-footer">
                      <button
                        className={`badoo-mini-btn mini-dislike`}
                        onClick={() => handleDislike(p)}
                        title="Pasar"
                      >
                        ✕
                      </button>

                      <button
                        className={`badoo-mini-btn mini-superlike`}
                        onClick={() => handleSuperLike(p)}
                        title="Super Like"
                      >
                        ★
                      </button>

                      <button
                        className={`badoo-mini-btn mini-like ${isLiked ? 'liked' : ''}`}
                        onClick={() => handleLike(p)}
                        title="Dar Like"
                      >
                        ♥ {isLiked ? 'Te gusta' : 'Me gusta'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* VISTA 3: MATCHES & LIKES */}
      {activeTab === 'matches' && (
        <main className="dashboard-main">
          <h2>Tus Matches y Conexiones con Propósito</h2>
          <p className="subheading">Personas a las que les gustas y con las que hay interés mutuo.</p>

          {matchedProfilesList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💌</div>
              <h3>Aún no tienes ningún match mutuo</h3>
              <p>Ve a "Encuentros" o "Explorar" y dale <strong>♥ Me gusta</strong> a los perfiles que compartan tus valores para conectar.</p>
              <button className="primary-btn" onClick={() => setActiveTab('encounters')}>
                Ir a Encuentros
              </button>
            </div>
          ) : (
            <div className="profiles-grid">
              {matchedProfilesList.map((p) => {
                const photoSrc = p.avatar_url || (p.photos && p.photos[0]);
                return (
                  <article key={p.id} className="user-card badoo-card match-highlight-card">
                    <div className="badoo-card-photo-wrap">
                      {photoSrc ? (
                        <img src={photoSrc} alt={p.full_name} className="badoo-card-photo" />
                      ) : (
                        <div className="card-avatar-placeholder">👤</div>
                      )}
                      <span className="badoo-match-badge">🎉 ¡Conexión Mutua!</span>
                      <div className="badoo-photo-gradient-overlay">
                        <h3>{p.full_name}, {p.age}</h3>
                        <span className="badoo-location-text">📍 {p.city}, {p.country}</span>
                      </div>
                    </div>
                    <div className="card-info">
                      <div className="church-pill">⛪ {p.church_name}</div>
                      <p className="card-bio">{p.bio}</p>
                    </div>
                    <div className="card-footer">
                      <button
                        className="primary-btn message-btn"
                        onClick={() => alert(`Abriendo chat con ${p.full_name}...`)}
                      >
                        💬 Enviar Mensaje con Propósito
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* VISTA 4: MI PERFIL CON GALERÍA DE FOTOS BADOO */}
      {activeTab === 'profile' && (
        <main className="dashboard-main">
          <div className="my-profile-card">
            <h2>Mi Perfil & Galería de Fotos</h2>
            <p className="subheading">Gestiona tus 6 fotos de perfil y tus datos visibles para la comunidad.</p>

            <div className="profile-photos-manager">
              <PhotoUploader
                photos={myPhotos}
                onPhotosChange={handleUpdateMyPhotos}
                maxPhotos={6}
              />
            </div>

            <hr className="profile-divider" />

            <div className="profile-details-grid">
              <div className="detail-item">
                <span className="label">Nombre:</span>
                <strong>{user?.profile?.full_name || 'No especificado'}</strong>
              </div>
              <div className="detail-item">
                <span className="label">Correo:</span>
                <strong>{user?.email}</strong>
              </div>
              <div className="detail-item">
                <span className="label">Edad:</span>
                <strong>{user?.profile?.age} años</strong>
              </div>
              <div className="detail-item">
                <span className="label">Género:</span>
                <strong>{user?.profile?.gender}</strong>
              </div>
              <div className="detail-item">
                <span className="label">Ubicación:</span>
                <strong>{user?.profile?.city}, {user?.profile?.country}</strong>
              </div>
              <div className="detail-item">
                <span className="label">Iglesia Adventista:</span>
                <strong>{user?.profile?.church_name || 'No indicada'}</strong>
              </div>
            </div>

            <div className="bio-block">
              <span className="label">Biografía y Propósito:</span>
              <p>{user?.profile?.bio || 'Sin biografía añadida aún.'}</p>
            </div>

            {user?.profile?.interests && user?.profile?.interests.length > 0 && (
              <div className="bio-block">
                <span className="label">Intereses y Ministerios:</span>
                <div className="interests-wrap">
                  {user.profile.interests.map((it, idx) => (
                    <span key={idx} className="interest-tag">#{it}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* MODAL DE CELEBRACIÓN DE MATCH ESTILO BADOO */}
      <MatchModal
        isOpen={isMatchModalOpen}
        matchedProfile={currentMatchedProfile}
        userProfile={user?.profile}
        onClose={() => setIsMatchModalOpen(false)}
        onOpenChat={(profile) => {
          alert(`Iniciando chat privado con ${profile.full_name}`);
        }}
      />
    </div>
  );
}
