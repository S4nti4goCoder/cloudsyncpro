# 📋 Historial Técnico — CloudSyncPro

> Este archivo registra todos los pasos, decisiones técnicas, configuraciones y funcionalidades implementadas durante el desarrollo de CloudSyncPro. Se actualiza en cada paso del proceso de construcción.

---

## ✅ PASO 1 — Scaffolding e infraestructura base

**Commit:** `chore: initial project scaffold with Vite, React, TypeScript and Tailwind v4`

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
| `R2_PUBLIC_URL` | URL pública del bucket R2 (Edge Functions) |
| `VITE_R2_PUBLIC_URL` | URL pública del bucket R2 (Frontend) |

### Decisiones técnicas clave

- **Tailwind v4**: No usa `tailwind.config.js`. Toda la configuración de colores y tokens se hace con variables CSS en `index.css` usando `@layer base`
- **shadcn/ui**: Inicializado con preset Nova / Radix, base color Slate, CSS variables activadas
- **TypeScript strict**: `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly` habilitados
- **Dark mode**: Se maneja vía `@custom-variant dark` en Tailwind v4 con clase `.dark` en el `<html>`
- **`exactOptionalPropertyTypes`**: Omitido intencionalmente para evitar fricciones con librerías externas

### Correcciones durante Paso 1

**Problema:** `npx shadcn@latest init` fallaba con "No import alias found in your tsconfig.json file"
**Causa:** shadcn busca `paths` en el `tsconfig.json` raíz, que solo tenía `references`
**Solución:** Agregar `compilerOptions.paths` al `tsconfig.json` raíz

**Problema:** `tsconfig.app.json` tenía `"baseUrl": "."` que TypeScript marcaba como deprecado
**Causa:** Con `moduleResolution: "bundler"`, `baseUrl` ya no es necesario
**Solución:** Eliminar `baseUrl`, dejar solo `paths`

**shadcn/ui instalado correctamente:**
- Preset: Nova / Radix, Base color: Slate, CSS variables: Yes
- Alias: `@/components`, `@/lib/utils`, `@/hooks` ✅

---

## ✅ PASO 2 — Supabase client + Auth Store + React Query + App base

**Commit:** `feat: add Supabase client, auth store, React Query setup and base routing`

### Acciones realizadas

- `src/lib/supabase.ts` — cliente Supabase tipado con `Database` type
- `src/lib/queryClient.ts` — configuración global de React Query con defaults optimizados
- `src/types/authTypes.ts` — tipos `UserProfile`, `AuthState`, `AuthActions`, `AuthStore`
- `src/store/authStore.ts` — Zustand store para autenticación con devtools
- `src/hooks/useAuth.ts` — `useAuthInitializer()` y `useAuth()` hook
- `src/main.tsx` — entry point con `QueryClientProvider`, `Toaster` (sonner) y `ReactQueryDevtools`
- `src/App.tsx` — app base con `BrowserRouter`, `TooltipProvider` y `AuthProvider`
- `src/routes/AppRouter.tsx` — rutas base con `ProtectedRoute` y `PublicRoute`

### Decisiones técnicas clave

- `useAuthStore.getState()` dentro del `useEffect` para evitar infinite loops
- Suscripción a valores primitivos individuales en Zustand para evitar re-renders infinitos
- `onAuthStateChange` maneja todos los eventos de sesión de Supabase en tiempo real
- El perfil se carga en background sin bloquear la inicialización (`setIsInitialized(true)` inmediato)
- Queries: `staleTime` 1 min, `gcTime` 5 min, `retry` 1 — Mutations: `retry` 0

### Correcciones durante Paso 2

**Problema:** Infinite loop — "Maximum update depth exceeded"
**Causa:** `useAuth()` retornaba objeto completo causando re-renders en rutas
**Solución:** Suscribirse a valores primitivos individuales con `useAuthStore((s) => s.valor)`

**Problema:** Loading infinito en dashboard después de login
**Causa:** Race condition entre `SIGNED_IN` e `INITIAL_SESSION` — `fetchProfile` se colgaba
**Solución:** Llamar `setIsInitialized(true)` inmediatamente sin esperar `fetchProfile`, cargar perfil en background

---

## ✅ PASO 3 — Esquema de base de datos en Supabase

**Commit:** `feat: add complete database schema and TypeScript types`

### Comando para regenerar tipos de Supabase

Ejecutar cada vez que se agreguen o modifiquen tablas/columnas en Supabase:

```bash
npx supabase gen types typescript --project-id fynllwjgkioyciqxvxet --schema public > src/types/databaseTypes.ts
```

> ⚠️ No es necesario correrlo cuando solo se modifican políticas RLS o funciones SQL.

### Acciones realizadas

- Esquema completo ejecutado en Supabase SQL Editor en 6 scripts
- Tipos TypeScript auto-generados con Supabase CLI en `src/types/databaseTypes.ts`
- `src/types/authTypes.ts` actualizado para derivar tipos directamente de `databaseTypes.ts`

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
- `handle_new_user()` — trigger para auto-crear perfil y workspace al registrarse
- `get_user_workspace_ids()` — helper `security definer` para evitar recursión en RLS
- `search_files()` — búsqueda full-text con filtros avanzados y nombre de carpeta
- `get_workspace_stats()` — estadísticas de uso por workspace

### RLS habilitado en todas las tablas

- Viewers solo pueden leer
- Editors pueden crear y modificar
- Admins pueden eliminar y gestionar miembros
- Políticas usan `get_user_workspace_ids()` para evitar recursión infinita

### Decisiones técnicas

- `files.r2_key` es único — identifica el objeto en Cloudflare R2
- `files.embedding vector(1536)` — listo para búsqueda semántica con OpenAI embeddings
- `file_shares.token` — generado con `gen_random_bytes(32)` para links públicos seguros
- `shared_role` en `file_shares` es un enum sin FK

### Correcciones durante Paso 3

**Problema:** Error al crear `file_shares` — "foreign key constraint cannot be implemented"
**Causa:** `shared_role` tenía una FK a `profiles(id)` siendo de tipo `user_role` (enum), no `uuid`
**Solución:** Eliminar la FK de `shared_role`, dejarlo como enum simple

**Problema:** RLS infinite recursion en `profiles`, `workspaces` y `workspace_members`
**Causa:** Políticas hacían subconsultas recursivas entre tablas relacionadas
**Solución:** Crear función `get_user_workspace_ids()` con `security definer` que bypasea RLS

---

## ✅ PASO 4 — Autenticación (Email + Google OAuth)

**Commit:** `feat: add authentication pages with email and Google OAuth`

### Acciones realizadas

- `src/services/authService.ts` — servicio de autenticación con Supabase
- `src/pages/auth/LoginPage.tsx` — página de inicio de sesión
- `src/pages/auth/RegisterPage.tsx` — página de registro con indicador de fortaleza de contraseña
- Google OAuth configurado en Google Cloud Console y Supabase
- shadcn components instalados: `input`, `label`, `card`, `separator`, `checkbox`

### Google OAuth configurado

- Proyecto creado en Google Cloud Console: `cloudsyncpro` (ID: `cloudsyncpro-493305`)
- Pantalla de consentimiento OAuth: usuarios externos
- Callback URL: `https://fynllwjgkioyciqxvxet.supabase.co/auth/v1/callback`
- Origen autorizado: `http://localhost:5173`
- Client ID y Client Secret configurados en Supabase → Authentication → Providers → Google ✅

### Convención de nombres adoptada

En este paso se renombró toda la estructura de archivos a la convención del desarrollador:
- Páginas: `PascalCase` → `LoginPage.tsx`, `RegisterPage.tsx`
- Hooks: `camelCase` → `useAuth.ts`
- Stores: `camelCase` → `authStore.ts`
- Services: `camelCase` → `authService.ts`
- Routes: `PascalCase` → `AppRouter.tsx`
- Lib: `camelCase` → `queryClient.ts`
- Types: `camelCase` → `authTypes.ts`, `databaseTypes.ts`

---

## ✅ PASO 5 — Layout principal (Sidebar, Header, AppShell)

**Commit:** `feat: add app layout with sidebar, header, theme system and improved auth pages design`

### Acciones realizadas

- `src/store/uiStore.ts` — store para tema y estado del sidebar (persistido en localStorage)
- `src/hooks/useTheme.ts` — hook para gestión del tema claro/oscuro
- `src/components/layout/Sidebar.tsx` — sidebar colapsable con tooltips y selector de workspace
- `src/components/layout/Header.tsx` — header con búsqueda, tema, notificaciones y menú de usuario
- `src/components/layout/AppShell.tsx` — contenedor principal del layout
- `src/routes/AppRouter.tsx` — actualizado para usar `AppShell` en rutas protegidas
- `src/index.css` — tokens de diseño con `@custom-variant dark` para Tailwind v4
- `src/App.tsx` — `TooltipProvider` agregado
- shadcn components instalados: `tooltip`, `sheet`, `avatar`, `dropdown-menu`, `scroll-area`, `skeleton`, `dialog`, `badge`, `command`, `popover`
- Páginas de login y register rediseñadas completamente

