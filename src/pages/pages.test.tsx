import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';

const auth = vi.hoisted(() => ({
  login: vi.fn(),
  registro: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('../hooks/useAuth', () => ({ useAuth: () => auth }));
vi.mock('../hooks/useRouter', () => ({ useRouter: () => ({ navigate, path: '/login' }) }));

describe('páginas de autenticación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.login.mockResolvedValue({ id: 'user-1', nombre: 'Ana', email: 'ana@correo.com' });
    auth.registro.mockResolvedValue({ id: 'user-1', nombre: 'Ana', email: 'ana@correo.com' });
  });

  it('valida el login y permite el acceso normal y demo', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar a mi panel' }));
    expect(screen.getAllByRole('alert')[0].textContent).toContain('correo');

    fireEvent.change(screen.getByLabelText(/Correo electrónico/), {
      target: { value: 'ana@correo.com' },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: 'secret12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar a mi panel' }));
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/panel'));

    fireEvent.click(screen.getByRole('button', { name: 'Acceso rápido (Demo)' }));
    await waitFor(() => expect(auth.login).toHaveBeenCalledTimes(2));
  });

  it('muestra errores del servicio de login', async () => {
    auth.login.mockRejectedValue(new Error('credenciales inválidas'));
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Correo electrónico/), {
      target: { value: 'ana@correo.com' },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/), { target: { value: 'secret12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar a mi panel' }));

    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('Ocurrió un error')
    );
  });

  it('valida y completa el registro', async () => {
    render(<RegisterPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));
    expect(screen.getAllByRole('alert')[0].textContent).toContain('obligatorio');

    fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/), {
      target: { value: 'ana@correo.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'secret12' } });
    fireEvent.change(screen.getByLabelText(/Repetir contraseña/), {
      target: { value: 'secret12' },
    });
    fireEvent.click(screen.getByRole('radio', { name: 'Estudio' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));

    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/panel'));
    expect(auth.registro).toHaveBeenCalledWith(
      expect.objectContaining({ nombre: 'Ana', usoPrincipal: 'Estudio' })
    );
  });

  it('muestra errores generales y de campo al registrar', async () => {
    auth.registro.mockRejectedValueOnce(new Error('Espera unos minutos'));
    render(<RegisterPage />);
    const fillForm = () => {
      fireEvent.change(screen.getByLabelText(/Nombre/), { target: { value: 'Ana' } });
      fireEvent.change(screen.getByLabelText(/Correo electrónico/), {
        target: { value: 'ana@correo.com' },
      });
      fireEvent.change(screen.getByLabelText(/^Contraseña/), { target: { value: 'secret12' } });
      fireEvent.change(screen.getByLabelText(/Repetir contraseña/), {
        target: { value: 'secret12' },
      });
    };
    fillForm();
    fireEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Espera'));

    auth.registro.mockRejectedValueOnce('fallo');
    fireEvent.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('Ocurrió un error')
    );
  });
});
