export type UsoPrincipal = 'Trabajo' | 'Estudio' | 'Personal';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
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
}
