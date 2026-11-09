import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '../hooks/useAuth';
import { AuthProvider } from './AuthProvider';

const { getSession, onAuthStateChange, login, registro, logout, obtenerUsuarioActual } = vi.hoisted(
  () => ({
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    login: vi.fn(),
    registro: vi.fn(),
    logout: vi.fn(),
    obtenerUsuarioActual: vi.fn(),
  })
);

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession,
      onAuthStateChange,
    },
  },
}));

vi.mock('../services/authService', () => ({
  authService: {
    login,
    registro,
    logout,
    obtenerUsuarioActual,
  },
}));

function AuthConsumer() {
  const auth = useAuth();

  return (
    <div>
      <span>{auth.estaAutenticado ? auth.usuario?.nombre : 'sin sesión'}</span>
      <button onClick={() => void auth.login({ email: 'ana@correo.com', password: 'secret' })}>
        Entrar
      </button>
      <button
        onClick={() =>
          void auth.registro({
            nombre: 'Ana',
            email: 'ana@correo.com',
            password: 'secret',
            usoPrincipal: 'Trabajo',
          })
        }
      >
        Registrar
      </button>
      <button onClick={() => void auth.logout()}>Salir</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    obtenerUsuarioActual.mockReturnValue(null);
    getSession.mockResolvedValue({ data: { session: null }, error: null });
    onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    login.mockResolvedValue({ id: 'user-1', nombre: 'Ana', email: 'ana@correo.com' });
    registro.mockResolvedValue({ id: 'user-2', nombre: 'Ana', email: 'ana@correo.com' });
    logout.mockResolvedValue(undefined);
  });

  it('carga la sesión, inicia sesión, registra y cierra sesión', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(getSession).toHaveBeenCalledOnce());
    expect(screen.getByText('sin sesión')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    await waitFor(() => expect(screen.getByText('Ana')).toBeDefined());

    fireEvent.click(screen.getByRole('button', { name: 'Registrar' }));
    await waitFor(() => expect(registro).toHaveBeenCalledOnce());

    fireEvent.click(screen.getByRole('button', { name: 'Salir' }));
    await waitFor(() => expect(screen.getByText('sin sesión')).toBeDefined());
  });

  it('mantiene la sesión cuando Supabase devuelve una sesión activa', async () => {
    obtenerUsuarioActual.mockReturnValue({
      id: 'user-1',
      nombre: 'Ana',
      email: 'ana@correo.com',
    });
    getSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } }, error: null });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByText('Ana')).toBeDefined());
  });

  it('maneja errores al consultar la sesión activa', async () => {
    getSession.mockRejectedValue(new Error('network'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    errorSpy.mockRestore();
  });
});