### Sistema de colores

| Elemento | Light mode | Dark mode |
|----------|-----------|-----------|
| Sidebar | `#0f172a` | `#0f172a` (siempre igual) |
| Fondo app | `#ffffff` | `#0f172a` |
| Cards | `#f8fafc` | `#1e293b` |
| Acento | `#2563EB` | `#3b82f6` |

### Decisiones técnicas

- Sidebar siempre `#0f172a` en ambos modos — no cambia con el tema
- `useUIStore` con `persist` de Zustand — recuerda preferencias de sidebar y tema
- Botón flotante en el borde del sidebar para colapsar/expandir
- Notificaciones solo en el Header (campana) — eliminadas del sidebar para evitar duplicación
- `@custom-variant dark (&:where(.dark, .dark *))` — forma correcta de dark mode en Tailwind v4
- Login/Register: fondo blanco con panel izquierdo con gradiente `#0f172a → #082563 → #1e40af`

### Correcciones durante Paso 5

**Problema:** `@apply border-border` y `@apply bg-background` fallaban en `@layer base`
**Causa:** Tailwind v4 no permite `@apply` con clases basadas en variables CSS en `@layer base`
**Solución:** Usar CSS nativo con `hsl(var(--border))` y `@custom-variant dark`

**Problema:** Infinite loop en `Sidebar` y `Header`
**Causa:** `useAuth()` retornaba objeto nuevo en cada render
**Solución:** Usar `useAuthStore((s) => s.propiedad)` directamente en cada componente

---

## ✅ PASO 6 — Sistema de workspaces

**Commit:** `feat: add workspaces system with CRUD, RLS policies and auto-create on signup`

### Acciones realizadas

- `src/services/workspaceService.ts` — CRUD completo de workspaces
- `src/hooks/useWorkspaces.ts` — hooks con React Query (useWorkspaces, useCreateWorkspace, useUpdateWorkspace, useDeleteWorkspace)
- `src/store/workspaceStore.ts` — store Zustand para workspace activo (persistido)
- `src/components/shared/CreateWorkspaceModal.tsx` — modal para crear workspace
- `src/pages/workspaces/WorkspacesPage.tsx` — página con grid de workspaces
- Trigger `handle_new_user()` actualizado para crear "My Workspace" automáticamente al registrarse
- Selector de workspace en el Sidebar con Popover

### Decisiones técnicas

- Workspace activo persistido en `localStorage` vía Zustand `persist`
- Al cambiar de workspace todo el contenido de la app cambia (archivos, carpetas, búsqueda)
- Slug generado automáticamente con sufijo aleatorio para evitar colisiones
- "My Workspace" creado automáticamente en el trigger `handle_new_user`

---

## ✅ PASO 7 — Explorador de archivos y carpetas

**Commit:** `feat: add file explorer with folders, files, grid/list view and workspace selector in sidebar`

### Acciones realizadas

- `src/services/folderService.ts` — CRUD de carpetas con breadcrumb path
- `src/services/fileService.ts` — CRUD de archivos (archive, trash, restore, move)
- `src/hooks/useFolders.ts` — hooks React Query para carpetas
- `src/hooks/useFiles.ts` — hooks React Query para archivos
- `src/utils/fileUtils.ts` — utilidades: `formatFileSize`, `getFileIcon`, `getFileColor`
- `src/pages/files/FilesPage.tsx` — explorador con vista grid/list, breadcrumb, nueva carpeta
- RLS simplificada para `folders` y `files` usando `get_user_workspace_ids()`

### Decisiones técnicas

- Navegación por carpetas via `?folder=id` en URL — permite deep linking
- Vista grid/list persistida en estado local del componente
- Crear carpeta inline sin modal — input directo en la página
- Cards de carpetas con franja de color azul en la parte superior

---

## ✅ PASO 8 — Upload a Cloudflare R2

**Commit:** `feat: add file upload to Cloudflare R2 with Edge Function and presigned URLs`

### Acciones realizadas

- Cloudflare R2 configurado: bucket `cloudsyncpro-files`, CORS, Public Development URL
- `supabase/functions/upload-file/index.ts` — Edge Function con AWS SDK S3 para presigned URLs
- `src/services/uploadService.ts` — servicio de upload (presigned URL → R2 → registro en DB)
- `src/components/shared/UploadFileModal.tsx` — modal con drag & drop, progreso por archivo
- Edge Function desplegada con `--no-verify-jwt`

### Variables de entorno R2

| Variable | Uso |
|----------|-----|
| `R2_ENDPOINT` | Edge Function — endpoint S3 de Cloudflare |
| `R2_ACCOUNT_ID` | Edge Function — ID de cuenta Cloudflare |
| `R2_ACCESS_KEY_ID` | Edge Function — credencial R2 |
| `R2_SECRET_ACCESS_KEY` | Edge Function — credencial R2 |
| `R2_BUCKET_NAME` | Edge Function — nombre del bucket |
| `R2_PUBLIC_URL` | Edge Function — URL pública del bucket |
| `VITE_R2_PUBLIC_URL` | Frontend — URL pública para preview/descarga |

### Estructura de archivos en R2

cloudsyncpro-files/
└── {workspaceId}/
└── {folderId|root}/
└── {timestamp}-{sanitizedFilename}

### Decisiones técnicas

- Presigned URL con expiración de 1 hora — el archivo sube directo al bucket sin pasar por el servidor
- `--no-verify-jwt` en la Edge Function — autenticación manual via header `Authorization`
- XHR en lugar de fetch para poder trackear el progreso de subida
- Archivo registrado en DB solo después de subida exitosa a R2

---

## ✅ PASO 9 — Previsualización de archivos

**Commit:** `feat: add file preview modal for PDF, images, video and audio`

### Acciones realizadas

- `src/components/shared/FilePreviewModal.tsx` — modal de previsualización fullscreen
- Soporte para: imágenes (con zoom y rotación), PDF (iframe), video, audio, otros (descarga)
- Integrado en `FilesPage.tsx` — clic en archivo abre el preview

### Tipos soportados

| Tipo | Visualización |
|------|--------------|
| Imágenes | Preview directo con zoom (25%-300%) y rotación |
| PDF | iframe con toolbar del navegador |
| Video | Player HTML5 nativo |
| Audio | Player HTML5 con portada |
| Otros | Pantalla de descarga directa |

---

## ✅ PASO 10 — Búsqueda avanzada

**Commit:** `feat: add real-time search with folder location and keyboard shortcut`

### Acciones realizadas

- `src/hooks/useSearch.ts` — hook con React Query + debounce de 300ms
- `src/components/shared/SearchBar.tsx` — buscador inline con dropdown de resultados
- Función `search_files()` actualizada en Supabase para incluir `folder_name` via LEFT JOIN
- Integrado en `Header.tsx` — reemplaza el input estático

### Funcionalidades

- Búsqueda en tiempo real con debounce 300ms
- Muestra ubicación del archivo: nombre de carpeta o "Raíz"
- Navega a la carpeta correcta al hacer clic en resultado
- Shortcut `Ctrl+K` para enfocar el buscador
- `staleTime: 0` para evitar caché entre búsquedas consecutivas

---

## ✅ PASO 11 — Compartir archivos y links públicos

**Commit:** `feat: add file sharing with public and private links, password protection and expiry`

### Acciones realizadas

- `src/services/shareService.ts` — CRUD de shares, verificación de contraseña, URL pública
- `src/hooks/useShares.ts` — hooks React Query (useShares, useCreateShare, useDeactivateShare)
- `src/components/shared/ShareFileModal.tsx` — modal con toggles nativos para opciones
- `src/pages/shared/SharedFilePage.tsx` — página pública de acceso a archivos compartidos
- RLS para `file_shares` — política pública para shares activos por token
- Función SQL `get_shared_file(p_token)` — acceso público sin autenticación
- Ruta `/shared/:token` agregada en `AppRouter.tsx` sin requerir auth

### Tipos de sharing

| Tipo | Acceso |
|------|--------|
| Público | Cualquier persona con el link |
| Privado | Solo usuarios registrados en CloudSyncPro |

### Opciones por enlace

- ✅ Permitir/denegar descarga
- ✅ Fecha de expiración opcional
- ✅ Contraseña opcional
- ✅ Desactivar enlace manualmente

### Decisiones técnicas

- Toggles nativos en lugar de `Switch` de shadcn — evita conflictos con Radix Dialog
- `get_shared_file()` con `security definer` — permite acceso público sin RLS
- Links privados redirigen al login si el usuario no está autenticado
- Token generado con `gen_random_bytes(32)` — 64 caracteres hex

---

## ✅ PASO 12 — Dashboard con Recharts

**Commit:** `feat: add dashboard with global stats, charts and recent files using Recharts`

### Acciones realizadas

- `src/hooks/useDashboard.ts` — hooks: useGlobalStats, useWorkspaceStats, useRecentFiles, useUploadActivity
- `src/pages/dashboard/DashboardPage.tsx` — dashboard completo con stats, charts y archivos recientes

