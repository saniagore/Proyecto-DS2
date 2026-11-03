import { supabase } from '../lib/supabaseClient';
import type { CredencialesLogin, DatosRegistro, Usuario, UsuarioDb } from '../types/auth';

const AUTH_USER_KEY = 'rumbo_auth_user';

// ─── Helpers de persistencia local (caché ligero) ─────────────────────────────

function persistirUsuario(usuario: Usuario): void {
  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(usuario));
  } catch {
    // Entorno sin localStorage (p.ej. SSR / tests)
  }
}

function leerUsuarioCacheado(): Usuario | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}

function limpiarCache(): void {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
  } catch {
    // ignorar
  }
}

// ─── Mapeo Supabase → modelo UI ───────────────────────────────────────────────

function mapearUsuarioDb(db: UsuarioDb): Usuario {
  return {
    id: db.id,
    nombre: db.nombre,
    email: db.email,
    rol: db.rol,
  };
}

// ─── Servicio de autenticación ────────────────────────────────────────────────

export const authService = {
  /** Devuelve el usuario guardado en caché local (sin llamada a red) */
  obtenerUsuarioActual(): Usuario | null {
    return leerUsuarioCacheado();
  },

  /**
   * Inicia sesión con email/password usando Supabase Auth.
   * Luego busca el perfil en la tabla `usuarios` y lo cachea localmente.
   */
  async login(credenciales: CredencialesLogin): Promise<Usuario> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credenciales.email,
      password: credenciales.password,
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? 'Error al iniciar sesión');
    }

    // Buscar perfil en la tabla pública `usuarios`
    const { data: perfil, error: perfilError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', data.user.email)
      .single<UsuarioDb>();

    if (perfilError || !perfil) {
      // Si aún no tiene fila en `usuarios`, construimos uno básico
      const usuario: Usuario = {
        id: data.user.id,
        nombre: data.user.user_metadata?.nombre ?? data.user.email?.split('@')[0] ?? 'Usuario',
        email: data.user.email ?? '',
      };
      persistirUsuario(usuario);
      return usuario;
    }

    const usuario = mapearUsuarioDb(perfil);
    persistirUsuario(usuario);
    return usuario;
  },

  /**
   * Registra un nuevo usuario en Supabase Auth y crea su fila en `usuarios`.
   */
  async registro(datos: DatosRegistro): Promise<Usuario> {
    // 1. Crear cuenta en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: datos.email,
      password: datos.password,
      options: {
        data: { nombre: datos.nombre },
      },
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? 'Error al crear la cuenta');
    }

    // 2. Insertar perfil en la tabla `usuarios`
    const { data: perfil, error: insertError } = await supabase
      .from('usuarios')
      .insert({
        id: data.user.id,
        nombre: datos.nombre.trim(),
        email: datos.email.trim(),
        rol: datos.rol ?? 'estudiante',
      })
      .select()
      .single<UsuarioDb>();

    if (insertError) {
      // Si la tabla tiene RLS que impide el insert, igualmente devolvemos el usuario Auth
      console.warn('No se pudo crear el perfil en usuarios:', insertError.message);
    }

    const usuario: Usuario = perfil
      ? mapearUsuarioDb(perfil)
      : {
          id: data.user.id,
          nombre: datos.nombre.trim(),
          email: datos.email.trim(),
        };

    persistirUsuario(usuario);
    return usuario;
  },

  /** Cierra la sesión en Supabase y limpia el caché local */
  async logout(): Promise<void> {
    await supabase.auth.signOut();
    limpiarCache();
  },
};
