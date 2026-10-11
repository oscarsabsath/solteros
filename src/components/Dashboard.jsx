import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabaseService } from '../services/supabaseService';
import { firebaseService } from '../services/firebaseService';
import PhotoUploader from './PhotoUploader';
import Encounters from './Encounters';
import MatchModal from './MatchModal';
import AiProfileAssistant from './AiProfileAssistant';

const BIO_INSPIRATION_IDEAS = [
  'Música sacra & alabanza 🎵',
  'Club de Conquistadores / Guía Mayor ⛺',
  'Estudio bíblico & profecías 📖',
  'Estilo de vida saludable 🥗',
  'Senderismo & naturaleza 🌿',
  'Misiones & voluntariado 🌍',
  'Hogar con propósito cristiano 🏡',
];

export default function Dashboard() {
  const { user, logout, isConfigured, updateUserProfile } = useAuth();
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

  // Biografía editor state
  const [bioText, setBioText] = useState(user?.profile?.bio || '');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [bioSavedMessage, setBioSavedMessage] = useState('');

  // Profile data editor states
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editDetails, setEditDetails] = useState({
    church_name: user?.profile?.church_name || '',
    city: user?.profile?.city || '',
    country: user?.profile?.country || '',
    age: user?.profile?.age || 25,
    gender: user?.profile?.gender || 'Hombre',
    height: user?.profile?.height || '',
    weight: user?.profile?.weight || '',
    ethnicity: user?.profile?.ethnicity || 'Hispano / Latino',
    smokes: user?.profile?.smokes || 'No',
    drinks: user?.profile?.drinks || 'No',
    diet: user?.profile?.diet || 'Vegetariana',
    marital_status: user?.profile?.marital_status || 'Soltero/a',
    has_children: user?.profile?.has_children || 'No',
    wants_children: user?.profile?.wants_children || 'Sí',
    education: user?.profile?.education || 'Universitario',
    occupation: user?.profile?.occupation || '',
    baptized: user?.profile?.baptized || 'Sí',
  });
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsSavedMessage, setDetailsSavedMessage] = useState('');

  // AI Assistant modal state in Dashboard
  const [showAiModalInDashboard, setShowAiModalInDashboard] = useState(false);
  const [showProfileCompletionBanner, setShowProfileCompletionBanner] = useState(true);

  // Filters
  const [genderFilter, setGenderFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('encounters'); // 'encounters' | 'feed' | 'matches' | 'profile'

  useEffect(() => {
    if (user?.profile) {
      setBioText(user.profile.bio || '');
      setEditDetails({
        church_name: user.profile.church_name || '',
        city: user.profile.city || '',
        country: user.profile.country || '',
        age: user.profile.age || 25,
        gender: user.profile.gender || 'Hombre',
        height: user.profile.height || '',
        weight: user.profile.weight || '',
        ethnicity: user.profile.ethnicity || 'Hispano / Latino',
        smokes: user.profile.smokes || 'No',
        drinks: user.profile.drinks || 'No',
        diet: user.profile.diet || 'Vegetariana',
        marital_status: user.profile.marital_status || 'Soltero/a',
        has_children: user.profile.has_children || 'No',
        wants_children: user.profile.wants_children || 'Sí',
        education: user.profile.education || 'Universitario',
        occupation: user.profile.occupation || '',
        baptized: user.profile.baptized || 'Sí',
      });
      if (user.profile.photos) {
        setMyPhotos(user.profile.photos);
      }
    }
  }, [user]);

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

  const handleUpdateMyPhotos = async (updatedPhotos) => {
    setMyPhotos(updatedPhotos);
    if (updateUserProfile) {
      await updateUserProfile({
        photos: updatedPhotos,
        avatar_url: updatedPhotos[0] || '',
      });
    } else if (user && user.profile) {
      user.profile.photos = updatedPhotos;
      user.profile.avatar_url = updatedPhotos[0] || '';
      localStorage.setItem('solteros_adv_user', JSON.stringify(user));
      if (user.id) {
        firebaseService.saveProfileToFirestore(user.id, user.profile);
      }
    }
  };

  const handleSaveBio = async () => {
    setIsSavingBio(true);
    setBioSavedMessage('');
    try {
      if (updateUserProfile) {
        await updateUserProfile({ bio: bioText });
      }
      setBioSavedMessage('¡Biografía guardada con éxito en tu perfil y en la nube!');
      setIsEditingBio(false);
      setTimeout(() => setBioSavedMessage(''), 4500);
    } catch (err) {
      console.error(err);
      setBioSavedMessage('Error al guardar la biografía');
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleSaveDetails = async () => {
    setIsSavingDetails(true);
    setDetailsSavedMessage('');
    try {
      if (updateUserProfile) {
        await updateUserProfile({
          church_name: editDetails.church_name,
          city: editDetails.city,
          country: editDetails.country,
          age: Number(editDetails.age),
          gender: editDetails.gender,
          height: editDetails.height,
          weight: editDetails.weight,
          ethnicity: editDetails.ethnicity,
          smokes: editDetails.smokes,
          drinks: editDetails.drinks,
          diet: editDetails.diet,
          marital_status: editDetails.marital_status,
          has_children: editDetails.has_children,
          wants_children: editDetails.wants_children,
          education: editDetails.education,
          occupation: editDetails.occupation,
          baptized: editDetails.baptized,
        });
      }
      setDetailsSavedMessage('¡Datos actualizados con éxito en tu perfil y en la nube!');
      setIsEditingDetails(false);
      setTimeout(() => setDetailsSavedMessage(''), 4500);
    } catch (err) {
      console.error(err);
      setDetailsSavedMessage('Error al actualizar datos');
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleAiProfileGeneratedInDashboard = async (generated) => {
    setBioText(generated.bio);
    setEditDetails((prev) => ({
      ...prev,
      church_name: generated.churchName || prev.church_name,
      city: generated.city || prev.city,
      country: generated.country || prev.country,
      age: generated.age || prev.age,
    }));
    if (updateUserProfile) {
      await updateUserProfile({
        bio: generated.bio,
        church_name: generated.churchName,
        city: generated.city,
        country: generated.country,
        age: Number(generated.age),
        interests: generated.interests,
      });
    }
    setShowAiModalInDashboard(false);
    setBioSavedMessage('✨ ¡Biografía redactada y guardada con el Asistente IA!');
    setTimeout(() => setBioSavedMessage(''), 4500);
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
          <button
            type="button"
            className="header-ai-launcher-btn"
            onClick={() => setShowAiModalInDashboard(true)}
            title="Abrir Asistente IA para completar tu perfil"
          >
            <span className="ai-btn-icon">✨</span>
            <span className="ai-btn-label">Asistente IA</span>
          </button>

          <div
            className="user-avatar-wrap"
            onClick={() => setActiveTab('profile')}
            title="Ir a Mi Perfil"
          >
            {myPhotos[0] ? (
              <img src={myPhotos[0]} alt="Avatar" className="tinder-nav-thumb" />
            ) : (
              <div className="tinder-nav-thumb fallback">👤</div>
            )}
            <span className="online-dot"></span>
          </div>

          <button
            onClick={logout}
            className="tinder-logout-btn"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <span className="logout-icon">🚪</span>
            <span className="logout-btn-label">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* BANNER PARA COMPLETAR PERFIL CON IA DESPUÉS DE LOGARSE / REGISTRARSE */}
      {showProfileCompletionBanner && (!user?.profile?.height || !user?.profile?.bio || !user?.profile?.diet) && (
        <aside className="post-login-ai-banner">
          <div className="ai-banner-left">
            <span className="ai-banner-sparkle">✨</span>
            <div className="ai-banner-text">
              <strong>Completa tu perfil con el Asistente IA</strong>
              <p>Agrega tu estatura, estilo de vida, dieta adventista y hábitos con propósito para recibir más conexiones afines.</p>
            </div>
          </div>
          <div className="ai-banner-right">
            <button
              type="button"
              className="ai-banner-btn-primary"
              onClick={() => setShowAiModalInDashboard(true)}
            >
              Completar con IA ➔
            </button>
            <button
              type="button"
              className="ai-banner-btn-secondary"
              onClick={() => setActiveTab('profile')}
            >
              Llenar manualmente
            </button>
            <button
              type="button"
              className="ai-banner-dismiss"
              onClick={() => setShowProfileCompletionBanner(false)}
              title="Ocultar aviso"
            >
              ✕
            </button>
          </div>
        </aside>
      )}

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
              <div className="profile-hero-info">
                <h2>{user?.profile?.full_name || 'Mi Perfil'}</h2>
                <span>{user?.email}</span>
              </div>
            </div>

            {/* ASISTENTE IA DESTACADO PARA COMPLETAR EL PERFIL POST-LOGIN */}
            <div className="profile-ai-assistant-card">
              <div className="ai-card-sparkle">✨</div>
              <div className="ai-card-content">
                <h3>Asistente IA con Propósito</h3>
                <p>¿Prefieres que la IA redacte tu biografía y complete tus datos en 1 minuto? Responde 4 preguntas y optimiza tu perfil.</p>
              </div>
              <button
                type="button"
                className="ai-card-launch-btn"
                onClick={() => setShowAiModalInDashboard(true)}
              >
                Iniciar Asistente IA ➔
              </button>
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

            {/* SECCIÓN DETALLES COMPLETOS: DATOS, ESTILO DE VIDA, HÁBITOS Y FÍSICO */}
            <section className="profile-section">
              <div className="section-title-row">
                <div className="section-title">
                  <h3>Tus Datos, Estilo de Vida & Hábitos</h3>
                  <p>Información visible para conectar con personas afines en la fe adventista.</p>
                </div>
                {!isEditingDetails ? (
                  <button
                    type="button"
                    className="edit-toggle-btn"
                    onClick={() => setIsEditingDetails(true)}
                  >
                    ✏️ Editar datos
                  </button>
                ) : (
                  <button
                    type="button"
                    className="cancel-toggle-btn"
                    onClick={() => setIsEditingDetails(false)}
                  >
                    ✕ Cancelar
                  </button>
                )}
              </div>

              {detailsSavedMessage && (
                <div className="profile-toast-success">
                  ✓ {detailsSavedMessage}
                </div>
              )}

              {isEditingDetails ? (
                <div className="profile-edit-grid-card">
                  {/* GRUPO 1: DATOS BÁSICOS & CONGREGACIÓN */}
                  <div className="edit-block-header">
                    <h4>⛪ Datos Básicos & Congregación</h4>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Edad</label>
                      <input
                        type="number"
                        min="18"
                        max="99"
                        value={editDetails.age}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, age: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Género</label>
                      <select
                        value={editDetails.gender}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, gender: e.target.value })
                        }
                      >
                        <option value="Mujer">Mujer</option>
                        <option value="Hombre">Hombre</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Ciudad</label>
                      <input
                        type="text"
                        placeholder="Madrid, Bogotá, CDMX..."
                        value={editDetails.city}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, city: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>País</label>
                      <input
                        type="text"
                        placeholder="España, Colombia, México..."
                        value={editDetails.country}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, country: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Iglesia Adventista</label>
                      <input
                        type="text"
                        placeholder="Ej: IASD Alenza, IASD Central..."
                        value={editDetails.church_name}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, church_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Bautismo Adventista</label>
                      <select
                        value={editDetails.baptized}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, baptized: e.target.value })
                        }
                      >
                        <option value="Sí">Bautizado/a</option>
                        <option value="En preparación">En preparación / Estudiando</option>
                        <option value="Crecí en la iglesia">Crecí en la iglesia</option>
                        <option value="Simpatizante">Simpatizante</option>
                      </select>
                    </div>
                  </div>

                  {/* GRUPO 2: CARACTERÍSTICAS FÍSICAS */}
                  <div className="edit-block-header">
                    <h4>📏 Características Físicas</h4>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Estatura</label>
                      <input
                        type="text"
                        placeholder="Ej: 1.75 m / 175 cm"
                        value={editDetails.height}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, height: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Peso / Complexión</label>
                      <input
                        type="text"
                        placeholder="Ej: 70 kg, Atlética, Delgada, Media..."
                        value={editDetails.weight}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, weight: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Etnia / Origen</label>
                    <select
                      value={editDetails.ethnicity}
                      onChange={(e) =>
                        setEditDetails({ ...editDetails, ethnicity: e.target.value })
                      }
                    >
                      <option value="Hispano / Latino">Hispano / Latino</option>
                      <option value="Caucásico / Blanco">Caucásico / Blanco</option>
                      <option value="Afrodescendiente">Afrodescendiente</option>
                      <option value="Mestizo">Mestizo</option>
                      <option value="Indígena">Indígena</option>
                      <option value="Asiático">Asiático</option>
                      <option value="Otro">Otro / Prefiero no decir</option>
                    </select>
                  </div>

                  {/* GRUPO 3: ESTILO DE VIDA, HÁBITOS & VALORES */}
                  <div className="edit-block-header">
                    <h4>🥗 Hábitos, Estilo de Vida & Familia</h4>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>¿Fuma?</label>
                      <select
                        value={editDetails.smokes}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, smokes: e.target.value })
                        }
                      >
                        <option value="No">No / Nunca (Estilo adventista)</option>
                        <option value="Dejé de fumar">Dejé de fumar</option>
                        <option value="Rara vez">Rara vez</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>¿Bebe alcohol?</label>
                      <select
                        value={editDetails.drinks}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, drinks: e.target.value })
                        }
                      >
                        <option value="No">No / Abstemio total (Estilo adventista)</option>
                        <option value="No consumo">No consumo alcohol</option>
                        <option value="Ocasionalmente">Ocasionalmente</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Alimentación / Dieta</label>
                      <select
                        value={editDetails.diet}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, diet: e.target.value })
                        }
                      >
                        <option value="Vegetariana">Vegetariana</option>
                        <option value="Vegana">Vegana</option>
                        <option value="Ovolactovegetariana">Ovolactovegetariana</option>
                        <option value="Bíblica limpia (Levítico 11)">Bíblica limpia (Levítico 11)</option>
                        <option value="Sin restricciones">Sin restricciones</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Estado Civil</label>
                      <select
                        value={editDetails.marital_status}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, marital_status: e.target.value })
                        }
                      >
                        <option value="Soltero/a">Soltero/a (nunca casado/a)</option>
                        <option value="Divorciado/a">Divorciado/a</option>
                        <option value="Viudo/a">Viudo/a</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Hijos</label>
                      <select
                        value={editDetails.has_children}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, has_children: e.target.value })
                        }
                      >
                        <option value="No">No tengo hijos</option>
                        <option value="Sí, viven conmigo">Sí, viven conmigo</option>
                        <option value="Sí, independientes">Sí, independientes</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Deseo de tener hijos</label>
                      <select
                        value={editDetails.wants_children}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, wants_children: e.target.value })
                        }
                      >
                        <option value="Sí">Sí, deseo formar familia</option>
                        <option value="No">No deseo tener hijos</option>
                        <option value="Abierto/a">Abierto/a a la idea</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Profesión / Ocupación</label>
                      <input
                        type="text"
                        placeholder="Ej: Docente, Ingeniero/a, Enfermero/a..."
                        value={editDetails.occupation}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, occupation: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Nivel de Educación</label>
                      <select
                        value={editDetails.education}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, education: e.target.value })
                        }
                      >
                        <option value="Universitario">Grado Universitario</option>
                        <option value="Postgrado / Máster">Postgrado / Máster</option>
                        <option value="Técnico / Superior">Formación Técnica</option>
                        <option value="Bachillerato">Bachillerato / Secundaria</option>
                        <option value="Estudiante">Estudiante</option>
                      </select>
                    </div>
                  </div>

                  <div className="details-save-actions">
                    <button
                      type="button"
                      className="primary-btn submit-btn"
                      disabled={isSavingDetails}
                      onClick={handleSaveDetails}
                    >
                      {isSavingDetails ? 'Guardando...' : '💾 Guardar Todos los Datos'}
                    </button>
                  </div>
                </div>
              ) : (
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
                  <div className="info-box">
                    <span className="box-label">📏 Estatura</span>
                    <strong>{user?.profile?.height || editDetails.height || 'No indicada'}</strong>
                  </div>
                  <div className="info-box">
                    <span className="box-label">⚖️ Peso / Complexión</span>
                    <strong>{user?.profile?.weight || editDetails.weight || 'No indicado'}</strong>
                  </div>
                  <div className="info-box">
                    <span className="box-label">🧬 Etnia</span>
                    <strong>{user?.profile?.ethnicity || editDetails.ethnicity || 'No indicada'}</strong>
                  </div>
                  <div className="info-box">
                    <span className="box-label">🥗 Alimentación</span>
                    <strong>{user?.profile?.diet || editDetails.diet || 'Vegetariana'}</strong>
                  </div>
                  <div className="info-box">
                    <span className="box-label">🚭 ¿Fuma?</span>
                    <strong>{user?.profile?.smokes || editDetails.smokes || 'No'}</strong>
                  </div>
                  <div className="info-box">
                    <span className="box-label">🍷 ¿Bebe alcohol?</span>
                    <strong>{user?.profile?.drinks || editDetails.drinks || 'No'}</strong>
                  </div>
                  <div className="info-box">
                    <span className="box-label">💍 Estado civil</span>
                    <strong>{user?.profile?.marital_status || editDetails.marital_status || 'Soltero/a'}</strong>
                  </div>
                  <div className="info-box">
                    <span className="box-label">👶 Hijos</span>
                    <strong>{user?.profile?.has_children || editDetails.has_children || 'No'}</strong>
                  </div>
                  <div className="info-box">
                    <span className="box-label">💼 Ocupación</span>
                    <strong>{user?.profile?.occupation || editDetails.occupation || 'No indicada'}</strong>
                  </div>
                  <div className="info-box">
                    <span className="box-label">💧 Bautismo</span>
                    <strong>{user?.profile?.baptized || editDetails.baptized || 'Sí'}</strong>
                  </div>
                </div>
              )}
            </section>

            <section className="profile-section">
              <div className="section-title-row">
                <div className="section-title">
                  <h3>Tu Biografía & Propósito</h3>
                  <p>Cuéntale a la comunidad quién eres, tu fe y tus anhelos.</p>
                </div>
                <div className="section-title-actions">
                  <button
                    type="button"
                    className="ai-badge-btn"
                    onClick={() => setShowAiModalInDashboard(true)}
                    title="Usar Asistente IA para redactar tu biografía"
                  >
                    ✨ Redactar con IA
                  </button>
                  {!isEditingBio ? (
                    <button
                      type="button"
                      className="edit-toggle-btn"
                      onClick={() => setIsEditingBio(true)}
                    >
                      ✏️ Editar Biografía
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="cancel-toggle-btn"
                      onClick={() => {
                        setBioText(user?.profile?.bio || '');
                        setIsEditingBio(false);
                      }}
                    >
                      ✕ Cancelar
                    </button>
                  )}
                </div>
              </div>

              {bioSavedMessage && (
                <div className="profile-toast-success">
                  {bioSavedMessage}
                </div>
              )}

              {isEditingBio ? (
                <div className="bio-editor-card">
                  <div className="bio-inspiration-wrap">
                    <span className="inspiration-label">💡 Ideas con propósito (haz clic para añadir a tu texto):</span>
                    <div className="bio-inspiration-tags">
                      {BIO_INSPIRATION_IDEAS.map((idea) => (
                        <button
                          key={idea}
                          type="button"
                          className="bio-tag-chip"
                          onClick={() => {
                            setBioText((prev) => {
                              const clean = (prev || '').trim();
                              if (!clean) return idea;
                              if (clean.includes(idea)) return prev;
                              return `${clean}. ${idea}`;
                            });
                          }}
                        >
                          + {idea}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    className="bio-textarea-input"
                    rows="5"
                    maxLength={500}
                    placeholder="Escribe aquí tu biografía: cómo vives tu fe adventista, tus metas espirituales y personales, tus pasatiempos y lo que esperas construir en una relación..."
                    value={bioText}
                    onChange={(e) => setBioText(e.target.value)}
                    autoFocus
                  />

                  <div className="bio-editor-footer">
                    <span className="char-count-text">
                      {bioText.length}/500 caracteres
                    </span>
                    <div className="bio-footer-buttons">
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={() => {
                          setBioText(user?.profile?.bio || '');
                          setIsEditingBio(false);
                        }}
                      >
                        Descartar
                      </button>
                      <button
                        type="button"
                        className="primary-btn bio-save-btn"
                        disabled={isSavingBio}
                        onClick={handleSaveBio}
                      >
                        {isSavingBio ? 'Guardando...' : '💾 Guardar Biografía'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bio-display-card" onClick={() => setIsEditingBio(true)}>
                  <p className="profile-bio-text clickable">
                    {bioText || user?.profile?.bio || (
                      <span className="bio-empty-placeholder">
                        📝 Haz clic aquí para escribir y llenar tu biografía con propósito...
                      </span>
                    )}
                  </p>
                  <div className="bio-click-hint">
                    <span>✏️ Toca aquí para editar o agregar ideas</span>
                  </div>
                </div>
              )}
            </section>

            {/* SECCIÓN DESTACADA CERRAR SESIÓN */}
            <section className="profile-section profile-logout-card">
              <div className="logout-card-content">
                <div className="logout-card-user-info">
                  <span className="logout-status-dot"></span>
                  <div>
                    <h4>Sesión Iniciada</h4>
                    <span className="logout-user-email">Conectado como <strong>{user?.email}</strong></span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="profile-large-logout-btn"
                  title="Cerrar sesión en este dispositivo"
                >
                  <span className="btn-icon">🚪</span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </section>
          </div>
        </main>
      )}

      {/* MODAL ASISTENTE IA DENTRO DE MI PERFIL */}
      {showAiModalInDashboard && (
        <div className="modal-backdrop" onClick={() => setShowAiModalInDashboard(false)}>
          <div className="modal-card modal-card-large" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setShowAiModalInDashboard(false)}
              aria-label="Cerrar modal"
            >
              ✕
            </button>
            <AiProfileAssistant
              onProfileGenerated={handleAiProfileGeneratedInDashboard}
              onCancel={() => setShowAiModalInDashboard(false)}
            />
          </div>
        </div>
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
