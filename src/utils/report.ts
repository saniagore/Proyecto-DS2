import { jsPDF } from 'jspdf';
import type { Actividad } from '../types/activity';

export interface ResumenActividades {
  total: number;
  pendientes: number;
  enProgreso: number;
  completadas: number;
  sinFecha: number;
}

export function crearResumen(actividades: Actividad[]): ResumenActividades {
  return {
    total: actividades.length,
    pendientes: actividades.filter((actividad) => actividad.estado === 'proximo').length,
    enProgreso: actividades.filter((actividad) => actividad.estado === 'progreso').length,
    completadas: actividades.filter((actividad) => actividad.estado === 'finalizado').length,
    sinFecha: actividades.filter((actividad) => !actividad.fecha).length,
  };
}

function textoSeguro(valor: string, limite = 82): string {
  const texto = valor.replace(/\s+/g, ' ').trim();
  return texto.length > limite ? `${texto.slice(0, limite - 3)}...` : texto;
}

export function exportarResumenPdf(actividades: Actividad[], nombreUsuario: string): void {
  const documento = new jsPDF({ unit: 'mm', format: 'a4' });
  const resumen = crearResumen(actividades);
  const generadoEn = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date());

  documento.setFillColor(255, 176, 0);
  documento.rect(0, 0, 210, 28, 'F');
  documento.setTextColor(25, 25, 25);
  documento.setFont('helvetica', 'bold');
  documento.setFontSize(22);
  documento.text('Rumbo - Resumen de actividades', 16, 17);
  documento.setFontSize(10);
  documento.setFont('helvetica', 'normal');
  documento.text(`Preparado para: ${textoSeguro(nombreUsuario, 44)}`, 16, 24);

  documento.setTextColor(45, 45, 45);
  documento.setFontSize(10);
  documento.text(`Generado: ${generadoEn}`, 16, 38);
  documento.setFont('helvetica', 'bold');
  documento.setFontSize(15);
  documento.text('Estado general', 16, 50);
  documento.setFont('helvetica', 'normal');
  documento.setFontSize(11);
  const metricas = [
    `Total: ${resumen.total}`,
    `Pendientes: ${resumen.pendientes}`,
    `En progreso: ${resumen.enProgreso}`,
    `Completadas: ${resumen.completadas}`,
    `Sin fecha límite: ${resumen.sinFecha}`,
  ];
  metricas.forEach((metrica, indice) =>
    documento.text(metrica, 16 + (indice % 2) * 85, 61 + Math.floor(indice / 2) * 8)
  );

  documento.setFont('helvetica', 'bold');
  documento.setFontSize(15);
  documento.text('Detalle de actividades', 16, 91);
  documento.setFontSize(9);
  documento.text('Actividad', 16, 99);
  documento.text('Categoría', 105, 99);
  documento.text('Estado', 138, 99);
  documento.text('Fecha límite', 169, 99);
  documento.setDrawColor(180, 180, 180);
  documento.line(16, 102, 194, 102);

  let y = 109;
  const ordenadas = [...actividades].sort((a, b) =>
    (a.fecha ?? '9999-99-99').localeCompare(b.fecha ?? '9999-99-99')
  );
  ordenadas.forEach((actividad, indice) => {
    if (y > 278) {
      documento.addPage();
      y = 20;
      documento.setFont('helvetica', 'bold');
      documento.text('Detalle de actividades (continuación)', 16, y);
      y += 10;
      documento.setFont('helvetica', 'normal');
    }
    documento.setFont('helvetica', 'normal');
    documento.text(textoSeguro(actividad.titulo, 48), 16, y);
    documento.text(textoSeguro(actividad.categoria, 19), 105, y);
    documento.text(
      actividad.estado === 'proximo'
        ? 'Pendiente'
        : actividad.estado === 'progreso'
          ? 'En progreso'
          : 'Completada',
      138,
      y
    );
    documento.text(actividad.fecha ?? 'Sin fecha', 169, y);
    if (indice < ordenadas.length - 1) documento.line(16, y + 3, 194, y + 3);
    y += 8;
  });

  if (ordenadas.length === 0) {
    documento.setFont('helvetica', 'normal');
    documento.text('No hay actividades para incluir en este reporte.', 16, 109);
  }

  documento.save(`resumen-rumbo-${new Date().toISOString().slice(0, 10)}.pdf`);
}
