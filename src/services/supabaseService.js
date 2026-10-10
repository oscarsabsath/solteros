/**
 * Servicio de conexión con Supabase (Autenticación y Datos)
 * Utiliza fetch nativo para máxima compatibilidad sin dependencias adicionales.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('tu-proyecto') &&
  SUPABASE_URL.startsWith('http')
);

const MOCK_STORAGE_KEY_USER = 'solteros_adv_user';
const MOCK_STORAGE_KEY_PROFILES = 'solteros_adv_profiles';
const MOCK_STORAGE_KEY_CONNECTIONS = 'solteros_adv_connections';

// Perfiles adventistas de demostración con fotos estilo Badoo
const INITIAL_DEMO_PROFILES = [
  {
    id: 'demo-1',
    full_name: 'Sara Morales',
    age: 26,
    gender: 'Mujer',
    country: 'España',
    city: 'Madrid',
    church_name: 'IASD Alenza',
    bio: 'Apasionada por la música sacra y la cocina saludable. Líder de jóvenes en mi iglesia. Busco a alguien con quien compartir la fe y servir juntos.',
    interests: ['Música Sacra / Canto', 'Vida Saludable & Nutrición', 'Misiones & Voluntariado'],
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'demo-2',
    full_name: 'Daniel Castillo',
    age: 29,
    gender: 'Hombre',
    country: 'España',
    city: 'Barcelona',
    church_name: 'IASD Guinardó',
    bio: 'Ingeniero, amante del senderismo y el estudio de las profecías bíblicas. Busco una compañera de vida con metas espirituales claras.',
    interests: ['Senderismo en la Naturaleza', 'Estudio Bíblico Profundo', 'Club de Conquistadores'],
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'demo-3',
    full_name: 'Raquel Benítez',
    age: 24,
    gender: 'Mujer',
    country: 'Colombia',
    city: 'Medellín',
    church_name: 'IASD El Poblado',
    bio: 'Docente de educación infantil. Guía Mayor investida. Disfruto de los paseos al aire libre en sábado y de leer libros devocionales.',
    interests: ['Club de Conquistadores', 'Lectura & Crecimiento', 'Educación Adventista'],
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'demo-4',
    full_name: 'Marcos Herrera',
    age: 31,
    gender: 'Hombre',
    country: 'México',
    city: 'Monterrey',
    church_name: 'IASD Central',
    bio: 'Médico misionero, apasionado por el mensaje pro-salud. Me encanta servir en brigadas médicas y compartir el amor de Jesús.',
    interests: ['Vida Saludable & Nutrición', 'Misiones & Voluntariado', 'Deporte & Aire Libre'],
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    ],
  },
  {
    id: 'demo-5',
    full_name: 'Noemí Duarte',
    age: 27,
    gender: 'Mujer',
    country: 'Argentina',
    city: 'Buenos Aires',
    church_name: 'IASD Palermo',
    bio: 'Diseñadora gráfica, colaboro con el ministerio de comunicaciones. Enamorada de Dios y de su creación. Busco una amistad sincera que crezca con propósito.',
    interests: ['Medios & Comunicaciones', 'Familia & Proyectos de Vida', 'Música Sacra / Canto'],
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    photos: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    ],
  },
];

function getLocalDemoProfiles() {
  const saved = localStorage.getItem(MOCK_STORAGE_KEY_PROFILES);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(MOCK_STORAGE_KEY_PROFILES, JSON.stringify(INITIAL_DEMO_PROFILES));
  return INITIAL_DEMO_PROFILES;
}

export const supabaseService = {
  isConfigured: isSupabaseConfigured,

  /**
   * Registro de usuario
   */
  async register(formData) {
    if (isSupabaseConfigured) {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          data: {
            full_name: formData.fullName,
            age: Number(formData.age),
            gender: formData.gender,
            country: formData.country,
            city: formData.city,
            church_name: formData.churchName,
            bio: formData.bio,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || data.error_description || data.message || 'Error en el registro');
      }

      // Guardar sesión
      const userSession = {
        id: data.user?.id || data.id,
        email: formData.email,
        profile: {
          id: data.user?.id || data.id,
          full_name: formData.fullName,
          age: Number(formData.age),
          gender: formData.gender,
          country: formData.country,
          city: formData.city,
          church_name: formData.churchName,
          bio: formData.bio,
        },
        token: data.access_token,
      };
      localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(userSession));
      return userSession;
    }

    // Modo local / demostración
    const localUser = {
      id: 'local-' + Date.now(),
      email: formData.email,
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

    // Agregar perfil al listado local
    const profiles = getLocalDemoProfiles();
    const updated = [localUser.profile, ...profiles];
    localStorage.setItem(MOCK_STORAGE_KEY_PROFILES, JSON.stringify(updated));

    return localUser;
  },

  /**
   * Inicio de sesión
   */
  async login(email, password) {
    if (isSupabaseConfigured) {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error_description || data.msg || 'Credenciales inválidas');
      }

      const userSession = {
        id: data.user.id,
        email: data.user.email,
        profile: {
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          age: data.user.user_metadata?.age || 25,
          gender: data.user.user_metadata?.gender || 'Hombre',
          country: data.user.user_metadata?.country || '',
          city: data.user.user_metadata?.city || '',
          church_name: data.user.user_metadata?.church_name || '',
          bio: data.user.user_metadata?.bio || '',
        },
        token: data.access_token,
      };

      localStorage.setItem(MOCK_STORAGE_KEY_USER, JSON.stringify(userSession));
      return userSession;
    }

    // Modo local / demostración
    const saved = localStorage.getItem(MOCK_STORAGE_KEY_USER);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email.toLowerCase() === email.toLowerCase()) {
        return parsed;
      }
    }

    // Crear sesión simulada si no existe
    const mockUser = {
      id: 'mock-user-1',
      email,
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

  /**
   * Cerrar sesión
   */
  async logout() {
    localStorage.removeItem(MOCK_STORAGE_KEY_USER);
  },

  /**
   * Obtener usuario actual persistido
   */
  getCurrentUser() {
    const saved = localStorage.getItem(MOCK_STORAGE_KEY_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Obtener perfiles de la comunidad
   */
  async getProfiles() {
    if (isSupabaseConfigured) {
      const session = this.getCurrentUser();
      const token = session?.token || SUPABASE_ANON_KEY;
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const list = await res.json();
          if (list && list.length > 0) return list;
        }
      } catch (e) {
        console.warn('Fallo al consultar perfiles en Supabase, usando respaldo local:', e);
      }
    }

    return getLocalDemoProfiles();
  },

  /**
   * Conectar / Enviar like con propósito
   */
  async connectWith(targetProfileId) {
    const saved = localStorage.getItem(MOCK_STORAGE_KEY_CONNECTIONS) || '[]';
    const connections = JSON.parse(saved);
    if (!connections.includes(targetProfileId)) {
      connections.push(targetProfileId);
      localStorage.setItem(MOCK_STORAGE_KEY_CONNECTIONS, JSON.stringify(connections));
    }
    return connections;
  },

  getConnections() {
    const saved = localStorage.getItem(MOCK_STORAGE_KEY_CONNECTIONS) || '[]';
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  },
};
