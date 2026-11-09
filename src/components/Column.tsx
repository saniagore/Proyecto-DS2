import React from 'react';
import type { Actividad, ActualizarActividadInput, EstadoActividad } from '../types/activity';
import { TaskCard } from './TaskCard';
import './Column.css';

export interface ColumnProps {
  id: EstadoActividad;
  titulo: string;
  actividades: Actividad[];
  onCambiarEstado: (id: string, nuevoEstado: EstadoActividad) => void;
  onEliminar: (id: string) => void;
  onEditar: (id: string, cambios: ActualizarActividadInput) => Promise<unknown>;
}

export const Column: React.FC<ColumnProps> = ({
  id,
  titulo,
  actividades,
  onCambiarEstado,
  onEliminar,
  onEditar,
}) => {
  return (
    <section className={`rumbo-column rumbo-column--${id}`} aria-labelledby={`col-heading-${id}`}>
      <header className="rumbo-column__header">
        <div className="rumbo-column__header-left">
          <span className="rumbo-column__dot" aria-hidden="true" />
          <h3 id={`col-heading-${id}`} className="rumbo-column__title">
            {titulo}
          </h3>
        </div>
        <span className="rumbo-column__count" aria-label={`${actividades.length} actividades`}>
          {actividades.length}
        </span>
      </header>

      <div className="rumbo-column__content">
        {actividades.length === 0 ? (
          <div className="rumbo-column__empty" role="note">
            <p>Nada por aquí. Mueve una actividad a este estado.</p>
          </div>
        ) : (
          <div className="rumbo-column__list">
            {actividades.map((act) => (
              <TaskCard
                key={act.id}
                actividad={act}
                onCambiarEstado={onCambiarEstado}
                onEliminar={onEliminar}
                onEditar={onEditar}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