### Secciones del dashboard

| Sección | Descripción |
|---------|-------------|
| Resumen global | Total archivos, almacenamiento, workspaces, carpetas del usuario |
| Workspace activo | Stats del workspace seleccionado |
| Actividad de subidas | BarChart de archivos subidos por día |
| Archivos por tipo | PieChart de distribución por tipo MIME |
| Archivos recientes | Lista de últimos 5 archivos subidos |

### Decisiones técnicas

- `formatter={(value) => [value ?? 0, ...]}` en Recharts — evita error de tipo `ValueType | undefined`
- Stats globales via `Promise.all` — consultas paralelas para mejor rendimiento
- Agrupación de actividad por día en el frontend — evita función SQL adicional

---

## ✅ PASO 13 — Notificaciones en tiempo real

**Commit:** `feat: add realtime notifications with unread badge and mark as read`

### Acciones realizadas

- `src/hooks/useNotifications.ts` — hook con Supabase Realtime + React Query
- `src/components/shared/NotificationsDropdown.tsx` — dropdown en Header con badge
- `alter publication supabase_realtime add table public.notifications` — habilitado en SQL Editor

### Funcionalidades

- Badge con contador de no leídas en la campana del Header
- Dropdown con lista de notificaciones (máximo 20)
- Marcar como leída individualmente
- Marcar todas como leídas
- Íconos y colores según tipo: `success`, `warning`, `error`, `info`
- Suscripción realtime a eventos `INSERT` y `UPDATE`

### Decisiones técnicas

- Canal singleton via `Map` fuera del ciclo de React — evita error de StrictMode de React 19
- `if (activeChannels.has(userId)) return` — previene doble suscripción en desarrollo
- Cleanup correcto en desmontaje: `removeChannel` + `activeChannels.delete`

### Correcciones durante Paso 13

**Problema:** `cannot add postgres_changes callbacks after subscribe()`
**Causa:** React 19 StrictMode monta efectos dos veces — el canal ya estaba suscrito al segundo montaje
**Solución:** Singleton `Map` fuera de React — variables de módulo no se resetean con StrictMode

---

## ✅ PASO 14 — Panel de administración

**Commit:** `feat: add admin panel with user management, role control and system stats`

### Acciones realizadas

- `src/hooks/useAdmin.ts` — hooks: useAdminUsers, useSystemStats, useUpdateUserRole
- `src/pages/admin/AdminPage.tsx` — panel completo con stats, tabla de usuarios y gestión de roles
- SQL: `update profiles set role = 'superadmin'` — asignación de rol inicial al usuario principal

### Secciones del panel

| Sección | Descripción |
|---------|-------------|
| Stats del sistema | Total usuarios, archivos, almacenamiento, workspaces |
| Tabla de usuarios | Lista paginada con avatar, nombre, email, rol, archivos, almacenamiento y fecha |
| Cambio de rol | Dropdown para cambiar rol de cualquier usuario (excepto el propio) |
| Buscador | Filtro en tiempo real por nombre o email |

### Roles disponibles

| Rol | Color | Permisos |
|-----|-------|----------|
| `superadmin` | Rojo | Acceso total al panel |
| `admin` | Naranja | Acceso al panel, gestión de usuarios |
| `editor` | Azul | Crear y modificar archivos y carpetas |
| `viewer` | Gris | Solo lectura |

### Decisiones técnicas

- Guard en el componente — redirige a dashboard si el rol no es `superadmin` o `admin`
- `Promise.all` para cargar stats de archivos por usuario en paralelo
- Tipo `UserRole` estricto para evitar errores de TypeScript con el enum de Supabase
- Usuario actual no puede cambiar su propio rol — previene bloqueo accidental

---

## ✅ PASO 15 — Auditoría de actividad

**Commit:** `feat: add activity audit page with timeline and filters`

### Acciones realizadas

- `src/services/activityService.ts` — `logActivity()` + `getActivities()` con filtros y paginación
- `src/hooks/useActivity.ts` — hook con React Query (`staleTime: 30s`)
- `src/pages/activity/ActivityPage.tsx` — timeline agrupado por día con filtros
- `src/routes/AppRouter.tsx` — ruta `/activity` con lazy loading
- `src/components/layout/Sidebar.tsx` — link "Actividad" con icono `Activity`
- Instrumentación en `uploadService`, `fileService`, `folderService`, `shareService`

### Funcionalidades

- Timeline cronológico de eventos agrupados por día (Hoy / Ayer / fecha)
- Filtro multi-select por tipo de acción (13 acciones del enum `activity_action`)
- Filtro por rango de fechas (`from` / `to`)
- Paginación con botón "Cargar más" (`PAGE_SIZE = 50`)
- Avatar y nombre del usuario que ejecutó cada acción
- Iconos y colores por acción (upload, download, view, move, rename, delete, archive, restore, share, unshare, create_folder, update_metadata, create_version)

### Acciones registradas por servicio

| Servicio | Acciones |
|----------|----------|
| `uploadService.uploadFile` | `upload` con `{ size, mime_type }` |
| `fileService.renameFile` | `rename` con `{ previous_name }` |
| `fileService.archiveFile` | `archive` |
| `fileService.restoreFile` | `restore` |
| `fileService.trashFile` | `delete` |
| `fileService.moveFile` | `move` con `{ from_folder, to_folder }` |
| `folderService.createFolder` | `create_folder` con `{ parent_id }` |
| `folderService.renameFolder` | `rename` con `{ previous_name }` |
| `folderService.deleteFolder` | `delete` |
| `shareService.createShare` | `share` con `{ share_type, permissions, expires_at }` |
| `shareService.deactivateShare` | `unshare` |

### Decisiones técnicas

- `logActivity` retorna `void` y solo loggea errores en consola — nunca rompe el flujo principal si falla
- `metadata` tipado como `{ [key: string]: Json | undefined }` para coincidir con el tipo de Supabase
- `shareService` consulta `files` o `folders` antes de loggear para obtener `workspace_id` y `name` del recurso
- `fileService.deleteFile` (delete permanente) NO se instrumenta — el registro ya existe del `trashFile` previo
- `useMemo` en `items` y `grouped` para evitar recálculos innecesarios del timeline
- Helper `renderActionIcon(action, className)` retorna JSX vía switch — evita el patrón `const Icon = getX()` que falla con React 19

---

## ✅ PASO 16 — Archivados y Papelera

**Commit:** `feat: add archived and trash pages with restore and permanent delete`

### Acciones realizadas

- `src/pages/archived/ArchivedPage.tsx` — listado de archivos con `status = 'archived'` y botón de restaurar
- `src/pages/trash/TrashPage.tsx` — listado de archivos con `status = 'deleted'` con restaurar y eliminar permanente
- `src/routes/AppRouter.tsx` — reemplazados los `PlaceholderPage` por las páginas reales con lazy loading
- `src/components/shared/ConfirmDialog.tsx` — modal reutilizable para confirmaciones destructivas (reemplaza `window.confirm`)
- `src/services/fileService.ts` — `deleteFile` (permanente) instrumenta actividad con `metadata: { permanent: true }`

### Funcionalidades

| Página | Acciones disponibles |
|--------|----------------------|
| `/archived` | Restaurar (vuelve a `status = 'active'`) |
| `/trash` | Restaurar (vuelve a `status = 'active'`) o eliminar permanentemente |

- Lista vertical con icono del tipo de archivo, nombre, tamaño y fecha de la acción
- Papelera: nombre con `line-through` para indicar eliminación
- Confirmación con `ConfirmDialog` (modal estilizado) antes de eliminar permanentemente
- Empty states específicos para cada página
- Ambas páginas logean actividad vía los hooks existentes (`restore`, `delete`)
- Eliminación permanente registra evento `delete` con flag `permanent: true` en metadata — distinguible del soft delete (papelera)

### Decisiones técnicas

- Reutilización de hooks existentes (`useArchivedFiles`, `useDeletedFiles`, `useRestoreFile`, `useDeleteFile`) — no fue necesario crear nada en la capa de servicios
- Los botones de acción aparecen solo en `hover` (`opacity-0 group-hover:opacity-100`) para UI limpia
- Icono `ArchiveRestore` de lucide-react para ambos restaurar — consistencia visual
- `ConfirmDialog` construido sobre el primitivo `Dialog` existente con variante `destructive` — evita agregar dependencia `alert-dialog` de Radix
- `WorkspacesPage` también migrada a `ConfirmDialog` para la eliminación de workspaces
- El helper `renderFileTypeIcon` se duplica en ambas páginas por simplicidad — si se repite en más lugares, se extraerá a `fileUtils`

---

## ✅ PASO 17 — Perfil de usuario

**Commit:** `feat: add user profile page with avatar upload, name and password editing`

### Acciones realizadas

