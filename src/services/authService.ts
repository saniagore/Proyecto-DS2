import type { CredencialesLogin, DatosRegistro, Usuario } from '../types/auth';

const AUTH_USER_KEY = 'rumbo_auth_user';

const authMemoria = new Map<string, string>();

function obtenerItem(clave: string): string | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(clave);
  }
  return authMemoria.get(clave) || null;
}

function guardarItem(clave: string, valor: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(clave, valor);
  } else {
    authMemoria.set(clave, valor);
  }
}

function removerItem(clave: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(clave);
  } else {
    authMemoria.delete(clave);
  }
}

export const authService = {
  obtenerUsuarioActual(): Usuario | null {
    try {
      const data = obtenerItem(AUTH_USER_KEY);
      if (!data) return null;
      return JSON.parse(data) as Usuario;
    } catch {
      return null;
    }
  },

  async login(credenciales: CredencialesLogin): Promise<Usuario> {
    // Simulación de autenticación
    const usuario: Usuario = {
      id: 'usr-1',
      nombre: credenciales.email.split('@')[0] || 'Santiago',
      email: credenciales.email,
    };
    guardarItem(AUTH_USER_KEY, JSON.stringify(usuario));
    return usuario;
  },

  async registro(datos: DatosRegistro): Promise<Usuario> {
    const usuario: Usuario = {
      id: `usr-${Date.now()}`,
      nombre: datos.nombre.trim(),
      email: datos.email.trim(),
      usoPrincipal: datos.usoPrincipal,
    };
    guardarItem(AUTH_USER_KEY, JSON.stringify(usuario));
    return usuario;
  },

  async logout(): Promise<void> {
    removerItem(AUTH_USER_KEY);
  },
};
