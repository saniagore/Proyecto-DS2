export interface Actividad {
  id: string;
  titulo: string;
  materia: string;
  estado: string;
  prioridad: string;
  descripcion?: string;
  fecha?: string | null;
}

export interface Filtros {
  materia?: string;
  estado?: string;
  prioridad?: string;
}

/**
 * Filtra de forma pura una lista de actividades según los filtros activos
 * (materia, estado y/o prioridad).
 */
export function filtrarActividades(actividades: Actividad[], filtros: Filtros): Actividad[] {
  const materiaFiltro = filtros.materia?.trim().toLowerCase();
  const estadoFiltro = filtros.estado?.trim().toLowerCase();
  const prioridadFiltro = filtros.prioridad?.trim().toLowerCase();

  return actividades.filter((actividad) => {
    const coincideMateria = !materiaFiltro || actividad.materia.toLowerCase() === materiaFiltro;
    const coincideEstado = !estadoFiltro || actividad.estado.toLowerCase() === estadoFiltro;
    const coincidePrioridad =
      !prioridadFiltro || actividad.prioridad.toLowerCase() === prioridadFiltro;

    return coincideMateria && coincideEstado && coincidePrioridad;
  });
}