- `src/services/profileService.ts` — `updateProfile`, `uploadAvatar`, `removeAvatar`, `updatePassword`
- `src/hooks/useProfile.ts` — mutations con `useMutation` + toast feedback + update directo al `authStore`
- `src/pages/settings/ProfilePage.tsx` — 3 secciones: avatar, datos personales, contraseña
- `src/routes/AppRouter.tsx` — ruta `/settings/profile` con lazy loading
- Supabase Storage: bucket `avatars` creado (público, 2 MB máx, MIME types permitidos)
- RLS del bucket configuradas — cada usuario solo puede escribir/borrar dentro de su carpeta (`auth.uid()`)

### Funcionalidades

| Sección | Funcionalidad |
|---------|---------------|
| Avatar | Subir imagen (JPG/PNG/WebP/GIF, ≤2 MB) o eliminar (con `ConfirmDialog`) |
| Datos personales | Editar `full_name` — email bloqueado (gestionado por Supabase Auth) |
| Contraseña | Cambiar con nueva contraseña + confirmación (mínimo 6 caracteres) |

### Decisiones técnicas

- Path de avatar: `{userId}/avatar.{ext}` con `upsert: true` — siempre sobrescribe el anterior
- Cache-busting en `avatar_url`: `?t=${Date.now()}` — fuerza recarga de la imagen al actualizarla
- Validación de tamaño y MIME en frontend (`profileService`) antes de subir — feedback inmediato
- `removeAvatar` borra TODO lo que haya en la carpeta del usuario vía `storage.list` + `remove` — evita orphans si cambia la extensión
- Mutations actualizan `authStore.setProfile` directamente en `onSuccess` — sin re-fetch adicional
- Cambio de contraseña vía `supabase.auth.updateUser({ password })` — no requiere contraseña actual (Supabase lo valida con la sesión)

### SQL — RLS del bucket `avatars`

```sql
-- Políticas: cada usuario solo puede insertar/actualizar/borrar en su carpeta
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');
```

---

## ✅ PASO 18 — Página de configuración

**Commit:** `feat: add settings page with notification preferences and account deletion`

### Acciones realizadas

- `src/pages/settings/SettingsPage.tsx` — página con 2 secciones: notificaciones y zona de peligro
- `src/store/uiStore.ts` — `notificationsInApp` / `notificationsEmail` persistidos en `ui-store`
- `src/components/layout/Header.tsx` — theme toggle convertido a dropdown con 3 opciones (Claro / Oscuro / Sistema) + renderizado condicional de `NotificationsDropdown` según `notificationsInApp`
- `src/components/ui/switch.tsx` — nuevo tamaño `lg` estilo toggle switch clásico (24×44px, thumb blanco con sombra)
- `src/services/profileService.ts` — `deleteAccount(confirmEmail)` llama a Edge Function + `signOut`
- `src/hooks/useProfile.ts` — `useDeleteAccount` mutation
- `supabase/functions/delete-account/index.ts` — Edge Function que valida JWT y elimina el usuario vía service role
- `src/routes/AppRouter.tsx` — ruta `/settings` con `SettingsPage` real (reemplaza `PlaceholderPage`)
- SQL — 5 FKs migradas de `RESTRICT` → `CASCADE`/`SET NULL` para permitir eliminación de cuenta

### Funcionalidades

| Sección | Funcionalidad |
|---------|---------------|
| Notificaciones | Toggle in-app (activo) y por email (próximamente, disabled) — si el in-app está off, la campana del Header desaparece |
| Zona de peligro | Eliminar cuenta con confirmación escrita del email exacto — modal bloquea el botón hasta que coincida |
| Header — Tema | Dropdown con Claro / Oscuro / Sistema (`useTheme` sincroniza con preferencia del SO si es `system`) |

### Decisiones técnicas

- Tema NO va en Settings — ya está en el Header y se expandió a 3 opciones (no duplicar UI)
- Permisos granulares quedan fuera de Settings — pertenecen al panel de administración (pendiente, se definirán más adelante)
- Switch `lg`: rama separada en el componente para evitar conflicto con las variantes `data-checked`/`data-unchecked` de shadcn — usa `data-[state=checked]` directo de Radix
- Eliminación de cuenta requiere 3 capas de seguridad:
  1. Frontend: input de email que desbloquea el botón solo si coincide exactamente (case insensitive)
  2. Edge Function: valida JWT del caller y vuelve a comparar con `user.email` del token
  3. Service role: usa `auth.admin.deleteUser(user.id)` que cascadea por FKs
- Redirect post-delete: `window.location.href = '/login'` en lugar de `navigate` — fuerza reload completo para limpiar todos los stores

### Edge Function `delete-account`

- Deploy: `supabase functions deploy delete-account` (selecciona proyecto `cloudsyncpro` — ref `fynllwjgkioyciqxvxet`)
- Respuestas: `401` (sin auth), `400` (email no coincide), `500` (fallo de delete), `200` (éxito)
- Usa `SUPABASE_SERVICE_ROLE_KEY` — nunca expuesta al frontend

### SQL — FKs para cascada de eliminación

```sql
-- Workspaces del usuario → se eliminan (cascada a files/folders/shares vía workspace_id)
alter table workspaces
  drop constraint workspaces_owner_id_fkey,
  add constraint workspaces_owner_id_fkey
    foreign key (owner_id) references profiles(id) on delete cascade;

-- Autoría → se conserva el recurso, solo se desvincula autor (para colaboraciones en workspaces ajenos)
alter table files
  drop constraint files_uploaded_by_fkey,
  add constraint files_uploaded_by_fkey
    foreign key (uploaded_by) references profiles(id) on delete set null;

alter table folders
  drop constraint folders_created_by_fkey,
  add constraint folders_created_by_fkey
    foreign key (created_by) references profiles(id) on delete set null;

alter table file_versions
  drop constraint file_versions_uploaded_by_fkey,
  add constraint file_versions_uploaded_by_fkey
    foreign key (uploaded_by) references profiles(id) on delete set null;

alter table file_shares
  drop constraint file_shares_shared_by_fkey,
  add constraint file_shares_shared_by_fkey
    foreign key (shared_by) references profiles(id) on delete set null;
```

---

## ✅ PASO 19 — Renombrar, mover archivos y breadcrumb dinámico

**Commit:** `feat: add inline rename, move file modal and dynamic breadcrumb`

### Acciones realizadas

- `src/hooks/useFiles.ts` — `useMoveFile` hook con `useMutation`
- `src/hooks/useFolders.ts` — `useAllFolders(workspaceId)` hook para el picker de carpetas
- `src/services/folderService.ts` — `getAllFolders(workspaceId)` que trae todas las carpetas del workspace
- `src/components/shared/MoveFileModal.tsx` — modal con árbol de carpetas para mover archivos
- `src/pages/files/FilesPage.tsx` — renombrado inline + mover + breadcrumb dinámico

### Funcionalidades

| Funcionalidad | Descripción |
|---------------|-------------|
| Renombrar archivo | Inline input que reemplaza `prompt()` — confirma con Enter/blur, cancela con Escape |
| Renombrar carpeta | Mismo comportamiento inline |
| Mover archivo | Modal con árbol de carpetas — marca carpeta actual como "(actual)" y la deshabilita |
| Breadcrumb dinámico | Usa `useFolderPath` para construir ruta clickeable con nombre real de cada carpeta |

### Decisiones técnicas

- `MoveFileModal` construye el árbol recursivamente desde una lista plana de carpetas
- Inline rename evita modales para operaciones simples — mejor UX
- Breadcrumb usa `useFolderPath` que consulta recursivamente `parent_id` hasta llegar a la raíz

---

## ✅ PASO 20 — Página de archivos compartidos

**Commit:** `feat: add shared files page with link management`

### Acciones realizadas

- `src/services/shareService.ts` — `getMyShares()` con enrichment de nombres de recursos
- `src/hooks/useShares.ts` — `useMyShares()` hook + invalidación global en `useDeactivateShare`
- `src/pages/shared/SharedPage.tsx` — listado de shares activos con gestión
- `src/routes/AppRouter.tsx` — ruta `/shared` con la página real

### Funcionalidades

| Funcionalidad | Descripción |
|---------------|-------------|
| Listado de shares | Muestra todos los shares activos del usuario actual |
| Badges | Público/privado, indicador de contraseña, fecha de expiración |
| Copiar link | Botón para copiar URL pública al portapapeles |
| Desactivar | `ConfirmDialog` antes de desactivar un enlace compartido |
| Empty state | Mensaje cuando no hay shares activos |

### Decisiones técnicas

- `getMyShares()` hace batch-fetch de nombres: consulta `files` y `folders` por separado con `.in('id', ids)` y luego enriquece cada share
- `useDeactivateShare` invalida todos los queries de shares (no solo el del recurso específico) para mantener consistencia
- `Unlink` de lucide-react en lugar de `LinkOff` (no existe en la versión actual)

---

## ✅ PASO 21 — Vista de actividad por archivo/carpeta

**Commit:** `feat: add per-resource activity modal with timeline view`

### Acciones realizadas

