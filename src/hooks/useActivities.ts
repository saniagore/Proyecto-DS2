import { useEffect, useState, useTransition } from 'react';
import type {
  Actividad,
  EstadoActividad,
  FiltroActividad,
  NuevaActividadInput,
} from '../types/activity';
import { activitiesService } from '../services/activitiesService';

export function useActivities() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [filtro, setFiltro] = useState<FiltroActividad>('todas');
  const [, startTransition] = useTransition();

  useEffect(() => {
    let montado = true;
    activitiesService.obtenerTodas().then((datos) => {
      if (montado) {
        setActividades(datos);
        setCargando(false);
      }
    });
    return () => {
      montado = false;
    };
  }, []);

  const agregarActividad = async (input: NuevaActividadInput) => {
    const nueva = await activitiesService.crear(input);
    startTransition(() => {
      setActividades((prev) => [nueva, ...prev]);
    });
    return nueva;
  };

  const cambiarEstado = async (id: string, nuevoEstado: EstadoActividad) => {
    startTransition(() => {
      setActividades((prev) =>
        prev.map((act) => (act.id === id ? { ...act, estado: nuevoEstado } : act))
      );
    });
    await activitiesService.actualizarEstado(id, nuevoEstado);
  };

  const eliminarActividad = async (id: string) => {
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
    filtro,
    setFiltro,
    agregarActividad,
    cambiarEstado,
    eliminarActividad,
    conteos,
  };
}
