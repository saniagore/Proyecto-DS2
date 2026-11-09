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
let asignacionesSimuladas: { id_actividad: string; id_usuario: string }[] = [];
let errorLectura: string | null = null;

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
              returns: () =>
                Promise.resolve({
                  data: errorLectura ? null : estadoSimulado,
                  error: errorLectura ? { message: errorLectura } : null,
                }),
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
          update: (payload: Record<string, unknown>) => ({
            eq: (_campo: string, id: string) => {
              estadoSimulado = estadoSimulado.map((a) => (a.id === id ? { ...a, ...payload } : a));
              // Soporta tanto `await update().eq()` como `update().eq().select().single()`
              return Object.assign(Promise.resolve({ error: null }), {
                select: () => ({
                  single: () =>
                    Promise.resolve({
                      data: estadoSimulado.find((a) => a.id === id) ?? null,
                      error: null,
                    }),
                }),
              });
            },
          }),
          delete: () => ({
            eq: (_campo: string, id: string) => {
              estadoSimulado = estadoSimulado.filter((a) => a.id !== id);
              return Promise.resolve({ error: null });
            },
          }),
        };
      }
      if (tabla === 'asignaciones') {
        return {
          select: () => ({
            eq: () => ({
              returns: () =>
                Promise.resolve({
                  data: errorLectura
                    ? null
                    : estadoSimulado.map((actividad) => ({ actividades: actividad })),
                  error: errorLectura ? { message: errorLectura } : null,
                }),
            }),
          }),
          insert: (payload: { id_actividad: string; id_usuario: string }) => {
            asignacionesSimuladas.push(payload);
            return Promise.resolve({ error: null });
          },
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
    asignacionesSimuladas = [];
    errorLectura = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('obtiene todas las actividades desde Supabase', async () => {
    const list = await activitiesService.obtenerTodas();
    expect(list.length).toBe(2);
    expect(list[0].titulo).toBe('Diseño de UI');
  });

  it('obtiene las actividades asignadas a un usuario', async () => {
    const list = await activitiesService.obtenerPorUsuario('user-1');

    expect(list).toHaveLength(2);
    expect(list[0].estado).toBe('progreso');
  });

  it('propaga el error al obtener todas las actividades', async () => {
    errorLectura = 'No se pudo consultar actividades';

    await expect(activitiesService.obtenerTodas()).rejects.toThrow(errorLectura);
  });

  it('propaga el error al obtener actividades por usuario', async () => {
    errorLectura = 'No se pudo consultar asignaciones';

    await expect(activitiesService.obtenerPorUsuario('user-1')).rejects.toThrow(errorLectura);
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

  it('mapea fecha_limite null como actividad sin fecha', async () => {
    const list = await activitiesService.obtenerTodas();
    expect(list.find((a) => a.id === 'act-1')?.fecha).toBeNull();
    expect(list.find((a) => a.id === 'act-2')?.fecha).toBe('2026-12-01');
  });

  it('guarda la fecha límite y la descripción al crear', async () => {
    const nueva = await activitiesService.crear({
      titulo: '  Con fecha  ',
      descripcion: '  detalle  ',
      categoria: 'Estudio',
      fecha: '2026-12-20',
    });
    expect(nueva.titulo).toBe('Con fecha');
    expect(nueva.descripcion).toBe('detalle');
    expect(nueva.fecha).toBe('2026-12-20');
  });

  it('asigna la actividad creada al usuario indicado', async () => {
    const nueva = await activitiesService.crear(
      { titulo: 'Asignada', categoria: 'Trabajo', fecha: '2026-12-15' },
      'user-1'
    );
    expect(asignacionesSimuladas).toEqual([{ id_actividad: nueva.id, id_usuario: 'user-1' }]);
  });

  it('no crea asignación si no hay usuario', async () => {
    await activitiesService.crear({ titulo: 'Sin usuario', categoria: 'Trabajo', fecha: '' });
    expect(asignacionesSimuladas).toHaveLength(0);
  });

  it('edita título, descripción y fecha límite', async () => {
    const editada = await activitiesService.actualizar('act-2', {
      titulo: ' Documentar API v2 ',
      descripcion: '',
      fecha: '2026-12-10',
    });
    expect(editada.titulo).toBe('Documentar API v2');
    expect(editada.descripcion).toBeUndefined();
    expect(editada.fecha).toBe('2026-12-10');
    // El estado no se modifica al editar
    expect(editada.estado).toBe('proximo');
  });

  it('elimina una actividad por id', async () => {
    await activitiesService.eliminar('act-1');
    const lista = await activitiesService.obtenerTodas();
    expect(lista.find((a) => a.id === 'act-1')).toBeUndefined();
  });
});
