import type { Actividad, EstadoActividad, NuevaActividadInput } from '../types/activity';
import { ACTIVIDADES_INICIALES } from '../data/mockActivities';

const STORAGE_KEY = 'rumbo_actividades_v1';

// Almacenamiento en memoria como respaldo cuando localStorage no esté disponible (por ejemplo en tests)
const memoriaFallback = new Map<string, string>();

function obtenerItem(clave: string): string | null {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(clave);
  }
  return memoriaFallback.get(clave) || null;
}

function guardarItem(clave: string, valor: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(clave, valor);
  } else {
    memoriaFallback.set(clave, valor);
  }
}

export const activitiesService = {
  async obtenerTodas(): Promise<Actividad[]> {
    try {
      const data = obtenerItem(STORAGE_KEY);
      if (!data) {
        guardarItem(STORAGE_KEY, JSON.stringify(ACTIVIDADES_INICIALES));
        return ACTIVIDADES_INICIALES;
      }
      return JSON.parse(data) as Actividad[];
    } catch {
      return ACTIVIDADES_INICIALES;
    }
  },

  async crear(input: NuevaActividadInput): Promise<Actividad> {
    const actividades = await this.obtenerTodas();
    const nueva: Actividad = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      titulo: input.titulo.trim(),
      categoria: input.categoria,
      fecha: input.fecha,
      estado: 'proximo', // Toda actividad nueva entra en 'proximo'
    };
    const actualizadas = [nueva, ...actividades];
    guardarItem(STORAGE_KEY, JSON.stringify(actualizadas));
    return nueva;
  },

  async actualizarEstado(id: string, nuevoEstado: EstadoActividad): Promise<Actividad[]> {
    const actividades = await this.obtenerTodas();
    const actualizadas = actividades.map((act) =>
      act.id === id ? { ...act, estado: nuevoEstado } : act
    );
    guardarItem(STORAGE_KEY, JSON.stringify(actualizadas));
    return actualizadas;
  },

  async eliminar(id: string): Promise<Actividad[]> {
    const actividades = await this.obtenerTodas();
    const actualizadas = actividades.filter((act) => act.id !== id);
    guardarItem(STORAGE_KEY, JSON.stringify(actualizadas));
    return actualizadas;
  },

  limpiarMemoria(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    memoriaFallback.clear();
  },
};