- `src/utils/activityUtils.tsx` — helpers compartidos extraídos de `ActivityPage`
- `src/services/activityService.ts` — `getResourceActivities(resourceId, workspaceId?)`
- `src/hooks/useActivity.ts` — `useResourceActivities(resourceId, workspaceId?)` hook
- `src/components/shared/ResourceActivityModal.tsx` — modal con timeline de actividad por recurso
- `src/pages/activity/ActivityPage.tsx` — refactorizada para usar `activityUtils`
- `src/pages/files/FilesPage.tsx` — integración del modal + fix de prop faltante en grid view

### Funcionalidades

| Funcionalidad | Descripción |
|---------------|-------------|
| Modal de actividad | Dialog que muestra la actividad de un archivo o carpeta específica |
| Timeline agrupado | Eventos agrupados por día (Hoy / Ayer / fecha) |
| Avatar y usuario | Muestra quién ejecutó cada acción |
| Metadata | Muestra nombre previo (rename), flag permanente (delete), tipo de share |
| Acceso desde menú | "Ver actividad" en el `DropdownMenu` de archivos y carpetas |

### Código extraído a `activityUtils.tsx`

| Export | Descripción |
|--------|-------------|
| `ACTION_CONFIG` | `Record<ActivityAction, {label, verb, color}>` — config visual por acción |
| `renderActionIcon(action, className)` | JSX del ícono según la acción |
| `groupByDay(items)` | Agrupa `ActivityWithUser[]` por fecha |
| `formatDayLabel(date)` | "Hoy" / "Ayer" / fecha formateada |

### Correcciones durante Paso 21

**Problema:** "Ver actividad" no abría el modal para archivos en vista grid
**Causa:** El `FileMenu` en la vista de cuadrícula no recibía la prop `onActivity` (la vista de lista sí la pasaba)
**Solución:** Agregar `onActivity={onActivity}` al `FileMenu` del render de grid view

**Problema:** Conflicto Radix DropdownMenu → Dialog (el modal no se abría)
**Causa:** `DropdownMenu` usa `modal={true}` por defecto, lo que bloquea la apertura de un `Dialog` posterior
**Solución:** `modal={false}` en ambos `DropdownMenu` (archivos y carpetas) + `onSelect` en lugar de `onClick` en todos los `DropdownMenuItem`

---

## ✅ PASO 22 — Búsqueda global mejorada y Drag & Drop

**Commit:** `feat: add folder search with keyboard nav and drag-drop file moving`

### Acciones realizadas

- `src/hooks/useSearch.ts` — búsqueda combinada de archivos y carpetas con `Promise.all`
- `src/components/shared/SearchBar.tsx` — resultados por secciones + navegación con teclado
- `src/pages/files/FilesPage.tsx` — drag & drop nativo HTML5 para mover archivos a carpetas

### Búsqueda global

| Funcionalidad | Descripción |
|---------------|-------------|
| Búsqueda de carpetas | `ilike` sobre `folders.name` — máximo 5 resultados |
| Búsqueda de archivos | `search_files` RPC existente — máximo 15 resultados |
| Secciones separadas | Dropdown agrupa resultados en "Carpetas" y "Archivos" |
| Navegación con teclado | Flecha arriba/abajo para moverse, Enter para seleccionar |
| Highlight activo | El item seleccionado con teclado o hover se resalta con `bg-muted` |

### Drag & Drop

| Funcionalidad | Descripción |
|---------------|-------------|
| Archivos draggable | `draggable` en `FileCard` con `effectAllowed: "move"` |
| Carpetas como drop target | `onDragOver`, `onDragLeave`, `onDrop` en `FolderCard` |
| Feedback visual | Carpeta se resalta con borde primario y `scale-[1.02]` al arrastrar encima |
| Drop a raíz | Arrastrar al breadcrumb "Raíz" mueve el archivo a la carpeta raíz |
| Ambas vistas | Funciona tanto en vista grid como en vista list |

### Decisiones técnicas

- HTML5 Drag API nativo — no se necesita librería adicional (ya tenemos `react-dropzone` para upload, pero el drag entre elementos es más simple con la API nativa)
- `draggable={!isRenaming}` — deshabilitado durante rename para evitar conflictos con el input
- `e.stopPropagation()` en los handlers de drop para evitar que el evento burbujee al padre
- Estado `draggingFileId` + `dragOverFolderId` en el componente padre — controla qué archivo se arrastra y qué carpeta se resalta
- Drop en "Raíz" solo se activa cuando estamos dentro de una subcarpeta (`folderId` existe)

---

## ✅ PASO 23 — Permisos granulares por workspace (gestión de miembros)

**Commit:** `feat: add workspace member management with role permissions`

### Acciones realizadas

- `src/services/memberService.ts` — CRUD sobre `workspace_members` con join a `profiles`
- `src/hooks/useMembers.ts` — React Query hooks (`useWorkspaceMembers`, `useInviteMember`, `useUpdateMemberRole`, `useRemoveMember`) con toasts e invalidación
- `src/pages/workspaces/MembersPage.tsx` — UI completa de gestión de miembros del workspace activo
- `src/routes/AppRouter.tsx` — ruta `/members` con lazy loading
- `src/components/layout/Sidebar.tsx` — entrada "Miembros" con icono `UserCog`

### Funcionalidades

| Funcionalidad | Descripción |
|---------------|-------------|
| Listado de miembros | Avatar, nombre, email, fecha de incorporación, rol con badge |
| Owner destacado | Icono de corona y rol "Propietario" no editable |
| Invitar por email | Form inline con dropdown de rol (admin/editor/viewer) |
| Cambio de rol inline | DropdownMenu por miembro — solo visible para owner/admin |
| Eliminar miembro | `ConfirmDialog` antes de borrar — bloqueado para owner y self |
| Filtro de búsqueda | Aparece automáticamente cuando hay más de 5 miembros |
| Leyenda de permisos | Matriz visual con descripción de cada rol |

### Modelo de permisos

| Rol | Capacidades |
|-----|-------------|
| `owner` | Control total — no puede ser modificado ni eliminado |
| `admin` | Invita, cambia roles y elimina miembros (excepto owner) |
| `editor` | Sube, edita, comparte y mueve archivos del workspace |
| `viewer` | Solo lectura — descarga y visualiza |

### Decisiones técnicas

- `canManage = isOwner || currentMember?.role === "admin"` — controla visibilidad de acciones de gestión
- `inviteMember` busca el usuario por email en `profiles` antes de insertar — falla con mensaje claro si no existe o ya es miembro
- Join Supabase: `user:profiles!workspace_members_user_id_fkey(...)` — trae perfil del miembro en una sola query
- Cache key `["workspace-members", workspaceId]` — invalidación granular por workspace
- Página separada de `/admin` (que es panel global de admin/superadmin) — `/members` opera sobre el workspace activo del usuario

---

## ✅ PASO 24 — Permisos de rol aplicados en la UI

**Commit:** `feat: gate file actions by workspace role`

### Acciones realizadas

- `src/hooks/useWorkspaceRole.ts` — hook único que resuelve el rol del usuario en el workspace activo y expone flags derivados
- `src/pages/files/FilesPage.tsx` — oculta acciones de escritura según rol; badge "Modo solo lectura" para viewers
- `src/pages/trash/TrashPage.tsx` — oculta botones "Restaurar" y "Eliminar" para viewers
- `src/pages/archived/ArchivedPage.tsx` — oculta botón "Restaurar" para viewers
- `src/services/memberService.ts` — usa nueva RPC `find_profile_by_email` y `.maybeSingle()` en el check de membresía

### SQL aplicado en Supabase

```sql
create or replace function public.find_profile_by_email(p_email text)
returns table (id uuid, email text, full_name text, avatar_url text)
language sql
security definer
set search_path = public
as $$
  select id, email, full_name, avatar_url
  from public.profiles
  where lower(email) = lower(p_email)
  limit 1;
$$;

revoke all on function public.find_profile_by_email(text) from public, anon;
grant execute on function public.find_profile_by_email(text) to authenticated;
```

### Modelo de permisos (UI)

| Flag | Owner | Admin | Editor | Viewer |
|------|:-----:|:-----:|:------:|:------:|
| `canEdit` | ✓ | ✓ | ✓ | — |
| `canManage` | ✓ | ✓ | — | — |
| `canShare` / `canUpload` / `canDelete` | ✓ | ✓ | ✓ | — |

### Acciones gateadas

| Componente | Acciones ocultas para viewer |
|------------|------------------------------|
| `FilesPage` header | "Nueva carpeta", "Subir archivo" |
| `EmptyState` | Botones de creación + mensaje adaptado |
| `FolderMenu` | "Renombrar", "Eliminar" |
| `FileMenu` | "Renombrar", "Compartir", "Mover", "Archivar", "Papelera" |
| `FolderCard` | Drop targets de drag & drop |
| `FileCard` | `draggable` deshabilitado |
| `TrashPage` | "Restaurar", "Eliminar definitivamente" |
| `ArchivedPage` | "Restaurar" |

