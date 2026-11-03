export type UsoPrincipal = 'Trabajo' | 'Estudio' | 'Personal';

/** Rol del usuario en la base de datos */
export type RolUsuario = 'admin' | 'docente' | 'estudiante';

/** Representa un registro de la tabla `usuarios` en Supabase */
export interface UsuarioDb {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  created_at: string;
}

/** Modelo de usuario que usa la UI */
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol?: RolUsuario;
  usoPrincipal?: UsoPrincipal;
}

export interface CredencialesLogin {
  email: string;
  password: string;
}

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
  confirmPassword?: string;
  usoPrincipal: UsoPrincipal;
  /** Si no se especifica, el rol por defecto es 'estudiante' */
  rol?: RolUsuario;
}
