import type { Actividad } from '../types/activity';

export const ACTIVIDADES_INICIALES: Actividad[] = [
  {
    id: 'act-1',
    titulo: 'Revisar documentación técnica de la API',
    categoria: 'Trabajo',
    fecha: '2026-11-03',
    estado: 'proximo',
  },
  {
    id: 'act-2',
    titulo: 'Planificar entregable de arquitectura de software',
    categoria: 'Estudio',
    fecha: '2026-11-04',
    estado: 'proximo',
  },
  {
    id: 'act-3',
    titulo: 'Implementar interfaz con diseño «Fósforo»',
    categoria: 'Trabajo',
    fecha: '2026-11-02',
    estado: 'progreso',
  },
  {
    id: 'act-4',
    titulo: 'Leer capítulo 4 de Sistemas Distribuidos',
    categoria: 'Estudio',
    fecha: '2026-11-02',
    estado: 'progreso',
  },
  {
    id: 'act-5',
    titulo: 'Definir paleta monocromática y tokens de color',
    categoria: 'Personal',
    fecha: '2026-11-01',
    estado: 'finalizado',
  },
  {
    id: 'act-6',
    titulo: 'Configurar entorno y servidor de desarrollo',
    categoria: 'Trabajo',
    fecha: '2026-10-31',
    estado: 'finalizado',
  },
];