### Decisiones técnicas

- El hook `useWorkspaceRole` siempre devuelve `admin` cuando `isOwner` es `true` — el owner no necesita una fila en `workspace_members`
- La query a `workspace_members.role` se desactiva cuando `isOwner` es `true` (evita una request innecesaria)
- "Ver actividad" siempre visible — el log de auditoría no es escritura, todos los miembros pueden consultarlo
- Bug encontrado durante el test: las RLS de `profiles` no permitían a Juan buscar al viewer por email para invitarlo. Resuelto con la RPC `find_profile_by_email` (`security definer`), que devuelve solo campos públicos y solo para `authenticated`
- `.maybeSingle()` en lugar de `.single()` en el check "ya es miembro" — antes devolvía 406 cuando no había fila

### Validación end-to-end (Playwright)

1. Registro de cuenta `viewer@test.com`
2. Login como Juan (owner) → invitación del viewer al workspace con rol `viewer`
3. Login como viewer → `/files` muestra badge "Modo solo lectura", botones de creación ocultos, menú de archivo solo con "Ver actividad"

---

## ✅ PASO 25 — RLS endurecido para defensa en profundidad

**Commit:** `feat: enforce role permissions at RLS layer`

### Acciones realizadas

- Políticas **restrictivas** sobre `files`, `folders` y `file_shares` que se combinan (AND) con las permisivas existentes — no rompen lectura, solo bloquean INSERT/UPDATE/DELETE para roles sin permiso
- Función helper `has_workspace_edit_permission(uuid)` (`security definer`, `stable`) centraliza la regla: owner del workspace o miembro con rol `admin`/`editor`
- `file_shares` evaluado por `resource_type` + join a `files` o `folders` (la tabla no tiene `file_id` directo, usa `resource_id` polimórfico)

### SQL aplicado en Supabase

```sql
-- Helper
create or replace function public.has_workspace_edit_permission(p_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.workspaces w
    where w.id = p_workspace_id and w.owner_id = auth.uid()
  )
  or exists (
    select 1 from public.workspace_members m
    where m.workspace_id = p_workspace_id
      and m.user_id = auth.uid()
      and m.role in ('admin', 'editor')
  );
$$;

grant execute on function public.has_workspace_edit_permission(uuid) to authenticated;

-- files / folders
create policy "files_insert_requires_edit"   on public.files   as restrictive for insert to authenticated with check (public.has_workspace_edit_permission(workspace_id));
create policy "files_update_requires_edit"   on public.files   as restrictive for update to authenticated using      (public.has_workspace_edit_permission(workspace_id));
create policy "files_delete_requires_edit"   on public.files   as restrictive for delete to authenticated using      (public.has_workspace_edit_permission(workspace_id));
create policy "folders_insert_requires_edit" on public.folders as restrictive for insert to authenticated with check (public.has_workspace_edit_permission(workspace_id));
create policy "folders_update_requires_edit" on public.folders as restrictive for update to authenticated using      (public.has_workspace_edit_permission(workspace_id));
create policy "folders_delete_requires_edit" on public.folders as restrictive for delete to authenticated using      (public.has_workspace_edit_permission(workspace_id));

-- file_shares (polimórfico)
create policy "file_shares_insert_requires_edit" on public.file_shares as restrictive for insert to authenticated
with check (
  (resource_type = 'file'   and exists (select 1 from public.files   f  where f.id  = file_shares.resource_id and public.has_workspace_edit_permission(f.workspace_id)))
  or (resource_type = 'folder' and exists (select 1 from public.folders fo where fo.id = file_shares.resource_id and public.has_workspace_edit_permission(fo.workspace_id)))
);
-- (update/delete análogas con USING)
```

### Decisiones técnicas

- **Restrictive** en vez de reemplazar las permisivas existentes: se AND-ean, así no hay riesgo de romper lecturas o flujos de otros roles
- Helper `security definer` evita que los checks recursen en RLS sobre `workspace_members`/`workspaces` — la función corre con permisos elevados pero solo expone un booleano
- `stable` permite al planner cachear el resultado dentro de la misma query
- Owner tratado igual que admin/editor a nivel DB (consistente con la UI)

### Validación end-to-end (Playwright como viewer)

| Intento desde `supabase-js` del navegador | Resultado |
|-------------------------------------------|-----------|
| `INSERT` en `folders`                     | ❌ 42501 — política `folders_insert_requires_edit` |
| `UPDATE` de `files.name`                  | ❌ 0 filas (USING filtra) |
| `DELETE` de `folders`                     | ❌ 0 filas (USING filtra) |
| `INSERT` en `file_shares`                 | ❌ 42501 — política `file_shares_insert_requires_edit` |

Verificado post-test: archivo y carpeta originales intactos. La UI seguía en modo solo-lectura durante todo el test.

---

## ✅ PASO 26 — Nombres reales de miembros en `MembersPage`

**Commit:** `feat: show real member names via security-definer RPC`

### Acciones realizadas

- `src/services/memberService.ts` — `getMembers` ahora llama a la RPC `get_workspace_members` y mapea al tipo `WorkspaceMemberWithProfile` existente (no rompe consumidores)
- RPC `get_workspace_members(p_workspace_id uuid)` en Supabase — JOIN `workspace_members` + `profiles` con `security definer`, pero restringido a callers que ya son miembro u owner del workspace

### SQL aplicado en Supabase

```sql
create or replace function public.get_workspace_members(p_workspace_id uuid)
returns table (
  id uuid, user_id uuid, workspace_id uuid,
  role user_role, joined_at timestamptz,
  full_name text, email text, avatar_url text
)
language sql
security definer
set search_path = public
stable
as $$
  select m.id, m.user_id, m.workspace_id, m.role, m.joined_at,
         p.full_name, p.email, p.avatar_url
  from public.workspace_members m
  left join public.profiles p on p.id = m.user_id
  where m.workspace_id = p_workspace_id
    and (
      exists (select 1 from public.workspace_members cm
              where cm.workspace_id = p_workspace_id and cm.user_id = auth.uid())
      or exists (select 1 from public.workspaces w
                 where w.id = p_workspace_id and w.owner_id = auth.uid())
    )
  order by m.joined_at asc;
$$;

revoke all on function public.get_workspace_members(uuid) from public, anon;
grant execute on function public.get_workspace_members(uuid) to authenticated;
```

### Decisiones técnicas

- El embed original `profiles!workspace_members_user_id_fkey` devolvía `null` para todos los usuarios que no fueran el caller (RLS de `profiles` solo permite leer tu propia fila). La UI caía al fallback "Usuario"
- Se preserva la signatura del tipo `WorkspaceMemberWithProfile` — ningún consumidor (`MembersPage`, `ConfirmDialog`, filtros) necesitó cambios
- La RPC valida pertenencia al workspace antes de exponer datos de terceros — no abre un canal lateral para listar perfiles arbitrarios

### Validación end-to-end (Playwright como viewer)

- `/members` ahora muestra: **Juan** (owner, juan@gmail.com) y **Viewer Test** (tú, viewer@test.com) — ambos con nombre real e iniciales correctas
- Antes del fix: ambas filas mostraban "Usuario" sin email visible

---

## ✅ PASO 27 — RLS endurecido en `file_versions` y `activity_logs`

**Commit:** `docs: add step 27 (RLS for file_versions and activity_logs)`

### Acciones realizadas

- Políticas **restrictivas** sobre `file_versions` (requieren edit en el workspace del file padre) y `activity_logs` (audit immutable con INSERT controlado)
- Nuevo helper `is_workspace_member(uuid)` (security definer, stable) — complementa al `has_workspace_edit_permission` ya existente, pero acepta también rol `viewer`
- Descubrimiento en código: no existe tabla `comments` (no hacía falta política); `activity_logs` se escribe desde el cliente vía `activityService.logActivity`, por eso el viewer debe poder hacer `INSERT`, pero solo con `user_id = auth.uid()`

### SQL aplicado en Supabase

```sql
-- Helper: ¿caller es miembro (cualquier rol) del workspace?
create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean language sql security definer set search_path = public stable
as $$
  select exists (select 1 from public.workspaces w where w.id = p_workspace_id and w.owner_id = auth.uid())
      or exists (select 1 from public.workspace_members m where m.workspace_id = p_workspace_id and m.user_id = auth.uid());
$$;
grant execute on function public.is_workspace_member(uuid) to authenticated;

-- file_versions: INSERT/UPDATE/DELETE requieren edit en el workspace del file padre
create policy "file_versions_insert_requires_edit" on public.file_versions as restrictive for insert to authenticated
with check (exists (select 1 from public.files f where f.id = file_versions.file_id and public.has_workspace_edit_permission(f.workspace_id)));
-- (update/delete análogas con USING)

-- activity_logs: INSERT solo como sí mismo y siendo miembro; UPDATE/DELETE bloqueados
create policy "activity_logs_insert_members_only" on public.activity_logs as restrictive for insert to authenticated
with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));

create policy "activity_logs_no_update" on public.activity_logs as restrictive for update to authenticated using (false);
create policy "activity_logs_no_delete" on public.activity_logs as restrictive for delete to authenticated using (false);
```

