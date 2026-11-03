export type EstadoActividad = 'proximo' | 'progreso' | 'finalizado';

export type CategoriaActividad = 'Trabajo' | 'Estudio' | 'Personal';

export type FiltroActividad = 'todas' | EstadoActividad;

export interface Actividad {
  id: string;
  titulo: string;
  categoria: CategoriaActividad;
  fecha: string;
  estado: EstadoActividad;
}

export interface NuevaActividadInput {
  titulo: string;
  categoria: CategoriaActividad;
  fecha: string;
}
