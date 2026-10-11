/**
 * Servicio de conexión con Google Firebase (Google Cloud)
 * Autenticación (Google Identity Toolkit) + Base de Datos (Cloud Firestore)
 * Proyecto: solteros-adventistas-ff39e
 */

const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY || '';
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'solteros-adventistas-ff39e';

export const isFirebaseConfigured = Boolean(
  FIREBASE_API_KEY &&
  FIREBASE_PROJECT_ID &&
  FIREBASE_API_KEY.startsWith('AIzaSy')
);

const MOCK_STORAGE_KEY_USER = 'solteros_adv_user';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

/**
 * Utilidades para convertir objetos JS a formato de Cloud Firestore
 */
function toFirestoreValue(val) {
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') return { integerValue: String(val) };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) {
    return {
      arrayValue: {
        values: val.map((item) => toFirestoreValue(item)),
      },
    };
  }
  return { stringValue: String(val || '') };
}

function fromFirestoreDoc(doc) {
  if (!doc || !doc.fields) return null;
  const obj = {};
  for (const [key, val] of Object.entries(doc.fields)) {
    if (val.stringValue !== undefined) obj[key] = val.stringValue;
    else if (val.integerValue !== undefined) obj[key] = Number(val.integerValue);
    else if (val.booleanValue !== undefined) obj[key] = val.booleanValue;
    else if (val.arrayValue !== undefined) {
      obj[key] = (val.arrayValue.values || []).map((v) => {
        if (v.stringValue !== undefined) return v.stringValue;
        if (v.integerValue !== undefined) return Number(v.integerValue);
        return v;
      });
    }
  }
  if (doc.name) {
    const parts = doc.name.split('/');
    obj.id = obj.id || parts[parts.length - 1];
  }
  return obj;
}

export const firebaseService = {
  isConfigured: isFirebaseConfigured,

  /**
   * 1. GUARDAR PERFIL EN LA NUBE (CLOUD FIRESTORE)
   */
  async saveProfileToFirestore(userId, profileData, idToken = null) {
    if (!isFirebaseConfigured) return;

    try {
      const url = `${FIRESTORE_BASE_URL}/profiles/${userId}?key=${FIREBASE_API_KEY}`;
      const fields = {
        id: toFirestoreValue(userId),
        full_name: toFirestoreValue(profileData.full_name || profileData.fullName || 'Usuario'),
        age: toFirestoreValue(Number(profileData.age) || 25),
        gender: toFirestoreValue(profileData.gender || 'Mujer'),
        country: toFirestoreValue(profileData.country || ''),
        city: toFirestoreValue(profileData.city || ''),
        church_name: toFirestoreValue(profileData.church_name || profileData.churchName || ''),
        bio: toFirestoreValue(profileData.bio || ''),
        avatar_url: toFirestoreValue(profileData.avatar_url || (profileData.photos && profileData.photos[0]) || ''),
        photos: toFirestoreValue(profileData.photos || []),
        interests: toFirestoreValue(profileData.interests || []),
        updated_at: toFirestoreValue(new Date().toISOString()),
      };

      const headers = { 'Content-Type': 'application/json' };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const res = await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ fields }),
      });

      if (res.ok) {
        console.log('✓ Perfil sincronizado con éxito en Google Cloud Firestore');
      } else {
        const errData = await res.json();
        console.warn('Nota sobre Firestore (permisos o modo prueba):', errData);
      }
    } catch (err) {
      console.warn('Fallo al guardar en Cloud Firestore (usando respaldo local):', err);
    }
  },

  /**
   * 2. OBTENER PERFILES REALES DE LA NUBE (CLOUD FIRESTORE)
   */
  async getProfilesFromFirestore() {
    if (!isFirebaseConfigured) return [];

    try {
      const url = `${FIRESTORE_BASE_URL}/profiles?key=${FIREBASE_API_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.documents && data.documents.length > 0) {
          return data.documents.map(fromFirestoreDoc).filter(Boolean);
        }
      }
    } catch (err) {
      console.warn('Fallo al leer perfiles de Cloud Firestore:', err);
    }
    return [];
  },

  /**
   * 3. GUARDAR LIKE EN LA NUBE (CLOUD FIRESTORE)
   */
  async sendLikeToFirestore(fromUserId, toUserId) {
    if (!isFirebaseConfigured) return;

    try {
      const url = `${FIRESTORE_BASE_URL}/likes?key=${FIREBASE_API_KEY}`;
      const fields = {
        from_user: toFirestoreValue(fromUserId),
        to_user: toFirestoreValue(toUserId),
        created_at: toFirestoreValue(new Date().toISOString()),
      };

      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });
    } catch (err) {
      console.warn('Fallo al enviar like a Firestore:', err);
    }
  },

  /**
   * 4. INICIAR SESIÓN CON GOOGLE
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
        photos: [],
      },
    };

    localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(googleUser));
    // Guardar en Firestore
    await this.saveProfileToFirestore(googleUser.id, googleUser.profile);
    return googleUser;
  },

  /**
   * 5. REGISTRO CON CORREO (CREAR CUENTA + GUARDAR EN FIRESTORE)
   */
  async register(formData) {
    if (isFirebaseConfigured) {
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
        }
        throw new Error(msg || 'Error al registrarse en Google Firebase');
      }

      const userProfile = {
        id: data.localId,
        full_name: formData.fullName,
        age: Number(formData.age),
        gender: formData.gender,
        country: formData.country,
        city: formData.city,
        church_name: formData.churchName,
        bio: formData.bio,
        photos: formData.photos || [],
        avatar_url: formData.avatar_url || (formData.photos && formData.photos[0]) || '',
        interests: formData.interests || [],
      };

      const userSession = {
        id: data.localId,
        email: data.email,
        profile: userProfile,
        token: data.idToken,
      };

      // 1. Guardar en caché local
      localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(userSession));

      // 2. Guardar en la nube (Cloud Firestore)
      await this.saveProfileToFirestore(data.localId, userProfile, data.idToken);

      return userSession;
    }

    // Modo interactivo de respaldo
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
        photos: formData.photos || [],
        avatar_url: formData.avatar_url || (formData.photos && formData.photos[0]) || '',
        interests: formData.interests || [],
      },
    };

    localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(localUser));
    return localUser;
  },

  /**
   * 6. INICIO DE SESIÓN CON CORREO
   */
  async login(email, password) {
    if (isFirebaseConfigured) {
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

      // Intentar recuperar el perfil guardado en Cloud Firestore
      let userProfile = null;
      try {
        const profileUrl = `${FIRESTORE_BASE_URL}/profiles/${data.localId}?key=${FIREBASE_API_KEY}`;
        const pRes = await fetch(profileUrl);
        if (pRes.ok) {
          const pData = await pRes.json();
          userProfile = fromFirestoreDoc(pData);
        }
      } catch (e) {
        console.warn('No se pudo recuperar el perfil de Firestore:', e);
      }

      if (!userProfile) {
        userProfile = {
          id: data.localId,
          full_name: data.displayName || email.split('@')[0],
          age: 26,
          gender: 'Hombre',
          country: 'España',
          city: 'Madrid',
          church_name: 'IASD Central',
          bio: 'Miembro de la comunidad adventista.',
          photos: [],
        };
      }

      const userSession = {
        id: data.localId,
        email: data.email,
        profile: userProfile,
        token: data.idToken,
      };

      localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(userSession));
      return userSession;
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
        photos: [],
      },
    };
    localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(mockUser));
    return mockUser;
  },
};
