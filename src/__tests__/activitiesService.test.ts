import { beforeEach, describe, expect, it } from 'vitest';
import { activitiesService } from '../services/activitiesService';

describe('activitiesService', () => {
  beforeEach(() => {
    activitiesService.limpiarMemoria();
  });

  it('obtiene las actividades iniciales si no hay nada en storage', async () => {
    const list = await activitiesService.obtenerTodas();
    expect(list.length).toBe(6);
  });

  it('permite crear una nueva actividad con estado inicial proximo', async () => {
    const nueva = await activitiesService.crear({
      titulo: 'Probar servicio',
      categoria: 'Trabajo',
      fecha: '2026-11-02',
    });

    expect(nueva.estado).toBe('proximo');
    expect(nueva.titulo).toBe('Probar servicio');

    const list = await activitiesService.obtenerTodas();
    expect(list.length).toBe(7);
  });

  it('permite cambiar de estado y eliminar actividades', async () => {
    const iniciales = await activitiesService.obtenerTodas();
    const id = iniciales[0].id;

    const actualizadas = await activitiesService.actualizarEstado(id, 'progreso');
    const modificada = actualizadas.find((a) => a.id === id);
    expect(modificada?.estado).toBe('progreso');

    const restantes = await activitiesService.eliminar(id);
    expect(restantes.find((a) => a.id === id)).toBeUndefined();
  });
});
