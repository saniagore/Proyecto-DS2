import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Column } from '../components/Column';
import { Input } from '../components/Input';
import { useActivities } from '../hooks/useActivities';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from '../hooks/useRouter';
import type { CategoriaActividad, FiltroActividad } from '../types/activity';
import { formatearFechaHoy, obtenerFechaHoyISO } from '../utils/dates';
import './DashboardPage.css';

const CATEGORIAS: CategoriaActividad[] = ['Trabajo', 'Estudio', 'Personal'];

interface FiltroItem {
  id: FiltroActividad;
  label: string;
}

const FILTROS: FiltroItem[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'proximo', label: 'Próximos' },
  { id: 'progreso', label: 'En progreso' },
  { id: 'finalizado', label: 'Finalizados' },
];

export const DashboardPage: React.FC = () => {
  const { usuario, logout } = useAuth();
  const { navigate } = useRouter();
  const {
    actividades,
    cargando,
    error,
    filtro,
    setFiltro,
    agregarActividad,
    cambiarEstado,
    eliminarActividad,
    conteos,
  } = useActivities(usuario?.id);

  // Estado para el formulario de nueva actividad
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState<CategoriaActividad>('Trabajo');
  const [fecha, setFecha] = useState(obtenerFechaHoyISO());
  const [errorTitulo, setErrorTitulo] = useState<string | null>(null);

  const handleCerrarSesion = async () => {
    await logout();
    navigate('/login');
  };

  const handleAgregar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!titulo.trim()) {
      setErrorTitulo('Escribe el título de la actividad.');
      return;
    }

    setErrorTitulo(null);
    await agregarActividad({
      titulo: titulo.trim(),
      categoria,
      fecha: fecha || obtenerFechaHoyISO(),
    });

    setTitulo('');
  };

  const fechaDeHoy = formatearFechaHoy();
  const nombreUsuario = usuario?.nombre || 'Santiago';

  const actividadesProximas = actividades.filter((a) => a.estado === 'proximo');
  const actividadesProgreso = actividades.filter((a) => a.estado === 'progreso');
  const actividadesFinalizadas = actividades.filter((a) => a.estado === 'finalizado');

  return (
    <div className="rumbo-dashboard-layout">
      {/* Barra lateral fija (230px) */}
      <aside className="rumbo-sidebar" aria-label="Navegación principal">
        <div className="rumbo-sidebar__top">
          <div className="rumbo-brand-logo" aria-label="Logo Rumbo">
            <span className="rumbo-brand-logo__mark" aria-hidden="true">
              ■
            </span>
            <span className="rumbo-brand-logo__text">Rumbo</span>
          </div>

          <nav className="rumbo-sidebar__nav" aria-label="Filtros de actividades">
            <ul className="rumbo-sidebar__list">
              {FILTROS.map((f) => {
                const activo = filtro === f.id;
                const count = conteos[f.id];

                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      className={`rumbo-sidebar__filter-btn ${
                        activo ? 'rumbo-sidebar__filter-btn--active' : ''
                      }`}
                      onClick={() => setFiltro(f.id)}
                      aria-pressed={activo}
                    >
                      <span className="rumbo-sidebar__filter-name">{f.label}</span>
                      <span className="rumbo-sidebar__filter-count">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="rumbo-sidebar__bottom">
          <div className="rumbo-sidebar__user">
            <span className="rumbo-sidebar__user-name" title={nombreUsuario}>
              {nombreUsuario}
            </span>
            <Button
              variant="text"
              size="sm"
              onClick={handleCerrarSesion}
              aria-label="Cerrar sesión y volver al inicio"
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Área de trabajo */}
      <main className="rumbo-workspace">
        {/* 1. Saludo y fecha de hoy */}
        <header className="rumbo-workspace__header">
          <h1 className="rumbo-workspace__greeting">Hola, {nombreUsuario}</h1>
          <p className="rumbo-workspace__date">{fechaDeHoy}</p>
        </header>

        {/* 2. Tres tarjetas de estadísticas */}
        <section className="rumbo-stats-grid" aria-label="Estadísticas de actividades">
          <Card padding="md" className="rumbo-stat-card">
            <div className="rumbo-stat-card__header">
              <span
                className="rumbo-stat-card__dot rumbo-stat-card__dot--proximo"
                aria-hidden="true"
              />
              <span className="rumbo-stat-card__label">Próximos</span>
            </div>
            <p className="rumbo-stat-card__value">{conteos.proximo}</p>
          </Card>

          <Card padding="md" className="rumbo-stat-card">
            <div className="rumbo-stat-card__header">
              <span
                className="rumbo-stat-card__dot rumbo-stat-card__dot--progreso"
                aria-hidden="true"
              />
              <span className="rumbo-stat-card__label">En progreso</span>
            </div>
            <p className="rumbo-stat-card__value">{conteos.progreso}</p>
          </Card>

          <Card padding="md" className="rumbo-stat-card">
            <div className="rumbo-stat-card__header">
              <span
                className="rumbo-stat-card__dot rumbo-stat-card__dot--finalizado"
                aria-hidden="true"
              />
              <span className="rumbo-stat-card__label">Finalizados</span>
            </div>
            <p className="rumbo-stat-card__value">{conteos.finalizado}</p>
          </Card>
        </section>

        {/* Indicador de carga y error de Supabase */}
        {cargando && (
          <p className="rumbo-loading" role="status" aria-live="polite">
            Cargando actividades…
          </p>
        )}
        {error && !cargando && (
          <p className="rumbo-error" role="alert">
            {error}
          </p>
        )}

        {/* 3. Formulario para agregar una actividad */}
        <Card padding="md" className="rumbo-add-card">
          <h2 className="rumbo-add-card__title">Nueva actividad</h2>
          <form onSubmit={handleAgregar} className="rumbo-add-form" noValidate>
            <div className="rumbo-add-form__fields">
              <div className="rumbo-add-form__field-title">
                <Input
                  id="nueva-actividad-titulo"
                  label="Nueva actividad"
                  type="text"
                  placeholder="Ej. Rediseñar vista de inicio"
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value);
                    if (errorTitulo) setErrorTitulo(null);
                  }}
                  error={errorTitulo}
                  required
                />
              </div>

              <div className="rumbo-field rumbo-add-form__field-category">
                <label htmlFor="nueva-actividad-categoria" className="rumbo-label">
                  Categoría
                </label>
                <select
                  id="nueva-actividad-categoria"
                  className="rumbo-select"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as CategoriaActividad)}
                >
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rumbo-add-form__field-date">
                <Input
                  id="nueva-actividad-fecha"
                  label="Fecha"
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </div>

              <div className="rumbo-add-form__action">
                <Button type="submit" variant="primary" size="md">
                  Agregar
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* 4. Tablero de columnas (según filtro) */}
        <section className="rumbo-board-section" aria-label="Tablero de actividades">
          <div
            className={`rumbo-board ${
              filtro !== 'todas' ? 'rumbo-board--single-column' : 'rumbo-board--three-columns'
            }`}
          >
            {(filtro === 'todas' || filtro === 'proximo') && (
              <Column
                id="proximo"
                titulo="Próximos"
                actividades={actividadesProximas}
                onCambiarEstado={cambiarEstado}
                onEliminar={eliminarActividad}
              />
            )}

            {(filtro === 'todas' || filtro === 'progreso') && (
              <Column
                id="progreso"
                titulo="En progreso"
                actividades={actividadesProgreso}
                onCambiarEstado={cambiarEstado}
                onEliminar={eliminarActividad}
              />
            )}

            {(filtro === 'todas' || filtro === 'finalizado') && (
              <Column
                id="finalizado"
                titulo="Finalizados"
                actividades={actividadesFinalizadas}
                onCambiarEstado={cambiarEstado}
                onEliminar={eliminarActividad}
              />
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
