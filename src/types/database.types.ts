export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          slug: string;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          slug: string;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          slug?: string;
          updated_at?: string;
        };
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: UserRole;
          invited_by: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: UserRole;
          invited_by?: string | null;
          joined_at?: string;
        };
        Update: {
          role?: UserRole;
        };
      };
      folders: {
        Row: {
          id: string;
          name: string;
          workspace_id: string;
          parent_id: string | null;
          created_by: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          workspace_id: string;
          parent_id?: string | null;
          created_by: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          parent_id?: string | null;
          metadata?: Json;
          updated_at?: string;
        };
      };
      files: {
        Row: {
          id: string;
          name: string;
          original_name: string;
          size: number;
          mime_type: string;
          extension: string;
          r2_key: string;
          workspace_id: string;
          folder_id: string | null;
          uploaded_by: string;
          status: FileStatus;
          metadata: Json;
          version: number;
          embedding: number[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          original_name: string;
          size: number;
          mime_type: string;
          extension: string;
          r2_key: string;
          workspace_id: string;
          folder_id?: string | null;
          uploaded_by: string;
          status?: FileStatus;
          metadata?: Json;
          version?: number;
          embedding?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          folder_id?: string | null;
          status?: FileStatus;
          metadata?: Json;
          version?: number;
          embedding?: number[] | null;
          updated_at?: string;
        };
      };
      file_versions: {
        Row: {
          id: string;
          file_id: string;
          version: number;
          r2_key: string;
          size: number;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          file_id: string;
          version: number;
          r2_key: string;
          size: number;
          uploaded_by: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      file_shares: {
        Row: {
          id: string;
          resource_id: string;
          resource_type: "file" | "folder";
          share_type: ShareType;
          shared_with: string | null;
          shared_role: UserRole | null;
          permissions: PermissionType[];
          shared_by: string;
          token: string | null;
          password: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          resource_id: string;
          resource_type: "file" | "folder";
          share_type: ShareType;
          shared_with?: string | null;
          shared_role?: UserRole | null;
          permissions?: PermissionType[];
          shared_by: string;
          token?: string | null;
          password?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          permissions?: PermissionType[];
          password?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string | null;
          action: ActivityAction;
          resource_id: string | null;
          resource_type: "file" | "folder" | "workspace" | "share" | null;
          resource_name: string | null;
          metadata: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id?: string | null;
          action: ActivityAction;
          resource_id?: string | null;
          resource_type?: "file" | "folder" | "workspace" | "share" | null;
          resource_name?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: "info" | "success" | "warning" | "error";
          resource_id: string | null;
          resource_type: "file" | "folder" | "workspace" | "share" | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: "info" | "success" | "warning" | "error";
          resource_id?: string | null;
          resource_type?: "file" | "folder" | "workspace" | "share" | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_files: {
        Args: {
          p_workspace_id: string;
          p_query: string;
          p_mime_types?: string[] | null;
          p_uploaded_by?: string | null;
          p_date_from?: string | null;
          p_date_to?: string | null;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: {
          id: string;
          name: string;
          mime_type: string;
          size: number;
          extension: string;
          folder_id: string | null;
          uploaded_by: string;
          status: FileStatus;
          metadata: Json;
          created_at: string;
          updated_at: string;
          relevance: number;
        }[];
      };
      get_workspace_stats: {
        Args: { p_workspace_id: string };
        Returns: {
          total_files: number;
          total_size: number;
          total_folders: number;
          files_by_type: Json;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      file_status: FileStatus;
      permission_type: PermissionType;
      activity_action: ActivityAction;
      share_type: ShareType;
    };
  };
};

// ============================================
// Enum types
// ============================================

export type UserRole = "superadmin" | "admin" | "editor" | "viewer";
export type FileStatus = "active" | "archived" | "deleted";
export type PermissionType = "view" | "edit" | "delete" | "share";
export type ActivityAction =
  | "upload"
  | "download"
  | "view"
  | "move"
  | "rename"
  | "delete"
  | "archive"
  | "restore"
  | "share"
  | "unshare"
  | "create_folder"
  | "update_metadata"
  | "create_version";
export type ShareType = "user" | "role" | "public";

// ============================================
// Row type aliases for convenience
// ============================================

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type WorkspaceMember =
  Database["public"]["Tables"]["workspace_members"]["Row"];
export type Folder = Database["public"]["Tables"]["folders"]["Row"];
export type File = Database["public"]["Tables"]["files"]["Row"];
export type FileVersion = Database["public"]["Tables"]["file_versions"]["Row"];
export type FileShare = Database["public"]["Tables"]["file_shares"]["Row"];
export type ActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
