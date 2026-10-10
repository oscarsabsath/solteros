import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseService } from '../services/supabaseService';
import PhotoUploader from './PhotoUploader';

export default function Dashboard() {
  const { user, logout, isConfigured } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);

  // User profile photos state
  const [myPhotos, setMyPhotos] = useState(user?.profile?.photos || (user?.profile?.avatar_url ? [user?.profile?.avatar_url] : []));

  // Filters
  const [genderFilter, setGenderFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'connections' | 'profile'

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const list = await supabaseService.getProfiles();
      // Filtrar el perfil propio para no mostrarse a sí mismo en el feed
      const filtered = list.filter((p) => p.id !== user?.id && p.email !== user?.email);
      setProfiles(filtered);
      setConnections(supabaseService.getConnections());
      setLoading(false);
    }
    loadData();
  }, [user]);

  const handleConnect = async (profileId) => {
    const updated = await supabaseService.connectWith(profileId);
    setConnections([...updated]);
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

  const connectedProfiles = profiles.filter((p) => connections.includes(p.id));

  return (
    <div className="dashboard-container">
      {/* Barra superior de la aplicación */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="logo">Solteros Adventistas</div>
          <span className="platform-tag">Comunidad</span>
        </div>

        <nav className="dashboard-nav">
          <button
            className={`nav-tab-btn ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            👥 Explorar Personas
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
            onClick={() => setActiveTab('connections')}
          >
            ♥ Mis Conexiones ({connections.length})
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
          <span className="user-name">Hola, {user?.profile?.full_name || user?.email}</span>
          <button onClick={logout} className="logout-btn">
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Banner de estado de la base de datos */}
      {!isConfigured ? (
        <div className="status-banner local-banner">
          <span>🟢 <strong>Modo Demostración Activo:</strong> La plataforma está guardando fotos y perfiles de forma interactiva.</span>
        </div>
      ) : (
        <div className="status-banner cloud-banner">
          <span>☁️ <strong>Conectado a Google Firebase:</strong> Proyecto <code>solteros-adventistas-ff39e</code> sincronizado.</span>
        </div>
      )}

      {/* VISTA 1: FEED DE PERFILES ESTILO BADOO */}
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
                const isConnected = connections.includes(p.id);
                const photoSrc = p.avatar_url || (p.photos && p.photos[0]);
                const photoCount = p.photos ? p.photos.length : (p.avatar_url ? 1 : 0);

                return (
                  <article key={p.id} className="user-card badoo-card">
                    {/* FOTO ESTILO BADOO CON ASPECT RATIO */}
                    <div className="badoo-card-photo-wrap">
                      {photoSrc ? (
                        <img
                          src={photoSrc}
                          alt={p.full_name}
                          className="badoo-card-photo"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="card-avatar-placeholder"
                          style={{ backgroundColor: p.avatar_color || '#087f5b' }}
                        >
                          {p.full_name?.charAt(0) || '👤'}
                        </div>
                      )}

                      {photoCount > 1 && (
                        <span className="badoo-photo-badge">📷 {photoCount} fotos</span>
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

                    <div className="card-footer">
                      <button
                        className={`connect-btn ${isConnected ? 'connected' : ''}`}
                        onClick={() => handleConnect(p.id)}
                      >
                        {isConnected ? '✓ Solicitud enviada' : '♥ Conectar con propósito'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* VISTA 2: MIS CONEXIONES */}
      {activeTab === 'connections' && (
        <main className="dashboard-main">
          <h2>Tus Conexiones con Propósito</h2>
          <p className="subheading">Personas con las que has mostrado interés mutuo.</p>

          {connectedProfiles.length === 0 ? (
            <div className="empty-state">
              <h3>Aún no has conectado con nadie</h3>
              <p>Ve a "Explorar Personas" y pulsa en "♥ Conectar con propósito" para iniciar conversaciones.</p>
              <button className="primary-btn" onClick={() => setActiveTab('feed')}>
                Explorar Personas
              </button>
            </div>
          ) : (
            <div className="profiles-grid">
              {connectedProfiles.map((p) => {
                const photoSrc = p.avatar_url || (p.photos && p.photos[0]);
                return (
                  <article key={p.id} className="user-card badoo-card">
                    <div className="badoo-card-photo-wrap">
                      {photoSrc ? (
                        <img src={photoSrc} alt={p.full_name} className="badoo-card-photo" />
                      ) : (
                        <div className="card-avatar-placeholder">👤</div>
                      )}
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
                      <button className="primary-btn message-btn" onClick={() => alert(`Iniciando chat privado con ${p.full_name}...`)}>
                        💬 Iniciar Conversación
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      )}

      {/* VISTA 3: MI PERFIL CON GALERÍA DE FOTOS BADOO */}
      {activeTab === 'profile' && (
        <main className="dashboard-main">
          <div className="my-profile-card">
            <h2>Mi Perfil & Galería de Fotos</h2>
            <p className="subheading">Gestiona tus 6 fotos de perfil y tus datos visibles para la comunidad.</p>

            {/* GESTOR DE FOTOS ESTILO BADOO */}
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
    </div>
  );
}
