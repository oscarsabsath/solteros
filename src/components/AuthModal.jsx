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
  const { login, register, loginWithGoogle } = useAuth();

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

  const handleGoogleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message || 'Error al conectar con Google');
    } finally {
      setLoading(false);
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
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (photos.length === 0) {
        setError('Por favor añade al menos 1 foto para tu perfil antes de continuar.');
        return;
      }
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
      await register({
        ...registerData,
        photos: photos,
        avatar_url: photos[0] || '',
      });
      onClose();
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
    setStep(1); // Directo a subir fotos
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
            className={`modal-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setTab('register');
              setUseAiAssistant(false);
              setError('');
            }}
          >
            Crear Perfil
          </button>
          <button
            className={`modal-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setTab('login');
              setUseAiAssistant(false);
              setError('');
            }}
          >
            Iniciar Sesión
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        {/* VISTA 1: INICIAR SESIÓN */}
        {tab === 'login' ? (
          <div>
            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleSubmit}
              disabled={loading}
            >
              <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continuar con Google
            </button>

            <div className="auth-separator">
              <span>o con tu correo</span>
            </div>

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

            {/* BARRA DE PROGRESO */}
            <div className="wizard-progress-header">
              <div className="wizard-step-info">
                <span>Paso {step} de 3</span>
                <strong>
                  {step === 1 && 'Tus Mejores Fotos'}
                  {step === 2 && 'Quién eres & Tu Fe'}
                  {step === 3 && 'Intereses & Tu Propósito'}
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

                <div className="form-group">
                  <label>Tu Biografía o Propósito:</label>
                  <textarea
                    rows="3"
                    placeholder="Cuéntanos cómo vives tu fe, tus metas de vida o lo que esperas construir en una relación..."
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
