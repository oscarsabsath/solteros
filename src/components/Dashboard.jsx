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
  });
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [detailsSavedMessage, setDetailsSavedMessage] = useState('');

  // AI Assistant modal state in Dashboard
  const [showAiModalInDashboard, setShowAiModalInDashboard] = useState(false);

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
        });
      }
      setDetailsSavedMessage('¡Datos actualizados con éxito!');
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
              <div className="section-title-row">
                <div className="section-title">
                  <h3>Tus Datos & Congregación</h3>
                  <p>Información visible para los miembros de la comunidad.</p>
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
                        value={editDetails.country}
                        onChange={(e) =>
                          setEditDetails({ ...editDetails, country: e.target.value })
                        }
                      />
                    </div>
                  </div>

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

                  <div className="details-save-actions">
                    <button
                      type="button"
                      className="primary-btn submit-btn"
                      disabled={isSavingDetails}
                      onClick={handleSaveDetails}
                    >
                      {isSavingDetails ? 'Guardando...' : '💾 Guardar Datos'}
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
