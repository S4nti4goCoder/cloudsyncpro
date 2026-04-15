import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type UserRole = "superadmin" | "admin" | "editor" | "viewer";

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  storage_used: number;
  files_count: number;
}

export interface SystemStats {
  total_users: number;
  total_files: number;
  total_storage: number;
  total_workspaces: number;
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          email,
          role,
          avatar_url,
          created_at
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const usersWithStats = await Promise.all(
        (data ?? []).map(async (user) => {
          const { data: files } = await supabase
            .from("files")
            .select("size")
            .eq("uploaded_by", user.id)
            .eq("status", "active");

          const storage_used = (files ?? []).reduce(
            (acc, f) => acc + (f.size ?? 0),
            0,
          );
          const files_count = files?.length ?? 0;

          return {
            ...user,
            storage_used,
            files_count,
          } as AdminUser;
        }),
      );

      return usersWithStats;
    },
  });
}

export function useSystemStats() {
  return useQuery({
    queryKey: ["system-stats"],
    queryFn: async () => {
      const [usersResult, filesResult, workspacesResult] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase
          .from("files")
          .select("size", { count: "exact" })
          .eq("status", "active"),
        supabase.from("workspaces").select("id", { count: "exact" }),
      ]);

      const totalStorage = (filesResult.data ?? []).reduce(
        (acc, f) => acc + (f.size ?? 0),
        0,
      );

      return {
        total_users: usersResult.count ?? 0,
        total_files: filesResult.count ?? 0,
        total_storage: totalStorage,
        total_workspaces: workspacesResult.count ?? 0,
      } as SystemStats;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: UserRole;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Rol actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Error al actualizar el rol");
    },
  });
}
