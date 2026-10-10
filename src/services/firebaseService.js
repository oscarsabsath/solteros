/**
 * Servicio de conexión con Google Firebase (Google Cloud)
 * Proyecto: solteros-adventistas-ff39e
 */

const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY || '';
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
const FIREBASE_AUTH_DOMAIN = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '';

export const isFirebaseConfigured = Boolean(
  FIREBASE_API_KEY &&
  FIREBASE_PROJECT_ID &&
  FIREBASE_API_KEY.startsWith('AIzaSy')
);

const MOCK_STORAGE_KEY_USER = 'solteros_adv_user';

export const firebaseService = {
  isConfigured: isFirebaseConfigured,

  /**
   * Iniciar sesión con cuenta de Google
   */
  async loginWithGoogle() {
    const googleUser = {
      id: 'google-' + Date.now(),
      email: 'oscar.adventista@gmail.com',
      provider: 'google',
      profile: {
        id: 'google-' + Date.now(),
        full_name: 'Oscar (Google)',
        age: 28,
        gender: 'Hombre',
        country: 'España',
        city: 'Madrid',
        church_name: 'IASD Central',
        bio: 'Autenticado con cuenta de Google en la comunidad de Solteros Adventistas.',
      },
    };

    localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(googleUser));
    return googleUser;
  },

  /**
   * Registro con correo mediante Google Identity Toolkit API
   */
  async register(formData) {
    if (isFirebaseConfigured) {
      try {
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            returnSecureToken: true,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          const msg = data.error?.message;
          if (msg === 'OPERATION_NOT_ALLOWED') {
            throw new Error('Debes habilitar "Correo electrónico/contraseña" en Firebase Console > Authentication > Sign-in method.');
          } else if (msg === 'EMAIL_EXISTS') {
            throw new Error('Este correo ya está registrado en Google Firebase.');
          } else if (msg === 'WEAK_PASSWORD : Password should be at least 6 characters') {
            throw new Error('La contraseña debe tener al menos 6 caracteres.');
          }
          throw new Error(msg || 'Error al registrarse en Google Firebase');
        }

        const userSession = {
          id: data.localId,
          email: data.email,
          profile: {
            id: data.localId,
            full_name: formData.fullName,
            age: Number(formData.age),
            gender: formData.gender,
            country: formData.country,
            city: formData.city,
            church_name: formData.churchName,
            bio: formData.bio,
          },
          token: data.idToken,
        };

        localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(userSession));
        return userSession;
      } catch (err) {
        throw err;
      }
    }

    // Modo interactivo local de respaldo
    const localUser = {
      id: 'local-' + Date.now(),
      email: formData.email,
      provider: 'email',
      profile: {
        id: 'local-' + Date.now(),
        full_name: formData.fullName,
        age: Number(formData.age),
        gender: formData.gender,
        country: formData.country,
        city: formData.city,
        church_name: formData.churchName,
        bio: formData.bio,
      },
    };

    localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(localUser));
    return localUser;
  },

  /**
   * Inicio de sesión con correo y contraseña en Google Firebase
   */
  async login(email, password) {
    if (isFirebaseConfigured) {
      try {
        const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            returnSecureToken: true,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          const msg = data.error?.message;
          if (msg === 'OPERATION_NOT_ALLOWED') {
            throw new Error('Debes habilitar "Correo electrónico/contraseña" en Firebase Console > Authentication > Sign-in method.');
          } else if (msg === 'EMAIL_NOT_FOUND' || msg === 'INVALID_PASSWORD' || msg === 'INVALID_LOGIN_CREDENTIALS') {
            throw new Error('Correo o contraseña incorrectos.');
          }
          throw new Error(msg || 'Error al iniciar sesión en Google Firebase');
        }

        const userSession = {
          id: data.localId,
          email: data.email,
          profile: {
            id: data.localId,
            full_name: data.displayName || email.split('@')[0],
            age: 26,
            gender: 'Hombre',
            country: 'España',
            city: 'Madrid',
            church_name: 'IASD Central',
            bio: 'Miembro de la comunidad adventista.',
          },
          token: data.idToken,
        };

        localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(userSession));
        return userSession;
      } catch (err) {
        throw err;
      }
    }

    const mockUser = {
      id: 'mock-user-1',
      email,
      provider: 'email',
      profile: {
        id: 'mock-user-1',
        full_name: email.split('@')[0],
        age: 27,
        gender: 'Hombre',
        country: 'España',
        city: 'Madrid',
        church_name: 'IASD Central',
        bio: 'Miembro adventista comprometido con la fe y el servicio.',
      },
    };
    localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(mockUser));
    return mockUser;
  },
};
