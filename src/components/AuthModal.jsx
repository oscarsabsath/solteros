import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PhotoUploader from './PhotoUploader';
import AiProfileAssistant from './AiProfileAssistant';

const ADVENTIST_INTERESTS_LIST = [
  'Club de Conquistadores',
  'Música Sacra / Canto',
  'Vida Saludable & Nutrición',
  'Misiones & Voluntariado',
  'Senderismo en la Naturaleza',
  'Estudio Bíblico Profundo',
  'Cocina Vegetariana / Vegana',
  'Lectura & Crecimiento',
  'Educación Adventista',
  'Familia & Proyectos de Vida',
  'Deporte & Aire Libre',
  'Medios & Comunicaciones',
];

export default function AuthModal({ isOpen, onClose, initialTab = 'register' }) {
  const [tab, setTab] = useState(initialTab);
  const [step, setStep] = useState(1); // 1: Fotos, 2: Datos & Fe, 3: Intereses & Cuenta
  const [useAiAssistant, setUseAiAssistant] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [resendStatus, setResendStatus] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const { login, register, resendVerificationEmail, checkEmailVerification, setVerifiedSession } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form states - Register (Onboarding estilo Badoo)
  const [photos, setPhotos] = useState([]);
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    age: '24',
    gender: 'Mujer',
    country: 'España',
    city: 'Madrid',
    churchName: '',
    bio: '',
    interests: ['Música Sacra / Canto', 'Vida Saludable & Nutrición'],
    height: '1.70 m',
    weight: 'Media',
    ethnicity: 'Hispano / Latino',
    smokes: 'No',
    drinks: 'No',
    diet: 'Vegetariana',
    marital_status: 'Soltero/a',
  });

  if (!isOpen) return null;

  const toggleInterest = (interest) => {
    const current = registerData.interests || [];
    if (current.includes(interest)) {
      setRegisterData({
        ...registerData,
        interests: current.filter((i) => i !== interest),
      });
    } else {
      if (current.length >= 6) {
        setError('Puedes seleccionar hasta un máximo de 6 intereses.');
        return;
      }
      setError('');
      setRegisterData({
        ...registerData,
        interests: [...current, interest],
      });
    }
  };

  const handleResendEmail = async () => {
    if (!pendingUser?.token) {
      setResendStatus('Inicia sesión de nuevo para generar un nuevo enlace.');
      return;
    }
    try {
      setResendStatus('Enviando correo de verificación...');
      await resendVerificationEmail(pendingUser.token);
      setResendStatus('¡Correo de verificación reenviado con éxito! Revisa tu bandeja de entrada o spam.');
    } catch (err) {
      setResendStatus('Error al enviar: ' + (err.message || 'Verifica tu conexión'));
    }
  };

  const handleCheckVerification = async () => {
    if (!pendingUser?.token) return;
    setCheckingStatus(true);
    setError('');
    try {
      const isVerified = await checkEmailVerification(pendingUser.token);
      if (isVerified) {
        setVerifiedSession({
          id: pendingUser.id,
          email: pendingUser.email,
          profile: pendingUser.profile,
          token: pendingUser.token,
          emailVerified: true,
        });
        onClose();
      } else {
        setError('Aún no hemos detectado la verificación. Haz clic en el enlace que enviamos a tu correo y vuelve a pulsar aquí.');
      }
    } catch (err) {
      setError(err.message || 'Error al comprobar verificación');
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleBypassForDev = () => {
    if (pendingUser) {
      setVerifiedSession({
        id: pendingUser.id || 'dev-' + Date.now(),
        email: pendingUser.email,
        profile: pendingUser.profile || {
          full_name: pendingUser.email.split('@')[0],
          age: 25,
          gender: 'Hombre',
          country: 'España',
          city: 'Madrid',
          church_name: 'IASD Central',
          bio: 'Perfil activo verificado.',
          photos: photos,
        },
        token: pendingUser.token || 'dev-token',
        emailVerified: true,
      });
      onClose();
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      onClose();
    } catch (err) {
      if (err.message === 'EMAIL_NOT_VERIFIED' || err.name === 'EMAIL_NOT_VERIFIED') {
        setPendingUser({
          email: err.email || loginEmail,
          token: err.idToken,
        });
        setVerificationPending(true);
        setError('');
      } else {
        setError(err.message || 'Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!registerData.fullName.trim()) {
        setError('Por favor indica tu nombre completo.');
        return;
      }
      if (Number(registerData.age) < 18) {
        setError('Debes ser mayor de 18 años para unirte.');
        return;
      }
      if (!registerData.city.trim() || !registerData.country.trim()) {
        setError('Por favor indica tu ciudad y país.');
        return;
      }
      setStep(3);
    }
  };

  const handleFinalRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!registerData.email || !registerData.password) {
      setError('Por favor completa tu correo y contraseña.');
      return;
    }

    if (registerData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        ...registerData,
        photos: photos,
        avatar_url: photos[0] || '',
      });
      if (res?.requiresVerification) {
        setPendingUser(res);
        setVerificationPending(true);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Error al registrar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleAiProfileGenerated = (generated) => {
    setRegisterData((prev) => ({
      ...prev,
      fullName: generated.fullName,
      age: String(generated.age),
      city: generated.city,
      country: generated.country,
      churchName: generated.churchName,
      bio: generated.bio,
      interests: generated.interests,
    }));
    setUseAiAssistant(false);
    setStep(3); // Directo al Paso 3 para revisar y editar la biografía generada
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card modal-card-large" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
          ✕
        </button>

        {/* PESTAÑAS PRINCIPALES */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${tab === 'register' && !verificationPending ? 'active' : ''}`}
            onClick={() => {
              setTab('register');
              setVerificationPending(false);
              setUseAiAssistant(false);
              setError('');
            }}
          >
            Crear Perfil
          </button>
          <button
            className={`modal-tab ${tab === 'login' && !verificationPending ? 'active' : ''}`}
            onClick={() => {
              setTab('login');
              setVerificationPending(false);
              setUseAiAssistant(false);
              setError('');
            }}
          >
            Iniciar Sesión
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        {/* VISTA VERIFICACIÓN DE CORREO PENDIENTE */}
        {verificationPending ? (
          <div className="verification-pending-card">
            <div className="verification-icon-badge">✉️</div>
            <h3>Verifica tu Correo Electrónico</h3>
            <p className="verification-subtitle">
              Hemos enviado un enlace de confirmación a:
            </p>
            <div className="verification-email-badge">
              <strong>{pendingUser?.email}</strong>
            </div>
            <p className="verification-instructions">
              Para resguardar la seriedad, seguridad y fe de nuestra comunidad adventista,
              debes confirmar tu dirección de correo antes de acceder.
            </p>

            {resendStatus && <div className="verification-status-msg">{resendStatus}</div>}

            <div className="verification-actions">
              <button
                type="button"
                className="primary-btn submit-btn"
                onClick={handleCheckVerification}
                disabled={checkingStatus}
              >
                {checkingStatus ? 'Comprobando estado...' : '✓ Ya verifiqué mi correo (Acceder)'}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={handleResendEmail}
              >
                🔄 Reenviar enlace de verificación
              </button>

              <button
                type="button"
                className="text-link-btn"
                onClick={() => {
                  setVerificationPending(false);
                  setPendingUser(null);
                  setTab('login');
                }}
              >
                ← Volver al formulario de acceso
              </button>

              <div className="dev-bypass-container">
                <button
                  type="button"
                  className="dev-bypass-btn"
                  onClick={handleBypassForDev}
                >
                  ⚡ Activar en modo prueba / omitir verificación
                </button>
              </div>
            </div>
          </div>
        ) : tab === 'login' ? (
          /* VISTA INICIAR SESIÓN (EXCLUSIVO CORREO Y CONTRASEÑA) */
          <div>
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@adventista.org"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="primary-btn submit-btn" disabled={loading}>
                {loading ? 'Accediendo...' : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
        ) : useAiAssistant ? (
          /* VISTA ASISTENTE CONVERSACIONAL DE IA */
          <AiProfileAssistant
            onProfileGenerated={handleAiProfileGenerated}
            onCancel={() => setUseAiAssistant(false)}
          />
        ) : (
          /* VISTA 2: CREACIÓN DE PERFIL MULTI-PASO CON ACCESO A IA */
          <div className="onboarding-wizard">
            {/* BANNER PARA ACTIVAR ASISTENTE DE IA */}
            <div
              className="ai-launcher-banner"
              onClick={() => setUseAiAssistant(true)}
              role="button"
              tabIndex={0}
            >
              <div className="ai-launcher-icon">✨</div>
              <div className="ai-launcher-text">
                <strong>¿Prefieres crear tu perfil conversando?</strong>
                <span>El Asistente IA te hace 4 preguntas y redacta tu biografía en 1 min.</span>
              </div>
              <button type="button" className="ai-launcher-btn">
                Probar IA ➔
              </button>
            </div>

            {/* BARRA DE PROGRESO Y TABS NAVEGABLES */}
            <div className="wizard-step-tabs-bar">
              <button
                type="button"
                className={`wizard-step-tab ${step === 1 ? 'active' : ''}`}
                onClick={() => setStep(1)}
              >
                1. Fotos {photos.length > 0 ? `(${photos.length})` : ''}
              </button>
              <button
                type="button"
                className={`wizard-step-tab ${step === 2 ? 'active' : ''}`}
                onClick={() => setStep(2)}
              >
                2. Quién eres & Fe
              </button>
              <button
                type="button"
                className={`wizard-step-tab ${step === 3 ? 'active' : ''}`}
                onClick={() => setStep(3)}
              >
                3. Biografía & Cuenta {registerData.bio ? '✓' : ''}
              </button>
            </div>

            <div className="wizard-progress-header">
              <div className="wizard-step-info">
                <span>Paso {step} de 3</span>
                <strong>
                  {step === 1 && 'Tus Mejores Fotos'}
                  {step === 2 && 'Quién eres & Tu Fe'}
                  {step === 3 && 'Intereses, Biografía & Cuenta'}
                </strong>
              </div>
              <div className="wizard-progress-track">
                <div
                  className="wizard-progress-bar"
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* PASO 1: FOTOS ESTILO BADOO */}
            {step === 1 && (
              <div className="wizard-step-content">
                <PhotoUploader
                  photos={photos}
                  onPhotosChange={setPhotos}
                  maxPhotos={6}
                />

                <div className="wizard-actions">
                  <button
                    type="button"
                    className="primary-btn wizard-next-btn"
                    onClick={handleNextStep}
                  >
                    Continuar a mis datos →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2: DATOS BÁSICOS Y FE ADVENTISTA */}
            {step === 2 && (
              <div className="wizard-step-content">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Daniel Castillo"
                      value={registerData.fullName}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, fullName: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Edad</label>
                    <input
                      type="number"
                      min="18"
                      max="99"
                      required
                      value={registerData.age}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, age: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Género</label>
                    <select
                      value={registerData.gender}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, gender: e.target.value })
                      }
                    >
                      <option value="Mujer">Mujer</option>
                      <option value="Hombre">Hombre</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>País</label>
                    <input
                      type="text"
                      required
                      placeholder="España, Colombia, México..."
                      value={registerData.country}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, country: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Ciudad</label>
                    <input
                      type="text"
                      required
                      placeholder="Madrid, Medellín..."
                      value={registerData.city}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, city: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Iglesia Adventista</label>
                    <input
                      type="text"
                      placeholder="Ej: IASD Alenza, IASD Central..."
                      value={registerData.churchName}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, churchName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Estatura</label>
                    <input
                      type="text"
                      placeholder="Ej: 1.70 m"
                      value={registerData.height}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, height: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Etnia / Origen</label>
                    <select
                      value={registerData.ethnicity}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, ethnicity: e.target.value })
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
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Alimentación / Dieta</label>
                    <select
                      value={registerData.diet}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, diet: e.target.value })
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
                    <label>¿Fuma o Bebe alcohol?</label>
                    <select
                      value={registerData.smokes === 'No' && registerData.drinks === 'No' ? 'No' : 'Otro'}
                      onChange={(e) => {
                        if (e.target.value === 'No') {
                          setRegisterData({ ...registerData, smokes: 'No', drinks: 'No' });
                        } else {
                          setRegisterData({ ...registerData, smokes: 'Rara vez', drinks: 'Ocasionalmente' });
                        }
                      }}
                    >
                      <option value="No">No fumo ni bebo (Abstemio/a)</option>
                      <option value="Otro">Otro estilo</option>
                    </select>
                  </div>
                </div>

                <div className="wizard-actions">
                  <button
                    type="button"
                    className="secondary-btn wizard-back-btn"
                    onClick={() => setStep(1)}
                  >
                    ← Volver a fotos
                  </button>
                  <button
                    type="button"
                    className="primary-btn wizard-next-btn"
                    onClick={handleNextStep}
                  >
                    Continuar a intereses →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: INTERESES CHIPS Y CUENTA */}
            {step === 3 && (
              <form onSubmit={handleFinalRegister} className="wizard-step-content">
                <div className="form-group">
                  <label>Tus Intereses & Estilo de Vida Adventista (elige hasta 6):</label>
                  <div className="badoo-chips-cloud">
                    {ADVENTIST_INTERESTS_LIST.map((tag) => {
                      const isSelected = registerData.interests?.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          className={`badoo-chip ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleInterest(tag)}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group bio-wizard-group">
                  <div className="bio-label-header">
                    <label>Tu Biografía o Propósito:</label>
                    <span className="char-count-pill">
                      {(registerData.bio || '').length}/500 caracteres
                    </span>
                  </div>

                  <div className="bio-ideas-row">
                    <span className="bio-ideas-label">💡 Ideas con propósito (toca para añadir):</span>
                    <div className="bio-ideas-tags">
                      {[
                        'Música sacra 🎵',
                        'Conquistadores ⛺',
                        'Estudio bíblico 📖',
                        'Vida saludable 🥗',
                        'Misiones 🌍',
                        'Hogar cristiano 🏡',
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className="bio-quick-tag"
                          onClick={() => {
                            setRegisterData((prev) => {
                              const curr = (prev.bio || '').trim();
                              if (!curr) return { ...prev, bio: tag };
                              if (curr.includes(tag)) return prev;
                              return { ...prev, bio: `${curr}. ${tag}` };
                            });
                          }}
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows="4"
                    maxLength={500}
                    placeholder="Cuéntanos cómo vives tu fe adventista, tus metas de vida o lo que esperas construir en una relación con propósito..."
                    value={registerData.bio}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, bio: e.target.value })
                    }
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Correo Electrónico</label>
                    <input
                      type="email"
                      required
                      placeholder="tu-correo@adventista.org"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, email: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Contraseña</label>
                    <input
                      type="password"
                      required
                      minLength="6"
                      placeholder="Mínimo 6 caracteres"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, password: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="wizard-actions">
                  <button
                    type="button"
                    className="secondary-btn wizard-back-btn"
                    onClick={() => setStep(2)}
                  >
                    ← Volver
                  </button>
                  <button
                    type="submit"
                    className="primary-btn wizard-next-btn"
                    disabled={loading}
                  >
                    {loading ? 'Creando perfil...' : '¡Completar Perfil con Propósito!'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
