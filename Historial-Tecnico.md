# 📋 Historial Técnico — CloudSyncPro

> Este archivo registra todos los pasos, decisiones técnicas, configuraciones y funcionalidades implementadas durante el desarrollo de CloudSyncPro. Se actualiza en cada paso del proceso de construcción.

---

## ✅ PASO 1 — Scaffolding e infraestructura base

**Commit sugerido:** `chore: initial project scaffold with Vite, React, TypeScript and Tailwind v4`

### Acciones realizadas

- Proyecto creado con `npm create vite@latest` usando template `react-ts`
- Instalado **Tailwind CSS v4** usando el plugin oficial `@tailwindcss/vite` (NO usa `tailwind.config.js` — configuración vía CSS directamente)
- Instaladas todas las dependencias del stack:
  - `@supabase/supabase-js` — cliente Supabase
  - `@tanstack/react-query` v5 — server state management
  - `zustand` — client state management
  - `react-router-dom` — routing
  - `recharts` — gráficos y analytics
  - `lucide-react` — iconos
  - `sonner` — toast notifications
  - `class-variance-authority` + `clsx` + `tailwind-merge` — utilidades de estilos
  - `react-dropzone` — drag & drop de archivos
  - `date-fns` — manipulación de fechas
  - `zod` — validación de esquemas
- **shadcn/ui** inicializado con `npx shadcn@latest init`
- `tsconfig.app.json` configurado en modo estricto (`strict: true`, `noUnusedLocals`, `noImplicitReturns`, etc.)
- Path alias `@/` configurado en `tsconfig.app.json`, `tsconfig.json` raíz y `vite.config.ts`
- `vite.config.ts` configurado con plugin de Tailwind y alias de paths
- Design tokens definidos en `src/index.css` con variables CSS para light y dark mode
- Paleta de colores implementada: azul corporativo `#0A2540`, negro `#111111`, grises, blanco
- Animaciones utilitarias globales: `fade-in`, `slide-in-right`, `scale-in`
- Scrollbar personalizado
- Estructura de carpetas creada: `components/`, `pages/`, `hooks/`, `store/`, `services/`, `lib/`, `types/`, `utils/`, `routes/`
- `src/lib/utils.ts` con función `cn()` (clsx + tailwind-merge)
- `.env.example` con variables de entorno documentadas
- `README.md` completo con instrucciones de instalación, stack y estructura
- `Historial-Tecnico.md` creado (este archivo)

### Estructura de carpetas
src/
├── components/
│   ├── ui/          # shadcn/ui auto-generados
│   ├── layout/      # AppShell, Sidebar, Header
│   └── shared/      # Componentes reutilizables
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── files/
│   ├── workspaces/
│   ├── settings/
│   └── admin/
├── hooks/
├── store/
├── services/
├── lib/
├── types/
├── utils/
└── routes/

### Variables de entorno requeridas

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anon pública de Supabase |
| `R2_ACCOUNT_ID` | ID de cuenta Cloudflare (solo Edge Functions) |
| `R2_ACCESS_KEY_ID` | Access Key de R2 (solo Edge Functions) |
| `R2_SECRET_ACCESS_KEY` | Secret Key de R2 (solo Edge Functions) |
| `R2_BUCKET_NAME` | Nombre del bucket R2 |
| `R2_PUBLIC_URL` | URL pública del bucket R2 |

### Decisiones técnicas clave

- **Tailwind v4**: No usa `tailwind.config.js`. Toda la configuración de colores y tokens se hace con variables CSS en `index.css` usando `@layer base`
- **shadcn/ui**: Inicializado con preset Nova / Radix, base color Slate, CSS variables activadas
- **TypeScript strict**: `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly` habilitados
- **Dark mode**: Se maneja vía clase `.dark` en el `<html>` element (estrategia de shadcn/ui)
- **`exactOptionalPropertyTypes`**: Omitido intencionalmente para evitar fricciones con librerías externas

### Correcciones adicionales durante Paso 1

**Problema:** `npx shadcn@latest init` fallaba con "No import alias found in your tsconfig.json file"
**Causa:** shadcn busca `paths` en el `tsconfig.json` raíz, que solo tenía `references`
**Solución:** Agregar `compilerOptions.paths` al `tsconfig.json` raíz (además de mantenerlo en `tsconfig.app.json`)

**Problema:** `tsconfig.app.json` tenía `"baseUrl": "."` que TypeScript marcaba como deprecado
**Causa:** Con `moduleResolution: "bundler"`, `baseUrl` ya no es necesario para usar `paths`
**Solución:** Eliminar `baseUrl`, dejar solo `paths`

**shadcn/ui instalado correctamente:**
- `components.json` generado en la raíz
- Preset: Nova / Radix
- Base color: Slate
- CSS variables: Yes
- Alias configurado: `@/components`, `@/lib/utils`, `@/hooks`
- Primer componente verificado: `button.tsx` ✅

---

## ✅ PASO 2 — Supabase client + Auth Store + React Query + App base

**Commit sugerido:** `feat: add Supabase client, auth store, React Query setup and base routing`

### Acciones realizadas

