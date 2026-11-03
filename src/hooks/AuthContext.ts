import { createContext } from 'react';
import type { CredencialesLogin, DatosRegistro, Usuario } from '../types/auth';

export interface AuthContextType {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  login: (credenciales: CredencialesLogin) => Promise<Usuario>;
  registro: (datos: DatosRegistro) => Promise<Usuario>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
