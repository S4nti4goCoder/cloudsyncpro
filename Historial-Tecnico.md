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

## 🔜 PRÓXIMOS PASOS

- **Paso 14:** Panel de administración
- **Paso 15:** Auditoría de actividad