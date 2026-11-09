import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';

const mocks = vi.hoisted(() => ({
  usuario: { id: 'user-1', nombre: 'Ana', email: 'ana@correo.com' },
  logout: vi.fn(),
  navigate: vi.fn(),
  agregarActividad: vi.fn(),
  editarActividad: vi.fn(),
  cambiarEstado: vi.fn(),
  eliminarActividad: vi.fn(),
  setFiltro: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ usuario: mocks.usuario, logout: mocks.logout }),
}));
vi.mock('../hooks/useRouter', () => ({
  useRouter: () => ({ navigate: mocks.navigate, path: '/panel' }),
}));
vi.mock('../hooks/useActivities', () => ({
  useActivities: () => ({
    actividades: [
      {
        id: 'a1',
        titulo: 'Entrega',
        descripcion: 'Descripción',
        categoria: 'Trabajo',
        fecha: '2026-11-10',
        estado: 'proximo',
      },
    ],
    cargando: false,
    error: null,
    filtro: 'todas',
    setFiltro: mocks.setFiltro,
    agregarActividad: mocks.agregarActividad,
    editarActividad: mocks.editarActividad,
    cambiarEstado: mocks.cambiarEstado,
    eliminarActividad: mocks.eliminarActividad,
    conteos: { todas: 1, proximo: 1, progreso: 0, finalizado: 0 },
  }),
}));
vi.mock('../utils/report', () => ({ exportarResumenPdf: vi.fn() }));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.agregarActividad.mockResolvedValue(undefined);
    mocks.logout.mockResolvedValue(undefined);
  });

  it('renderiza actividades, exporta y permite cerrar sesión', async () => {
    render(<DashboardPage />);

    expect(screen.getByText('Hola, Ana')).toBeDefined();
    expect(screen.getAllByText('Entrega').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Exportar resumen PDF' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar sesión y volver al inicio' }));

    await waitFor(() => expect(mocks.logout).toHaveBeenCalledOnce());
    expect(mocks.navigate).toHaveBeenCalledWith('/login');
  });

  it('valida y crea una nueva actividad', async () => {
    render(<DashboardPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    expect(screen.getByText('Escribe el título de la actividad.')).toBeDefined();

    fireEvent.change(screen.getByRole('textbox', { name: /Nueva actividad/ }), {
      target: { value: 'Nueva tarea' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    await waitFor(() => expect(mocks.agregarActividad).toHaveBeenCalled());
  });
});