### Decisiones técnicas

- `activity_logs` no usa `has_workspace_edit_permission` porque un viewer también necesita registrar "view" / "download" en el log — se usa `is_workspace_member` (más permisivo) + el check `user_id = auth.uid()` para evitar suplantación
- Audit inmutable a nivel DB: ni admin ni owner pueden editar o borrar logs desde el cliente (usar un rol de servicio / SQL editor si hace falta limpiar)
- `file_versions` delega el check al workspace del archivo padre vía JOIN — consistente con cómo se protege `file_shares` en el Paso 25

### Validación end-to-end (Playwright como viewer)

| Intento desde `supabase-js` del navegador | Resultado |
|-------------------------------------------|-----------|
| `INSERT` en `file_versions`               | ❌ 42501 |
| `INSERT` en `activity_logs` con su propio `user_id` | ✅ (audit permitido) |
| `INSERT` en `activity_logs` suplantando a Juan | ❌ 42501 — `activity_logs_insert_members_only` |
| `INSERT` en `activity_logs` en workspace ajeno | ❌ 42501 |
| `UPDATE` en `activity_logs`               | ❌ 0 filas (USING false) |
| `DELETE` en `activity_logs`               | ❌ 0 filas (USING false) |

---

## 🔜 PRÓXIMOS PASOS

- Considerar restrictivas también en `notifications` (no estaba en el roadmap original pero sigue el mismo patrón)

---

## ✅ PASO 28 — Edge Function `upload-file` con verificación de rol

**Commits:**
- `feat: verify workspace edit-permission in upload-file edge function`
- `chore: add gen:types script and regenerate Supabase types`
- `docs: add step 28 (storage hardening)`

### Problema detectado

La Edge Function `upload-file` emitía URLs presignadas de R2 **sin validar el rol** del caller: un viewer autenticado podía subir bytes a cualquier workspace, bypasseando las RLS de `files` aplicadas en el Paso 25 (la fila se rechazaba, pero el blob quedaba en el bucket igual).

### Acciones realizadas

- `supabase/functions/upload-file/index.ts` — ahora crea un cliente Supabase con el JWT del caller, llama a `getUser()` para validar auth, y ejecuta la RPC `has_workspace_edit_permission(workspaceId)` antes de presignar. Devuelve 401 sin auth, 403 sin rol
- `supabase/config.toml` — `verify_jwt = false` para `upload-file`: el gateway de Supabase rechazaba tokens ES256 con `UNSUPPORTED_TOKEN_ALGORITHM`. La auth se hace **dentro** de la función (más estricta: también valida rol, no solo presencia de JWT)
- `package.json` — nuevo script `"gen:types": "supabase gen types typescript --project-id fynllwjgkioyciqxvxet > src/types/databaseTypes.ts"`
- `src/types/databaseTypes.ts` — regenerados, ahora incluyen las 4 RPCs nuevas (`find_profile_by_email`, `has_workspace_edit_permission`, `get_workspace_members`, `is_workspace_member`) con tipos completos

### Deploy

```bash
npx supabase functions deploy upload-file --no-verify-jwt
```

### Decisiones técnicas

- **Auth dentro de la función en vez del gateway**: nuestro check es una superset (requiere también permiso de edición en el workspace); además resuelve el incompat ES256 sin esperar a que Supabase actualice el gateway
- Se reutiliza la RPC `has_workspace_edit_permission` ya existente → misma regla en DB y en Edge, un solo punto de verdad
- El `r2Key` sigue prefijando por `workspaceId/folderId` — además de la auth, hay aislamiento por path

### Validación end-to-end (Playwright, llamada directa a la función)

| Escenario | HTTP | Body |
|-----------|------|------|
| Viewer autenticado → workspace de Juan | **403** | `Forbidden: insufficient role` |
| Sin header `Authorization` | **401** | `Missing Authorization` |
| Owner → su propio workspace | **200** | URL presignada emitida |

---

## ✅ PASO 29 — Cierre de hardening: `notifications` + auditoría de R2

**Commit:** `docs: add step 29 (notifications RLS + R2 audit)`

### Acciones realizadas

- Políticas **restrictivas** en `notifications` para INSERT/UPDATE/DELETE: toda operación queda restringida a filas donde `user_id = auth.uid()`, y el `WITH CHECK` en UPDATE impide transferir una notificación propia a otro usuario
- Auditoría de endpoints R2: no existen Edge Functions de `download-file` ni `delete-file`. Los downloads se resuelven con la URL pública de R2 (bucket público, aislado por prefijo `workspaceId/...`) y los deletes de archivos son soft-delete en DB — los blobs quedan huérfanos pero no se exponen como vector de escritura

### SQL aplicado en Supabase

```sql
create policy "notifications_insert_self_only"
on public.notifications as restrictive for insert to authenticated
with check (user_id = auth.uid());

create policy "notifications_update_self_only"
on public.notifications as restrictive for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "notifications_delete_self_only"
on public.notifications as restrictive for delete to authenticated
using (user_id = auth.uid());
```

### Decisiones técnicas

- Se mantiene el INSERT permitido (en vez de `false` total) porque triggers futuros pueden crear notificaciones en nombre del usuario que las recibe — restringir a `user_id = auth.uid()` bloquea suplantación sin romper triggers legítimos
- UPDATE usa `USING` + `WITH CHECK` del mismo predicado — impide tanto tocar filas ajenas como mover la tuya a otro usuario
- El `r2_key` de los archivos públicos es no-adivinable (`{wsId}/{folderId}/{timestamp}-{sanitizedName}`) y la fila en `files` está protegida por RLS, así que un no-miembro no puede listarlos ni leer los blobs desde la UI, aunque la URL sea teóricamente accesible si alguien la filtra

### Validación end-to-end (Playwright como viewer)

| Intento | Resultado |
|---------|-----------|
| `SELECT` notificaciones de Juan | 0 filas (SELECT RLS ya bloqueaba) |
| `INSERT` notificación suplantando a Juan | ❌ 42501 — `notifications_insert_self_only` |
| `UPDATE` notificación propia transfiriéndola a Juan | ❌ 42501 (WITH CHECK) |
| `UPDATE` masivo sin filtro de id | Solo tocó 3 filas, todas del viewer (USING restringe) |

### Nota sobre un falso positivo

Durante la primera tanda de tests, una función de resumen contaba `.length` del string de fallback (`"no juan notif to test".length === 21`), lo que parecía indicar que el viewer había actualizado 21 filas ajenas. Corregido el resumen, el comportamiento real era: RLS de SELECT bloqueaba al viewer, `juanNotifId` era `undefined`, la rama del `update` no se ejecutaba. Las restrictivas funcionan.

---

## ✅ PASO 30 — Triggers de notificaciones reales

**Commit:** `docs: add step 30 (notification triggers)`

### Contexto

El sistema de notificaciones ya estaba cableado end-to-end desde el Paso 13 (tabla `notifications`, subscripción realtime en el cliente, dropdown con badge de unread). Lo que faltaba era que **se insertaran filas reales** cuando pasaban cosas relevantes en el workspace — hasta ahora solo había notifs manuales/de prueba.

### Acciones realizadas

Tres triggers nuevos en Postgres, todos `SECURITY DEFINER` con `search_path = public`, que insertan en `notifications` cuando ocurre un evento relevante. Todos incluyen un **self-skip**: si `NEW.user_id = auth.uid()` (el actor es el mismo que recibiría la notif), no se inserta — nadie se notifica a sí mismo.

- **Trigger 1 — `notify_workspace_member_added`** (`AFTER INSERT ON workspace_members`): crea notif "Te agregaron a un workspace" con type `success`, mensaje "Ahora sos {role} en \"{workspace_name}\""
- **Trigger 2 — `notify_workspace_role_changed`** (`AFTER UPDATE OF role ON workspace_members`): crea notif "Cambió tu rol" con type `info`, mensaje "Tu rol en \"{workspace_name}\" ahora es {role}"
- **Trigger 3 — `notify_file_shared`** (`AFTER INSERT ON file_shares` donde `shared_with IS NOT NULL`): crea notif "Te compartieron {resource_type}" con type `info`, mensaje "{sharer_name} compartió \"{file_name}\" contigo"

### Decisiones técnicas

- **`SECURITY DEFINER`** en los triggers: la RLS restrictiva del Paso 29 (`notifications_insert_self_only`) solo permite insertar filas con `user_id = auth.uid()`. Los triggers necesitan insertar filas para **otro** usuario (el receptor), así que tienen que ejecutar con permisos del owner de la función, bypasseando RLS
- **Self-skip por `NEW.user_id = auth.uid()`**: evita notifs ruidosas cuando el propio usuario ejecuta la acción que lo afecta (ej. unirse a su propio workspace al crearlo)
- **Sin duplicar contenido UI en el trigger**: el mensaje se arma con `coalesce` sobre lookups de `workspaces.name` / `profiles.full_name` / `files.name` para que si el recurso se renombra el mensaje siga teniendo sentido al momento del insert
- **No se agregaron triggers para `activity_logs`**: la actividad ya se registra ahí; una notif por cada acción sería ruido. Solo eventos con impacto directo sobre el usuario receptor

