import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Actividad } from '../types/activity';
import { useActivities } from './useActivities';

const service = vi.hoisted(() => ({
  obtenerTodas: vi.fn(),
  obtenerPorUsuario: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  actualizarEstado: vi.fn(),
  eliminar: vi.fn(),
}));

vi.mock('../services/activitiesService', () => ({ activitiesService: service }));

const actividad: Actividad = {
  id: 'a1',
  titulo: 'Actividad',
  categoria: 'Trabajo',
  fecha: '2026-11-10',
  estado: 'proximo',
};

describe('useActivities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.obtenerTodas.mockResolvedValue([actividad]);
    service.obtenerPorUsuario.mockResolvedValue([actividad]);
    service.crear.mockResolvedValue({ ...actividad, id: 'a2', titulo: 'Nueva' });
    service.actualizar.mockResolvedValue({ ...actividad, titulo: 'Editada' });
    service.actualizarEstado.mockResolvedValue(undefined);
    service.eliminar.mockResolvedValue(undefined);
  });

  it('carga actividades y permite crear y editar', async () => {
    const { result } = renderHook(() => useActivities());

    await waitFor(() => expect(result.current.actividades).toHaveLength(1));
    expect(service.obtenerTodas).toHaveBeenCalledOnce();

    await act(async () => {
      await result.current.agregarActividad({
        titulo: 'Nueva',
        categoria: 'Trabajo',
        fecha: '2026-11-12',
      });
      await result.current.editarActividad('a1', {
        titulo: 'Editada',
        fecha: '2026-11-13',
      });
    });

    expect(result.current.actividades.map(({ titulo }) => titulo)).toEqual(['Nueva', 'Editada']);
  });

  it('carga actividades asignadas cuando recibe usuario', async () => {
    const { result } = renderHook(() => useActivities('user-1'));

    await waitFor(() => expect(result.current.actividades).toHaveLength(1));
    expect(service.obtenerPorUsuario).toHaveBeenCalledWith('user-1');
  });

  it('revierte cambios optimistas cuando fallan estado y eliminación', async () => {
    service.actualizarEstado.mockRejectedValue(new Error('estado'));
    service.eliminar.mockRejectedValue(new Error('eliminación'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { result } = renderHook(() => useActivities());
    await waitFor(() => expect(result.current.actividades).toHaveLength(1));

    await act(async () => {
      await result.current.cambiarEstado('a1', 'progreso');
    });
    expect(result.current.actividades[0].estado).toBe('proximo');
    expect(result.current.error).toContain('cambiar el estado');

    await act(async () => {
      await result.current.eliminarActividad('a1');
    });
    expect(result.current.actividades).toHaveLength(1);
    expect(result.current.error).toContain('eliminar');
    errorSpy.mockRestore();
  });
});
