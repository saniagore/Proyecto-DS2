import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { authService } from '../services/authService';
import type { CredencialesLogin, DatosRegistro, Usuario } from '../types/auth';
import { AuthContext } from '../hooks/AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    return authService.obtenerUsuarioActual();
  });

  // Sincronizar con la sesión activa de Supabase al montar
  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!session) {
          setUsuario(null);
        }
      })
      .catch((error: unknown) => {
        console.error('No se pudo comprobar la sesión activa:', error);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUsuario(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
