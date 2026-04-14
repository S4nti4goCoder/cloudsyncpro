# 📋 Historial Técnico — CloudSyncPro

> Este archivo registra todos los pasos, decisiones técnicas, configuraciones y funcionalidades implementadas durante el desarrollo de CloudSyncPro. Se actualiza en cada paso del proceso de construcción.

---

## ✅ PASO 1 — Scaffolding e infraestructura base

**Fecha:** [completar al ejecutar]
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

## 🔜 PRÓXIMOS PASOS

- **Paso 2:** Supabase client + tipos de base de datos + Auth store (Zustand) + React Query setup
- **Paso 3:** Esquema de base de datos en Supabase (tablas, RLS, políticas)
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