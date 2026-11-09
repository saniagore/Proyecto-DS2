import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from '../hooks/useRouter';

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { estaAutenticado } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!estaAutenticado) {
      navigate('/login');
    }
  }, [estaAutenticado, navigate]);

  if (!estaAutenticado) {
    return null;
  }

  return <>{children}</>;
};
