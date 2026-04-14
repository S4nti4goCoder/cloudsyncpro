/**
 * Database type definitions for Supabase.
 * This file is the source of truth for all database types.
 * It will be expanded as we add tables in the migrations.
 *
 * In the future, this can be auto-generated with:
 * npx supabase gen types typescript --project-id <your-project-id> > src/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'superadmin' | 'admin' | 'editor' | 'viewer'
      file_status: 'active' | 'archived' | 'deleted'
      permission_type: 'view' | 'edit' | 'delete' | 'share'
    }
  }
}

// ============================================
// Convenience type aliases
// ============================================

export type UserRole = Database['public']['Enums']['user_role']
export type FileStatus = Database['public']['Enums']['file_status']
export type PermissionType = Database['public']['Enums']['permission_type']