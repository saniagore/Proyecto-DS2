import React, { useMemo, useState } from 'react';
import type { Actividad, EstadoActividad } from '../types/activity';
import { agruparActividadesPorFecha, crearDiasCalendario } from '../utils/calendar';
import { formatearFechaCorta, obtenerFechaHoyISO } from '../utils/dates';
import './CalendarView.css';

const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const ETIQUETAS_ESTADO: Record<EstadoActividad, string> = {
  proximo: 'Pendiente',
  progreso: 'En progreso',
  finalizado: 'Completada',
};

interface CalendarViewProps {
  actividades: Actividad[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ actividades }) => {
  const [mesVisible, setMesVisible] = useState(() => new Date());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(obtenerFechaHoyISO());
  const dias = useMemo(() => crearDiasCalendario(mesVisible), [mesVisible]);
  const porFecha = useMemo(() => agruparActividadesPorFecha(actividades), [actividades]);
  const seleccionadas = porFecha[fechaSeleccionada] ?? [];
  const etiquetaMes = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(
    mesVisible
  );

  const cambiarMes = (desplazamiento: number) => {
    setMesVisible(
      (actual) => new Date(actual.getFullYear(), actual.getMonth() + desplazamiento, 1)
    );
  };

  return (
    <section className="rumbo-calendar" aria-label="Calendario de entregas">
      <header className="rumbo-calendar__header">
        <div>
          <h2>Calendario de entregas</h2>
          <p>Consulta las fechas límite y selecciona un día para ver sus actividades.</p>
        </div>
        <div className="rumbo-calendar__controls" aria-label="Cambiar mes">
          <button type="button" onClick={() => cambiarMes(-1)} aria-label="Mes anterior">
            ‹
          </button>
          <span aria-live="polite">{etiquetaMes}</span>
          <button type="button" onClick={() => cambiarMes(1)} aria-label="Mes siguiente">
            ›
          </button>
        </div>
      </header>

      <div className="rumbo-calendar__weekdays" aria-hidden="true">
        {DIAS_SEMANA.map((dia) => (
          <span key={dia}>{dia}</span>
        ))}
      </div>
      <div className="rumbo-calendar__grid">
        {dias.map((dia) => {
          const actividadesDia = porFecha[dia.iso] ?? [];
          const esHoy = dia.iso === obtenerFechaHoyISO();
          const seleccionada = dia.iso === fechaSeleccionada;
          return (
            <button
              type="button"
              key={dia.iso}
              className={`rumbo-calendar__day ${!dia.perteneceAlMes ? 'rumbo-calendar__day--outside' : ''} ${esHoy ? 'rumbo-calendar__day--today' : ''} ${seleccionada ? 'rumbo-calendar__day--selected' : ''}`}
              onClick={() => setFechaSeleccionada(dia.iso)}
              aria-pressed={seleccionada}
              aria-label={`${dia.fecha.getDate()} de ${etiquetaMes}, ${actividadesDia.length} actividades`}
            >
              <span className="rumbo-calendar__day-number">{dia.fecha.getDate()}</span>
              <span className="rumbo-calendar__events">
                {actividadesDia.slice(0, 2).map((actividad) => (
                  <span
                    key={actividad.id}
                    className={`rumbo-calendar__event rumbo-calendar__event--${actividad.estado}`}
                    title={actividad.titulo}
                  >
                    {actividad.titulo}
                  </span>
                ))}
                {actividadesDia.length > 2 && (
                  <span className="rumbo-calendar__more">+{actividadesDia.length - 2} más</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rumbo-calendar__selected-day" aria-live="polite">
        <strong>{formatearFechaCorta(fechaSeleccionada)}</strong>
        {seleccionadas.length ? (
          <ul>
            {seleccionadas.map((actividad) => (
              <li key={actividad.id}>
                <span
                  className={`rumbo-calendar__status-dot rumbo-calendar__status-dot--${actividad.estado}`}
                />
                {actividad.titulo} - {ETIQUETAS_ESTADO[actividad.estado]}
              </li>
            ))}
          </ul>
        ) : (
          <span>No hay entregas para esta fecha.</span>
        )}
      </div>
    </section>
  );
};
