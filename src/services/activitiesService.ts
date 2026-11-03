import { supabase } from '../lib/supabaseClient';
import type {
  Actividad,
  ActividadDb,
  ActualizarActividadInput,
  EstadoActividad,
  NuevaActividadInput,
} from '../types/activity';
import { ESTADO_DB_A_UI, ESTADO_UI_A_DB } from '../types/activity';

// ─── Helpers de mapeo Supabase ↔ UI ──────────────────────────────────────────

function mapearActividadDb(db: ActividadDb): Actividad {
  return {
    id: db.id,
    titulo: db.titulo,
    descripcion: db.descripcion ?? undefined,
    // La tabla no tiene columna `categoria`; la derivamos de la descripción o dejamos 'Personal'
    categoria: 'Personal',
    fecha: db.fecha_limite ? db.fecha_limite.slice(0, 10) : null,
    estado: ESTADO_DB_A_UI[db.estado] ?? 'proximo',
  };
}

/** Convierte YYYY-MM-DD al formato timestamptz que guarda `fecha_limite` */
function aFechaLimiteDb(fecha?: string | null): string | null {
  return fecha ? `${fecha}T00:00:00+00:00` : null;
}

// ─── Servicio de actividades conectado a Supabase ─────────────────────────────

export const activitiesService = {
  /**
   * Obtiene todas las actividades de Supabase.
   * Ordena por fecha de creación descendente.
   */
  async obtenerTodas(): Promise<Actividad[]> {
    const { data, error } = await supabase
      .from('actividades')
      .select('*')
      .order('created_at', { ascending: false })
      .returns<ActividadDb[]>();

    if (error) {
      console.error('Error al obtener actividades:', error.message);
      return [];
    }

    return (data ?? []).map(mapearActividadDb);
  },

  /**
   * Obtiene las actividades asignadas a un usuario específico
   * mediante la tabla `asignaciones`.
   */
  async obtenerPorUsuario(idUsuario: string): Promise<Actividad[]> {
    const { data, error } = await supabase
      .from('asignaciones')
      .select('actividades(*)')
      .eq('id_usuario', idUsuario)
      .returns<{ actividades: ActividadDb }[]>();

    if (error) {
      console.error('Error al obtener actividades del usuario:', error.message);
      return [];
    }

    return (data ?? [])
      .map((row) => row.actividades)
      .filter(Boolean)
      .map(mapearActividadDb);
  },

  /**
   * Crea una nueva actividad en Supabase.
   * Si se indica `idUsuario`, también la asigna a ese usuario para que
   * aparezca en `obtenerPorUsuario` (sin esto, desaparece al recargar).
   */
  async crear(input: NuevaActividadInput, idUsuario?: string): Promise<Actividad> {
    const { data, error } = await supabase
      .from('actividades')
      .insert({
        titulo: input.titulo.trim(),
        descripcion: input.descripcion?.trim() || null,
        estado: 'pendiente' as const,
        fecha_limite: aFechaLimiteDb(input.fecha),
      })
      .select()
      .single<ActividadDb>();

    if (error || !data) {
      throw new Error(error?.message ?? 'Error al crear la actividad');
    }

    if (idUsuario) {
      await this.asignarUsuario(data.id, idUsuario);
    }

    return mapearActividadDb(data);
  },

  /**
   * Edita título, descripción y fecha límite de una actividad.
   */
  async actualizar(id: string, cambios: ActualizarActividadInput): Promise<Actividad> {
    const { data, error } = await supabase
      .from('actividades')
      .update({
        titulo: cambios.titulo.trim(),
        descripcion: cambios.descripcion?.trim() || null,
        fecha_limite: aFechaLimiteDb(cambios.fecha),
      })
      .eq('id', id)
      .select()
      .single<ActividadDb>();

    if (error || !data) {
      throw new Error(error?.message ?? 'Error al editar la actividad');
    }

    return mapearActividadDb(data);
  },

  /**
   * Actualiza el estado de una actividad en Supabase.
   */
  async actualizarEstado(id: string, nuevoEstado: EstadoActividad): Promise<void> {
    const estadoDb = ESTADO_UI_A_DB[nuevoEstado];

    const { error } = await supabase.from('actividades').update({ estado: estadoDb }).eq('id', id);

    if (error) {
      throw new Error(error.message ?? 'Error al actualizar el estado');
    }
  },

  /**
   * Elimina una actividad (y sus asignaciones en cascada) de Supabase.
   */
  async eliminar(id: string): Promise<void> {
    const { error } = await supabase.from('actividades').delete().eq('id', id);

    if (error) {
      throw new Error(error.message ?? 'Error al eliminar la actividad');
    }
  },

  /**
   * Asigna una actividad a un usuario creando un registro en `asignaciones`.
   */
  async asignarUsuario(idActividad: string, idUsuario: string): Promise<void> {
    const { error } = await supabase.from('asignaciones').insert({
      id_actividad: idActividad,
      id_usuario: idUsuario,
    });

    if (error) {
      throw new Error(error.message ?? 'Error al asignar la actividad');
    }
  },

  /** @deprecated Solo para compatibilidad con tests anteriores */
  limpiarMemoria(): void {
    // No-op: la fuente de verdad es Supabase
  },
};