- `src/lib/supabase.ts` — cliente Supabase tipado con `Database` type
- `src/lib/query-client.ts` — configuración global de React Query con defaults optimizados
- `src/types/auth.types.ts` — tipos `UserProfile`, `AuthState`, `AuthActions`, `AuthStore`
- `src/store/auth.store.ts` — Zustand store para autenticación con devtools
- `src/hooks/use-auth.ts` — `useAuthInitializer()` y `useAuth()` hook
- `src/main.tsx` — entry point con `QueryClientProvider`, `Toaster` (sonner) y `ReactQueryDevtools`
- `src/App.tsx` — app base con `BrowserRouter` y `AuthProvider`
- `src/routes/app.routes.tsx` — rutas base con `ProtectedRoute` y `PublicRoute`

### Decisiones técnicas clave

- `useAuthStore.getState()` dentro del `useEffect` para evitar infinite loops por recreación de funciones
- Suscripción a valores primitivos individuales en Zustand (`useAuthStore((s) => s.valor)`) en lugar de objetos para evitar re-renders infinitos
- `onAuthStateChange` maneja todos los eventos de sesión de Supabase en tiempo real
- `refetchOnWindowFocus` deshabilitado en desarrollo, habilitado en producción
- Queries: `staleTime` 1 min, `gcTime` 5 min, `retry` 1
- Mutations: `retry` 0

### Correcciones durante Paso 2

**Problema:** Infinite loop — "Maximum update depth exceeded" en `ProtectedRoute` y `PublicRoute`
**Causa 1:** `useAuth()` retornaba un objeto nuevo en cada render como dependencia del useEffect
**Solución 1:** Usar `useAuthStore.getState()` dentro del `useEffect` con array de dependencias vacío
**Causa 2:** `useAuth()` retornaba objeto completo causando re-renders en rutas
**Solución 2:** Suscribirse a valores primitivos individuales en cada componente de ruta

---

## ✅ PASO 3 — Esquema de base de datos en Supabase

**Commit sugerido:** `feat: add complete database schema and TypeScript types`

### Acciones realizadas

- Esquema completo ejecutado en Supabase SQL Editor en 6 scripts
- Tipos TypeScript actualizados en `src/types/database.types.ts`

### Tablas creadas

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfil de usuario, linked 1:1 con `auth.users` |
| `workspaces` | Espacios de trabajo por equipo/proyecto |
| `workspace_members` | Miembros de cada workspace con su rol |
| `folders` | Carpetas jerárquicas con soporte a subcarpetas |
| `files` | Archivos con referencia a Cloudflare R2 |
| `file_versions` | Historial de versiones por archivo |
| `file_shares` | Compartir archivos/carpetas por usuario, rol o link público |
| `activity_logs` | Auditoría completa de acciones |
| `notifications` | Notificaciones por usuario |

### Extensiones habilitadas

- `uuid-ossp` — generación de UUIDs
- `pgcrypto` — tokens seguros para shares
- `pg_trgm` — búsqueda full-text por similitud
- `vector` — búsqueda semántica con pgvector

### ENUMs creados

- `user_role`: superadmin, admin, editor, viewer
- `file_status`: active, archived, deleted
- `permission_type`: view, edit, delete, share
- `activity_action`: upload, download, view, move, rename, delete, archive, restore, share, unshare, create_folder, update_metadata, create_version
- `share_type`: user, role, public

### Funciones SQL creadas

- `handle_updated_at()` — trigger para auto-actualizar `updated_at`
- `handle_new_user()` — trigger para auto-crear perfil al registrarse
- `search_files()` — búsqueda full-text con filtros avanzados
- `get_workspace_stats()` — estadísticas de uso por workspace

### RLS habilitado en todas las tablas

- Viewers solo pueden leer
- Editors pueden crear y modificar
- Admins pueden eliminar y gestionar miembros
- Superadmins tienen acceso total

### Decisiones técnicas

- `files.r2_key` es único — identifica el objeto en Cloudflare R2
- `files.embedding vector(1536)` — listo para búsqueda semántica con OpenAI embeddings
- `file_shares.token` — generado con `gen_random_bytes(32)` para links públicos seguros
- `shared_role` en `file_shares` es un enum sin FK — permite compartir por rol sin referenciar un usuario específico

### Correcciones durante Paso 3

**Problema:** Error al crear `file_shares` — "foreign key constraint cannot be implemented, incompatible types: user_role and uuid"
**Causa:** `shared_role` tenía una FK a `profiles(id)` siendo de tipo `user_role` (enum), no `uuid`
**Solución:** Eliminar la FK de `shared_role`, dejarlo como enum simple sin referencia

---

## 🔜 PRÓXIMOS PASOS

- **Paso 4:** Páginas de autenticación (Login + Google OAuth)
- **Paso 5:** Layout principal (AppShell, Sidebar, Header)
- **Paso 6:** Sistema de workspaces
- **Paso 7:** Explorador de archivos y carpetas
- **Paso 8:** Upload a Cloudflare R2 (Edge Function + presigned URLs)
- **Paso 9:** Preview de archivos
- **Paso 10:** Búsqueda avanzada
- **Paso 11:** Compartir archivos y links públicos
- **Paso 12:** Dashboard con Recharts
- **Paso 13:** Notificaciones en tiempo real
- **Paso 14:** Panel de administración
- **Paso 15:** Auditoría de actividad