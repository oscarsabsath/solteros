import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseService } from '../services/supabaseService';

export default function Dashboard() {
  const { user, logout, isConfigured } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);

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
          <span className="user-name">Hola, {user?.profile?.full_name || user?.email}</span>
          <button onClick={logout} className="logout-btn">
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Banner de estado de la base de datos */}
      {!isConfigured ? (
        <div className="status-banner local-banner">
          <span>🟢 <strong>Modo Demostración Activo:</strong> La plataforma está guardando datos de forma interactiva.</span>
        </div>
      ) : (
        <div className="status-banner cloud-banner">
          <span>☁️ <strong>Conectado a Google Firebase:</strong> Proyecto <code>solteros-adventistas-ff39e</code> sincronizado.</span>
        </div>
      )}

      {/* VISTA 1: FEED DE PERFILES */}
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
                return (
                  <article key={p.id} className="user-card">
                    <div className="card-avatar" style={{ backgroundColor: p.avatar_color || '#087f5b' }}>
                      {p.full_name?.charAt(0) || '👤'}
                    </div>

                    <div className="card-info">
                      <div className="card-header">
                        <h3>{p.full_name}, {p.age}</h3>
                        <span className="location-pill">📍 {p.city}{p.country ? `, ${p.country}` : ''}</span>
                      </div>

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
              {connectedProfiles.map((p) => (
                <article key={p.id} className="user-card">
                  <div className="card-avatar" style={{ backgroundColor: p.avatar_color || '#087f5b' }}>
                    {p.full_name?.charAt(0) || '👤'}
                  </div>
                  <div className="card-info">
                    <h3>{p.full_name}, {p.age}</h3>
                    <span className="location-pill">📍 {p.city}, {p.country}</span>
                    <div className="church-pill">⛪ {p.church_name}</div>
                    <p className="card-bio">{p.bio}</p>
                  </div>
                  <div className="card-footer">
                    <button className="primary-btn message-btn" onClick={() => alert(`Iniciando chat privado con ${p.full_name}...`)}>
                      💬 Iniciar Conversación
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      )}

      {/* VISTA 3: MI PERFIL */}
      {activeTab === 'profile' && (
        <main className="dashboard-main">
          <div className="my-profile-card">
            <h2>Mi Perfil Adventista</h2>
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
          </div>
        </main>
      )}
    </div>
  );
}
