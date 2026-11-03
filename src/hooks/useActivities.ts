import { useEffect, useState, useTransition } from 'react';
import type {
  Actividad,
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
    const nueva = await activitiesService.crear(input);
    startTransition(() => {
      setActividades((prev) => [nueva, ...prev]);
    });
    return nueva;
  };

  const cambiarEstado = async (id: string, nuevoEstado: EstadoActividad) => {
    // Optimistic update
    startTransition(() => {
      setActividades((prev) =>
        prev.map((act) => (act.id === id ? { ...act, estado: nuevoEstado } : act))
      );
    });
    await activitiesService.actualizarEstado(id, nuevoEstado);
  };

  const eliminarActividad = async (id: string) => {
    // Optimistic update
    startTransition(() => {
      setActividades((prev) => prev.filter((act) => act.id !== id));
    });
    await activitiesService.eliminar(id);
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
    cambiarEstado,
    eliminarActividad,
    conteos,
  };
}
