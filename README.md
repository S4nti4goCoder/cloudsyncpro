# ☁️ CloudSyncPro

**CloudSyncPro** is a modern, full-featured cloud file management platform built with React, TypeScript, Supabase, and Cloudflare R2. Inspired by Google Drive and Dropbox — but fully self-hosted and customizable.

---

## ✨ Features

- 🔐 Authentication (Email + Google OAuth) via Supabase
- 👥 Roles: Superadmin, Admin, Editor, Viewer (RLS-enforced)
- 🗂️ Workspaces per team / department / project
- 📁 Hierarchical folders and subfolders
- ☁️ File upload to Cloudflare R2 (via Edge Function presigned URLs)
- 👁️ Preview: images, PDFs, Office documents
- 🖱️ Drag & drop for uploading and moving files/folders
- 🔗 Public share links with expiration and optional password
- 🔍 Advanced search: full-text, filters, semantic (pgvector)
- 🏷️ Custom metadata per folder / file type
- 📜 File version history
- 🗑️ Archive system + Recycle bin
- 🔔 Real-time notifications via Supabase Realtime
- 📊 Dashboard with list/grid views and Recharts analytics
- 🌙 Dark / Light theme

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand + TanStack Query v5 |
| Routing | React Router v6 |
| Backend | Supabase (Auth + DB + Realtime + Edge Functions) |
| Storage | Cloudflare R2 |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | Sonner |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- A Supabase project ([supabase.com](https://supabase.com))
- A Cloudflare account with R2 enabled ([cloudflare.com](https://cloudflare.com))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/cloudsyncpro.git
cd cloudsyncpro

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and R2 credentials

# 4. Start the development server
npm run dev
```

### Supabase Setup

1. Go to your Supabase project dashboard
2. Run the SQL migrations in order from `/supabase/migrations/`
3. Enable Google OAuth in **Authentication > Providers**
4. Deploy Edge Functions with `supabase functions deploy`

---

## 📁 Project Structure