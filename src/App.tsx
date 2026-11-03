import React from 'react';
import { useRouter } from './hooks/useRouter';
import { AuthProvider } from './layouts/AuthProvider';
import { ProtectedRoute } from './layouts/ProtectedRoute';
import { RouterProvider } from './layouts/RouterProvider';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const AppContent: React.FC = () => {
  const { path } = useRouter();

  if (path === '/registro') {
    return <RegisterPage />;
  }

  if (path === '/panel') {
    return (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    );
  }

  // Por defecto, '/login' o cualquier ruta no definida
  return <LoginPage />;
};

function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </RouterProvider>
  );
}

export default App;
