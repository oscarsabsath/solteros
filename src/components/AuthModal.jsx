import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialTab = 'register' }) {
  const [tab, setTab] = useState(initialTab);
  const { login, register, loginWithGoogle, isConfigured } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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
  });

  if (!isOpen) return null;

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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (Number(registerData.age) < 18) {
      setError('Debes ser mayor de 18 años para unirte a la plataforma.');
      return;
    }

    setLoading(true);
    try {
      await register(registerData);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al registrar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
          ✕
        </button>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setTab('register');
              setError('');
            }}
          >
            Crear Cuenta
          </button>
          <button
            className={`modal-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setTab('login');
              setError('');
            }}
          >
            Iniciar Sesión
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        {!isConfigured && (
          <div className="modal-info-badge">
            ℹ️ Modo interactivo (Para conectar con tu base de datos de Google Firebase o Supabase, agrega tus claves en .env)
          </div>
        )}

        {/* BOTÓN OFICIAL DE GOOGLE */}
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

        {tab === 'login' ? (
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
        ) : (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre y apellido"
                  value={registerData.fullName}
                  onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
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
                  onChange={(e) => setRegisterData({ ...registerData, age: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Género</label>
                <select
                  value={registerData.gender}
                  onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
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
                  placeholder="España, México, etc."
                  value={registerData.country}
                  onChange={(e) => setRegisterData({ ...registerData, country: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ciudad</label>
                <input
                  type="text"
                  required
                  placeholder="Madrid, Bogotá, etc."
                  value={registerData.city}
                  onChange={(e) => setRegisterData({ ...registerData, city: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Iglesia Adventista</label>
                <input
                  type="text"
                  placeholder="Ej: IASD Alenza, IASD Central..."
                  value={registerData.churchName}
                  onChange={(e) => setRegisterData({ ...registerData, churchName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="tu-correo@ejemplo.com"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
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
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Tu Biografía o Propósito</label>
              <textarea
                rows="3"
                placeholder="Cuéntanos sobre tu relación con Dios, tus ministerios o lo que esperas construir..."
                value={registerData.bio}
                onChange={(e) => setRegisterData({ ...registerData, bio: e.target.value })}
              />
            </div>

            <button type="submit" className="primary-btn submit-btn" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear mi cuenta con propósito'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
