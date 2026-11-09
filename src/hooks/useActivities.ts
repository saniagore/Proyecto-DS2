import { useEffect, useState, useTransition } from 'react';
import type {
  Actividad,
  ActualizarActividadInput,
  EstadoActividad,
  FiltroActividad,
  NuevaActividadInput,
} from '../types/activity';
import { activitiesService } from '../services/activitiesService';

export function useActivities(idUsuario?: string) {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<FiltroActividad>('todas');
  const [, startTransition] = useTransition();

  useEffect(() => {
    let montado = true;

    const cargar = async () => {
      try {
        setCargando(true);
        setError(null);

        // Si hay un usuario autenticado, traemos solo sus actividades asignadas;
        // de lo contrario todas (para el Dashboard de docente/admin)
        const datos = idUsuario
          ? await activitiesService.obtenerPorUsuario(idUsuario)
          : await activitiesService.obtenerTodas();

        if (montado) {
          setActividades(datos);
        }
      } catch (err) {
        if (montado) {
          setError('No se pudieron cargar las actividades. Verifica tu conexión.');
          console.error(err);
        }
      } finally {
        if (montado) {
          setCargando(false);
        }
      }
    };

    void cargar();

    return () => {
      montado = false;
    };
  }, [idUsuario]);

  const agregarActividad = async (input: NuevaActividadInput) => {
    const nueva = await activitiesService.crear(input, idUsuario);
    startTransition(() => {
      setActividades((prev) => [nueva, ...prev]);
    });
    return nueva;
  };

  const editarActividad = async (id: string, cambios: ActualizarActividadInput) => {
    const actualizada = await activitiesService.actualizar(id, cambios);
    startTransition(() => {
      setActividades((prev) =>
        prev.map((act) =>
          // La categoría no se guarda en Supabase; conservamos la que ya mostraba la UI
          act.id === id ? { ...actualizada, categoria: act.categoria } : act
        )
      );
    });
    return actualizada;
  };

  const cambiarEstado = async (id: string, nuevoEstado: EstadoActividad) => {
    const anterior = actividades.find((act) => act.id === id);
    if (!anterior) return;

    // Optimistic update
    setError(null);
    startTransition(() => {
      setActividades((prev) =>
        prev.map((act) => (act.id === id ? { ...act, estado: nuevoEstado } : act))
      );
    });

    try {
      await activitiesService.actualizarEstado(id, nuevoEstado);
    } catch (err) {
      // Revertimos si Supabase rechaza el cambio
      setActividades((prev) =>
        prev.map((act) => (act.id === id ? { ...act, estado: anterior.estado } : act))
      );
      setError('No se pudo cambiar el estado de la actividad. Inténtalo de nuevo.');
      console.error(err);
    }
  };

  const eliminarActividad = async (id: string) => {
    const indice = actividades.findIndex((act) => act.id === id);
    if (indice === -1) return;
    const eliminada = actividades[indice];

    // Optimistic update
    setError(null);
    startTransition(() => {
      setActividades((prev) => prev.filter((act) => act.id !== id));
    });

    try {
      await activitiesService.eliminar(id);
    } catch (err) {
      // Restauramos la actividad en su posición original
      setActividades((prev) => [...prev.slice(0, indice), eliminada, ...prev.slice(indice)]);
      setError('No se pudo eliminar la actividad. Inténtalo de nuevo.');
      console.error(err);
    }
  };

  const conteos = {
    todas: actividades.length,
    proximo: actividades.filter((a) => a.estado === 'proximo').length,
    progreso: actividades.filter((a) => a.estado === 'progreso').length,
    finalizado: actividades.filter((a) => a.estado === 'finalizado').length,
  };

  return {
    actividades,
    cargando,
    error,
    filtro,
    setFiltro,
    agregarActividad,
    editarActividad,
    cambiarEstado,
    eliminarActividad,
    conteos,
  };
}
