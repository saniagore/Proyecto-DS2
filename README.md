# Proyecto DS2

Aplicación frontend construida con React, TypeScript y Vite, bajo una arquitectura modular y estándares de integración continua (CI/CD).

## Estructura del Proyecto

```text
frontend/
├── .github/workflows/  # Pipelines de CI/CD (GitHub Actions)
├── .husky/             # Git Hooks automáticos (pre-commit, commit-msg)
├── public/             # Archivos públicos servidos sin transformación
├── src/
│   ├── assets/         # Imágenes, iconos y recursos importados
│   ├── components/     # Componentes reutilizables
│   ├── data/           # Datos locales y mocks
│   ├── hooks/          # Hooks personalizados
│   ├── layouts/        # Estructuras compartidas de página
│   ├── pages/          # Vistas principales
│   ├── services/       # API e integraciones externas
│   ├── styles/         # Estilos globales y temas
│   ├── types/          # Tipos compartidos
│   ├── utils/          # Utilidades puras
│   ├── App.tsx         # Composición principal
│   └── main.tsx        # Punto de entrada
├── Dockerfile          # Multi-stage build optimizado para producción (Nginx Alpine)
├── docker-compose.yml  # Entorno de desarrollo local con recarga en caliente
├── nginx.conf          # Servidor web Nginx para SPA
├── .env.example        # Plantilla de variables de entorno documentadas
├── package.json
└── vite.config.ts
```

## Reglas de Git y Flujo de Trabajo (GitFlow Simplificado)

### 1. Estrategia de Ramas

- **`main`**: Rama de producción protegida. Despliegues estables.
- **`develop`**: Rama de integración continua y staging.
- **Ramas de tareas**:
  - `feat/*`: Nuevas características (ej: `feat/login-form`).
  - `fix/*`: Corrección de errores (ej: `fix/button-alignment`).
  - `chore/*`: Mantenimiento, dependencias o infraestructura (ej: `chore/ci-pipeline`).
  - `docs/*`: Documentación (ej: `docs/architecture-guide`).

### 2. Convención de Commits (Conventional Commits)

Los commits se validan automáticamente con **Commitlint**:
Formato: `<tipo>(<alcance>): <descripción>`

- Tipos válidos: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `ci`, `build`, `revert`.
- Ejemplo: `feat(auth): add user login with validation`

### 3. Git Hooks Automáticos

- **`pre-commit`**: Formatea archivos con Prettier y verifica tipos TypeScript (`tsc --noEmit`).
- **`commit-msg`**: Comprueba que el mensaje respete Conventional Commits.

## Comandos Disponibles

```bash
# Desarrollo local
npm install
npm run dev

# Calidad y Formato
npm run lint          # Análisis estático con ESLint
npm run format:check  # Verificación de formato con Prettier
npm run format        # Autoformateo de código
npm run type-check    # Verificación de tipos TypeScript

# Pruebas y Compilación
npm test              # Pruebas unitarias con Vitest
npm run build         # Build optimizado para producción
npm run preview       # Previsualizar build de producción

# Docker
docker compose up -d  # Levantar entorno de desarrollo en contenedores
```
