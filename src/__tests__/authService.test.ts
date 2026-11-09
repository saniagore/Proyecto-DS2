import { beforeEach, describe, expect, it, vi } from 'vitest';

const signInWithPassword = vi.fn();
const signUp = vi.fn();
const signOut = vi.fn();
const from = vi.fn();

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword,
      signUp,
      signOut,
    },
    from,
  },
}));

const { authService } = await import('../services/authService');

const usuarioDb = {
  id: 'user-1',
  nombre: 'Ana',
  email: 'ana@correo.com',
  rol: 'estudiante' as const,
  created_at: '2026-11-03T00:00:00.000Z',
};

function configureProfileQuery(
  result: { data: unknown; error: { message: string } | null } = {
    data: usuarioDb,
    error: null,
  }
) {
  from.mockReturnValue({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve(result),
      }),
    }),
  });
}

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    configureProfileQuery();
    signOut.mockResolvedValue({ error: null });
  });

  it('lee el usuario guardado en cache', () => {
    localStorage.setItem(
      'rumbo_auth_user',
      JSON.stringify({ id: 'user-1', nombre: 'Ana', email: 'ana@correo.com' })
    );

    expect(authService.obtenerUsuarioActual()).toEqual({
      id: 'user-1',
      nombre: 'Ana',
      email: 'ana@correo.com',
    });
  });

  it('retorna null si el cache contiene JSON inválido', () => {
    localStorage.setItem('rumbo_auth_user', '{invalido');

    expect(authService.obtenerUsuarioActual()).toBeNull();
  });

  it('inicia sesión, mapea el perfil y lo persiste', async () => {
    signInWithPassword.mockResolvedValue({
      data: { user: { id: 'auth-1', email: 'ana@correo.com' } },
      error: null,
    });

    const usuario = await authService.login({
      email: 'ana@correo.com',
      password: 'password123',
    });

    expect(usuario).toEqual({
      id: 'user-1',
      nombre: 'Ana',
      email: 'ana@correo.com',
      rol: 'estudiante',
    });
    expect(JSON.parse(localStorage.getItem('rumbo_auth_user') ?? '')).toEqual(usuario);
  });

  it('crea un usuario básico si el perfil no existe', async () => {
    signInWithPassword.mockResolvedValue({
      data: {
        user: { id: 'auth-1', email: 'ana@correo.com', user_metadata: { nombre: 'Ana García' } },
      },
      error: null,
    });
    configureProfileQuery({ data: null, error: { message: 'not found' } });

    await expect(
      authService.login({ email: 'ana@correo.com', password: 'password123' })
    ).resolves.toMatchObject({
      id: 'auth-1',
      nombre: 'Ana García',
      email: 'ana@correo.com',
    });
  });

  it.each([
    ['Invalid login credentials', 'Correo o contraseña incorrectos. Verifica tus datos.'],
    [
      'Email not confirmed',
      'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.',
    ],
    ['network failure', 'Error de conexión. Verifica tu acceso a internet.'],
    ['unexpected', 'Ocurrió un error inesperado. Inténtalo de nuevo.'],
  ])('traduce errores de login: %s', async (message, expected) => {
    signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message },
    });

    await expect(authService.login({ email: 'ana@correo.com', password: 'bad' })).rejects.toThrow(
      expected
    );
  });

  it('registra usuario, crea el perfil y aplica el rol indicado', async () => {
    signUp.mockResolvedValue({
      data: { user: { id: 'auth-2' } },
      error: null,
    });
    from.mockReturnValue({
      insert: (payload: Record<string, unknown>) => ({
        select: () => ({
          single: () =>
            Promise.resolve({
              data: {
                ...usuarioDb,
                id: payload.id,
                nombre: payload.nombre,
                email: payload.email,
                rol: payload.rol,
              },
              error: null,
            }),
        }),
      }),
    });

    const usuario = await authService.registro({
      nombre: ' Ana ',
      email: ' ana@correo.com ',
      password: 'password123',
      usoPrincipal: 'Trabajo',
      rol: 'docente',
    });

    expect(usuario).toMatchObject({
      id: 'auth-2',
      nombre: 'Ana',
      email: 'ana@correo.com',
      rol: 'docente',
    });
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: ' ana@correo.com ',
        password: 'password123',
        options: { data: { nombre: ' Ana ' } },
      })
    );
  });

  it('devuelve el usuario aunque falle la creación del perfil', async () => {
    signUp.mockResolvedValue({
      data: { user: { id: 'auth-3' } },
      error: null,
    });
    from.mockReturnValue({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'RLS' } }),
        }),
      }),
    });

    await expect(
      authService.registro({
        nombre: 'Ana',
        email: 'ana@correo.com',
        password: 'password123',
        usoPrincipal: 'Personal',
      })
    ).resolves.toMatchObject({ id: 'auth-3', nombre: 'Ana', email: 'ana@correo.com' });
  });

  it('traduce errores de registro y cierra sesión limpiando el cache', async () => {
    signUp.mockResolvedValue({
      data: { user: null },
      error: { message: 'User already registered' },
    });
    await expect(
      authService.registro({
        nombre: 'Ana',
        email: 'ana@correo.com',
        password: 'password123',
        usoPrincipal: 'Estudio',
      })
    ).rejects.toThrow('Ya existe una cuenta con ese correo electrónico. Intenta iniciar sesión.');

    localStorage.setItem('rumbo_auth_user', JSON.stringify(usuarioDb));
    await authService.logout();
    expect(signOut).toHaveBeenCalledOnce();
    expect(localStorage.getItem('rumbo_auth_user')).toBeNull();
  });
});
