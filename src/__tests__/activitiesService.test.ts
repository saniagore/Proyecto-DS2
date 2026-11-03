import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ─── Mock del cliente Supabase ─────────────────────────────────────────────────
// Se mockea antes de importar el servicio para que no necesite variables de entorno.

const mockActividades = [
  {
    id: 'act-1',
    titulo: 'Diseño de UI',
    descripcion: 'Crear prototipos en Figma',
    estado: 'en_progreso',
    fecha_limite: null,
    created_at: '2026-11-01T00:00:00+00:00',
  },
  {
    id: 'act-2',
    titulo: 'Documentar API',
    descripcion: null,
    estado: 'pendiente',
    fecha_limite: '2026-12-01T00:00:00+00:00',
    created_at: '2026-11-01T01:00:00+00:00',
  },
];

let estadoSimulado = [...mockActividades];

const buildChain = (result: unknown) => ({
  select: () => buildChain(result),
  eq: () => buildChain(result),
  order: () => buildChain(result),
  single: () => Promise.resolve({ data: result, error: null }),
  returns: () => Promise.resolve({ data: result, error: null }),
  insert: () => buildChain(result),
  update: () => buildChain(result),
  delete: () => buildChain(result),
});

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: (tabla: string) => {
      if (tabla === 'actividades') {
        return {
          select: () => ({
            order: () => ({
              returns: () => Promise.resolve({ data: estadoSimulado, error: null }),
            }),
          }),
          insert: (payload: {
            titulo: string;
            descripcion: string | null;
            estado: string;
            fecha_limite: string | null;
          }) => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: {
                    id: `act-${Date.now()}`,
                    titulo: payload.titulo,
                    descripcion: payload.descripcion,
                    estado: payload.estado,
                    fecha_limite: payload.fecha_limite,
                    created_at: new Date().toISOString(),
                  },
                  error: null,
                }),
            }),
          }),
          update: (payload: { estado: string }) => ({
            eq: (campo: string, id: string) => {
              estadoSimulado = estadoSimulado.map((a) => (a.id === id ? { ...a, ...payload } : a));
              return Promise.resolve({ error: null });
            },
          }),
          delete: () => ({
            eq: (campo: string, id: string) => {
              estadoSimulado = estadoSimulado.filter((a) => a.id !== id);
              return Promise.resolve({ error: null });
            },
          }),
        };
      }
      return buildChain(null);
    },
  },
}));

// Importar después del mock
const { activitiesService } = await import('../services/activitiesService');

describe('activitiesService (Supabase)', () => {
  beforeEach(() => {
    estadoSimulado = [...mockActividades];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('obtiene todas las actividades desde Supabase', async () => {
    const list = await activitiesService.obtenerTodas();
    expect(list.length).toBe(2);
    expect(list[0].titulo).toBe('Diseño de UI');
  });

  it('mapea correctamente estados de Supabase a estados UI', async () => {
    const list = await activitiesService.obtenerTodas();
    const enProgreso = list.find((a) => a.id === 'act-1');
    const pendiente = list.find((a) => a.id === 'act-2');
    expect(enProgreso?.estado).toBe('progreso');
    expect(pendiente?.estado).toBe('proximo');
  });

  it('crea una nueva actividad con estado proximo', async () => {
    const nueva = await activitiesService.crear({
      titulo: 'Nueva tarea test',
      categoria: 'Trabajo',
      fecha: '2026-12-15',
    });
    expect(nueva.estado).toBe('proximo');
    expect(nueva.titulo).toBe('Nueva tarea test');
  });

  it('actualiza el estado de una actividad', async () => {
    await activitiesService.actualizarEstado('act-2', 'progreso');
    const lista = await activitiesService.obtenerTodas();
    const actualizada = lista.find((a) => a.id === 'act-2');
    expect(actualizada?.estado).toBe('progreso');
  });

  it('elimina una actividad por id', async () => {
    await activitiesService.eliminar('act-1');
    const lista = await activitiesService.obtenerTodas();
    expect(lista.find((a) => a.id === 'act-1')).toBeUndefined();
  });
});
