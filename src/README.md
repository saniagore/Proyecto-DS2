# Organización de `src`

- `assets/`: imágenes, iconos y otros recursos importados por la aplicación.
- `components/`: componentes reutilizables y aislados de la interfaz.
- `data/`: datos locales, mocks y catálogos estáticos.
- `hooks/`: hooks personalizados de React.
- `layouts/`: estructuras compartidas de página, como encabezado y navegación.
- `pages/`: vistas principales asociadas a una ruta o flujo.
- `services/`: acceso a API, persistencia y otras integraciones externas.
- `styles/`: estilos globales, tokens y temas adicionales.
- `types/`: tipos e interfaces compartidos.
- `utils/`: funciones puras y utilidades generales.

`App.tsx` coordina la aplicación y `main.tsx` es el punto de entrada. Cuando una vista
crezca, conviene moverla a `pages/` y dejar en `App.tsx` únicamente la composición
principal o el enrutamiento.