### Validación end-to-end (Playwright)

Sesión del viewer abierta en `/members`. Se ejecutaron tres SQL desde el SQL editor (service_role → `auth.uid()` NULL → self-skip no dispara, notifs se insertan correctamente):

| Acción SQL | Notif esperada | Badge 🔔 | Resultado |
|-----------|----------------|---------|-----------|
| `UPDATE workspace_members SET role = 'editor'` | "Cambió tu rol" · type `info` | 3 → **4** | ✅ realtime |
| `INSERT INTO file_shares (...)` | "Te compartieron file" · type `info` | 4 → **5** | ✅ realtime |
| `DELETE` + `INSERT INTO workspace_members` | "Te agregaron a un workspace" · type `success` | 5 → **6** | ✅ realtime |

La subscripción realtime del Paso 13 (`supabase.channel('notifications:user_id=eq.{uid}')`) levantó cada `INSERT` y actualizó el badge sin refresh.

---

## ✅ PASO 31 — Mejoras al FilePreviewModal

**Commit:** `feat: improve file preview modal (text, nav, loading/error)`

### Contexto

El `FilePreviewModal` ya existía (imágenes con zoom/rotate, PDF iframe, video, audio y fallback "otro"). Tres huecos UX:

1. Archivos de texto (`.txt`, `.md`, `.json`, `.log`, `.csv`, código…) caían siempre al fallback "sin previsualización"
2. No había estado de carga ni de error — si el blob tardaba o fallaba, el usuario veía un fondo negro sin feedback
3. No se podía navegar entre archivos desde dentro del modal — había que cerrar y abrir el siguiente

### Acciones realizadas

- **Text preview**: `TEXT_EXTENSIONS` con ~45 extensiones comunes (txt/md/json/csv/log + lenguajes + configs). `getFileType` ahora devuelve `"text"` para `text/*`, `application/json`, `application/xml` o extensión listada. Render en `<pre>` con `whitespace-pre-wrap wrap-break-word`, fuente mono, fondo sutil
- **Loading state**: overlay con `Loader2` spinner + texto "Cargando previsualización…" mientras el medio carga. Control via `isLoading` — se baja en `onLoad`/`onLoadedData`/fetch success
- **Error state**: card con `AlertCircle` + CTA de descarga cuando el recurso no carga (`onError` o fetch falla)
- **Navegación con flechas**: `FilePreviewModal` ahora acepta `files?: FileRecord[]` y `onFileChange?: (f) => void`. Render de botones circulares (h-14 w-14, bg blanco, shadow-2xl, ring) a izquierda/derecha + atajos `ArrowLeft` / `ArrowRight`. Contador "N / total" en el header
- **Portal + positioned offsets**: el modal se renderiza via `createPortal(..., document.body)` con `fixed top-16 right-0 bottom-0 left-0` (y `lg:left-16` / `lg:left-64` según `sidebarCollapsed`), de modo que sidebar y header siguen visibles pero el modal llega hasta el fondo del viewport

### Decisiones técnicas

- **Portal a `document.body`** — porque algún ancestor (`animate-fade-in` con `transform: matrix(...)`) creaba stacking context y atrapaba los `position: fixed` del modal, que dejaban un gap negro arriba y no llegaban al fondo. Sacarlo al body rompe esa trampa y el offset manual (`top-16 + lg:left-{16|64}`) preserva la UX que el usuario quería (sidebar/header visibles)
- **Fetch con `AbortController`** en el efecto de texto — al cambiar rápido de archivo con las flechas, se aborta el request anterior para no pisar `textContent` con una respuesta vieja
- **`key={file.id}` en `FilePreviewContent`** — fuerza remount al navegar, reseteando zoom/rotación/loading/error sin lógica manual por prop
- **Flechas más grandes y blancas (`h-14 w-14 bg-white/95 text-gray-900`)**: las primeras estaban en `text-white/40` sobre fondo semi-transparente y prácticamente no se veían; el usuario lo reportó explícitamente

### Validación

- Click en archivo PDF → modal abre en portal, sidebar + header visibles, llega al fondo del viewport, iframe del PDF renderiza dentro
- Cerrar con botón X y con `Esc`
- Con un solo archivo, las flechas no se renderizan (`canPrev` y `canNext` en false)

---

## ✅ PASO 32 — Papelera / Archivados: bulk ops + auto-purga 30 días

**Commit:** `feat: bulk trash/archive ops + 30-day auto-purge`

### Contexto

La papelera y archivados solo permitían restaurar/borrar archivos **de uno en uno**, y el delete permanente dejaba huérfanos los blobs en R2 (solo se borraba la fila en DB). Además, la papelera crecía indefinidamente — los usuarios terminan con cientos de archivos viejos que nunca llegan a borrar manualmente.

### Acciones realizadas

- **Service + hooks bulk**: `fileService.bulkRestore`, `fileService.bulkDelete`, `fileService.emptyTrash` + hooks TanStack Query `useBulkRestoreFiles`, `useBulkDeleteFiles`, `useEmptyTrash`. Cada uno invalida `[FILES_KEY, workspaceId]` al completar y dispara toast con conteo pluralizado
- **`TrashPage`**: checkbox por fila + "Seleccionar todos" con estado `indeterminate` (via `ref.indeterminate = someSelected`), toolbar contextual cuando `selected.size > 0` (restaurar / eliminar seleccionados), botón **"Vaciar papelera"** en el header. Tres `ConfirmDialog` distintos (single delete / bulk delete / empty trash)
- **`ArchivedPage`**: mismo patrón de selección múltiple, botón **"Restaurar todos"** en el header, bulk restore desde toolbar
- **Edge function `purge-files`** (Deno / AWS SDK S3): tres modos
  - `user_ids` → valida JWT + `has_workspace_edit_permission` RPC por cada workspace tocado, borra los IDs pasados
  - `user_workspace_trash` → valida edit permission del workspace, borra todos los `status='deleted'` de ese workspace
  - `auto_purge` → verifica que el `Authorization` sea el service_role key, borra todos los `status='deleted'` con `updated_at < now() - 30d`
  Limpia blobs en R2 con `DeleteObjectsCommand` en batches de 1000, luego borra las filas en DB con admin client
- **Cliente cableado al edge function**: `deleteFile`, `bulkDelete` y `emptyTrash` ahora hacen `fetch` a `/functions/v1/purge-files` en lugar de `supabase.from('files').delete()` directo — así R2 queda limpio en cada eliminación permanente
- **pg_cron diario** (`supabase/sql/auto_purge_cron.sql`): job `cloudsyncpro-auto-purge-trash` corre a las 03:15 UTC y hace `net.http_post` al edge function con `mode: 'auto_purge'`. La URL del proyecto y el service_role key viven en `vault.decrypted_secrets` (nunca en el SQL)

### Decisiones técnicas

- **Edge function hace las dos cosas (R2 + DB)**, no el cliente — si dividiéramos (cliente borra DB, edge function borra R2), un fallo de red entre las dos llamadas deja R2 con blobs huérfanos apuntados por filas que ya no existen. Con todo en el server: los errores de R2 se loguean pero **no abortan el DELETE de DB** (preferimos blobs huérfanos ocasionales a "ghost rows" visibles en la UI)
- **Detectar service_role en el edge function comparando el Bearer con `SUPABASE_SERVICE_ROLE_KEY`** — Supabase no expone el rol del caller a funciones Deno, así que el modo `auto_purge` tiene que autenticarse con el mismo key que la cron job pasa en el header
- **pg_cron con secretos en Vault**, no inline en el SQL — el archivo del repo es seguro de commitear porque solo referencia nombres de secretos; los valores reales los cargó el usuario en Dashboard → Vault
- **`indeterminate` checkbox** via callback ref (`ref={(el) => { if (el) el.indeterminate = someSelected }}`) — no existe como prop de React, hay que setearlo imperativamente después del mount
- **`emptyTrash` del cliente sigue leyendo los IDs antes de invocar** para poder loguear la actividad con el conteo correcto; el `purged` devuelto por el server es el source of truth

### Validación

- Seleccionar 2 archivos en papelera → toolbar muestra "2 seleccionados" con botones restaurar/eliminar, funcionan ambos
- "Vaciar papelera" con 3 archivos → confirm dialog, luego toast "Papelera vaciada (3 archivos)", DB y R2 limpios
- Vaciar cuando ya está vacía → toast info "La papelera ya estaba vacía" (no llama al edge function)
- `ArchivedPage` con bulk restore de 2 archivos → vuelven a `status='active'` y aparecen en la lista principal

---

## 🔜 PRÓXIMOS PASOS

- Volver a trabajo de producto: features pendientes o mejoras UX — el hardening queda cerrado por ahora