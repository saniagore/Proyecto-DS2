import React from 'react';
import type { Actividad, EstadoActividad } from '../types/activity';
import { formatearFechaCorta } from '../utils/dates';
import { Button } from './Button';
import './TaskCard.css';

export interface TaskCardProps {
  actividad: Actividad;
  onCambiarEstado: (id: string, nuevoEstado: EstadoActividad) => void;
  onEliminar: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ actividad, onCambiarEstado, onEliminar }) => {
  const { id, titulo, categoria, fecha, estado } = actividad;
  const fechaFormateada = formatearFechaCorta(fecha);

  return (
    <article
      className={`rumbo-task-card rumbo-task-card--${estado}`}
      aria-label={`Actividad: ${titulo}`}
    >
      <div className="rumbo-task-card__stripe" aria-hidden="true" />

      <div className="rumbo-task-card__body">
        <h4 className="rumbo-task-card__title">{titulo}</h4>

        <div className="rumbo-task-card__meta">
          <span>{categoria}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={fecha}>{fechaFormateada}</time>
        </div>

        <div className="rumbo-task-card__actions">
          {estado === 'proximo' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onCambiarEstado(id, 'progreso')}
              aria-label={`Iniciar actividad: ${titulo}`}
            >
              Iniciar
            </Button>
          )}

          {estado === 'progreso' && (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={() => onCambiarEstado(id, 'finalizado')}
                aria-label={`Finalizar actividad: ${titulo}`}
              >
                Finalizar
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onCambiarEstado(id, 'proximo')}
                aria-label={`Pausar actividad: ${titulo}`}
              >
                Pausar
              </Button>
            </>
          )}

          {estado === 'finalizado' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onCambiarEstado(id, 'progreso')}
              aria-label={`Reabrir actividad: ${titulo}`}
            >
              Reabrir
            </Button>
          )}

          <Button
            size="sm"
            variant="danger"
            onClick={() => onEliminar(id)}
            aria-label={`Eliminar actividad: ${titulo}`}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </article>
  );
};
