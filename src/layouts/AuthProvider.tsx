import React, { useState } from 'react';
import type { CredencialesLogin, DatosRegistro, Usuario } from '../types/auth';
import { authService } from '../services/authService';
import { AuthContext } from '../hooks/AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    return authService.obtenerUsuarioActual();
  });

  const login = async (credenciales: CredencialesLogin) => {
    const user = await authService.login(credenciales);
    setUsuario(user);
    return user;
  };

  const registro = async (datos: DatosRegistro) => {
    const user = await authService.registro(datos);
    setUsuario(user);
    return user;
  };

  const logout = async () => {
    await authService.logout();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        estaAutenticado: Boolean(usuario),
        login,
        registro,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
