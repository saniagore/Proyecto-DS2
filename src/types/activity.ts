export type EstadoActividad = 'proximo' | 'progreso' | 'finalizado';

/** Estados tal como los almacena la tabla `actividades` en Supabase */
export type EstadoDb = 'pendiente' | 'en_progreso' | 'completada';

export type CategoriaActividad = 'Trabajo' | 'Estudio' | 'Personal';

export type FiltroActividad = 'todas' | EstadoActividad;

/** Modelo de actividad usado en la UI (normalizado desde Supabase) */
export interface Actividad {
  id: string;
  titulo: string;
  descripcion?: string;
  categoria: CategoriaActividad;
  fecha: string | null; // fecha_limite formateada como YYYY-MM-DD (null si no tiene)
  estado: EstadoActividad;
}

/** Registro crudo de la tabla `actividades` en Supabase */
export interface ActividadDb {
  id: string;
  titulo: string;
  descripcion: string | null;
  estado: EstadoDb;
  fecha_limite: string | null;
  created_at: string;
}

/** Registro de la tabla `asignaciones` en Supabase */
export interface AsignacionDb {
  id: string;
  id_usuario: string;
  id_actividad: string;
  fecha_asignacion: string;
}

export interface NuevaActividadInput {
  titulo: string;
  descripcion?: string;
  categoria: CategoriaActividad;
  fecha: string;
}

/** Campos editables de una actividad existente */
export interface ActualizarActividadInput {
  titulo: string;
  descripcion?: string;
  fecha: string;
}

/** Mapeo de EstadoActividad (UI) ↔ EstadoDb (Supabase) */
export const ESTADO_UI_A_DB: Record<EstadoActividad, EstadoDb> = {
  proximo: 'pendiente',
  progreso: 'en_progreso',
  finalizado: 'completada',
};

export const ESTADO_DB_A_UI: Record<EstadoDb, EstadoActividad> = {
  pendiente: 'proximo',
  en_progreso: 'progreso',
  completada: 'finalizado',
};
