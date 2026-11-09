import React, { useState } from 'react';
import type { Actividad, ActualizarActividadInput, EstadoActividad } from '../types/activity';
import { evaluarFechaLimite, formatearFechaCorta } from '../utils/dates';
import { Button } from './Button';
import { Input } from './Input';
import './TaskCard.css';

export interface TaskCardProps {
  actividad: Actividad;
  onCambiarEstado: (id: string, nuevoEstado: EstadoActividad) => void;
  onEliminar: (id: string) => void;
  onEditar: (id: string, cambios: ActualizarActividadInput) => Promise<unknown>;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  actividad,
  onCambiarEstado,
  onEliminar,
  onEditar,
}) => {
  const { id, titulo, descripcion, categoria, fecha, estado } = actividad;
  const fechaFormateada = fecha ? formatearFechaCorta(fecha) : 'Sin fecha límite';
  // Una actividad completada ya no se considera vencida
  const estadoFecha = estado === 'finalizado' ? null : evaluarFechaLimite(fecha);

  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [tituloEdit, setTituloEdit] = useState(titulo);
  const [descripcionEdit, setDescripcionEdit] = useState(descripcion ?? '');
  const [fechaEdit, setFechaEdit] = useState(fecha ?? '');
  const [errorTitulo, setErrorTitulo] = useState<string | null>(null);
  const [errorFecha, setErrorFecha] = useState<string | null>(null);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const abrirEdicion = () => {
    setTituloEdit(titulo);
    setDescripcionEdit(descripcion ?? '');
    setFechaEdit(fecha ?? '');
    setErrorTitulo(null);
    setErrorFecha(null);
    setErrorGuardar(null);
    setEditando(true);
  };

  const handleGuardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const faltaTitulo = !tituloEdit.trim();
    setErrorTitulo(faltaTitulo ? 'Escribe el título de la actividad.' : null);
    setErrorFecha(fechaEdit ? null : 'Elige una fecha límite.');
    if (faltaTitulo || !fechaEdit) return;

    setGuardando(true);
    setErrorGuardar(null);
    try {
      await onEditar(id, {
        titulo: tituloEdit,
        descripcion: descripcionEdit,
        fecha: fechaEdit,
      });
      setEditando(false);
    } catch (err) {
      setErrorGuardar('No se pudieron guardar los cambios. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = () => {
    if (window.confirm(`¿Eliminar la actividad «${titulo}»? Esta acción no se puede deshacer.`)) {
      onEliminar(id);
    }
  };

  if (editando) {
    return (
      <article
        className={`rumbo-task-card rumbo-task-card--${estado}`}
        aria-label={`Editando actividad: ${titulo}`}
      >
        <div className="rumbo-task-card__stripe" aria-hidden="true" />

        <form className="rumbo-task-card__body" onSubmit={handleGuardar} noValidate>
          <Input
            id={`editar-titulo-${id}`}
            label="Título"
            type="text"
            value={tituloEdit}
            onChange={(e) => {
              setTituloEdit(e.target.value);
              if (errorTitulo) setErrorTitulo(null);
            }}
            error={errorTitulo}
            required
          />
          <Input
            id={`editar-descripcion-${id}`}
            label="Descripción"
            type="text"
            placeholder="Opcional"
            value={descripcionEdit}
            onChange={(e) => setDescripcionEdit(e.target.value)}
          />
          <Input
            id={`editar-fecha-${id}`}
            label="Fecha límite"
            type="date"
            value={fechaEdit}
            onChange={(e) => {
              setFechaEdit(e.target.value);
              if (errorFecha) setErrorFecha(null);
            }}
            error={errorFecha}
            required
          />

          {errorGuardar && (
            <p className="rumbo-error-text" role="alert">
              {errorGuardar}
            </p>
          )}

          <div className="rumbo-task-card__actions">
            <Button type="submit" size="sm" variant="primary" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEditando(false)}
              disabled={guardando}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article
      className={`rumbo-task-card rumbo-task-card--${estado}`}
      aria-label={`Actividad: ${titulo}`}
    >
      <div className="rumbo-task-card__stripe" aria-hidden="true" />

      <div className="rumbo-task-card__body">
        <h4 className="rumbo-task-card__title">{titulo}</h4>

        {descripcion && <p className="rumbo-task-card__description">{descripcion}</p>}

        <div className="rumbo-task-card__meta">
          <span>{categoria}</span>
          <span aria-hidden="true">·</span>
          {fecha ? <time dateTime={fecha}>{fechaFormateada}</time> : <span>{fechaFormateada}</span>}
          {estadoFecha === 'vencida' && (
            <span className="rumbo-task-card__due rumbo-task-card__due--vencida">Vencida</span>
          )}
          {estadoFecha === 'hoy' && (
            <span className="rumbo-task-card__due rumbo-task-card__due--hoy">Vence hoy</span>
          )}
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
                aria-label={`Completar actividad: ${titulo}`}
              >
                Completar
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
            variant="secondary"
            onClick={abrirEdicion}
            aria-label={`Editar actividad: ${titulo}`}
          >
            Editar
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={handleEliminar}
            aria-label={`Eliminar actividad: ${titulo}`}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </article>
  );
};
