import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types/authTypes";

interface GetWorkspaceMembersRow {
  id: string;
  user_id: string;
  workspace_id: string;
  role: UserRole;
  joined_at: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export interface WorkspaceMemberWithProfile {
  id: string;
  user_id: string;
  workspace_id: string;
  role: UserRole;
  joined_at: string;
  user: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

export const memberService = {
  async getMembers(workspaceId: string): Promise<WorkspaceMemberWithProfile[]> {
    const { data, error } = await supabase.rpc("get_workspace_members", {
      p_workspace_id: workspaceId,
    });

    if (error) throw error;
    return (data ?? []).map((row: GetWorkspaceMembersRow) => ({
      id: row.id,
      user_id: row.user_id,
      workspace_id: row.workspace_id,
      role: row.role,
      joined_at: row.joined_at,
      user: {
        id: row.user_id,
        full_name: row.full_name,
        email: row.email,
        avatar_url: row.avatar_url,
      },
    }));
  },

  async updateMemberRole(
    memberId: string,
    role: UserRole,
  ): Promise<void> {
    const { error } = await supabase
      .from("workspace_members")
      .update({ role })
      .eq("id", memberId);

    if (error) throw error;
  },

  async removeMember(memberId: string): Promise<void> {
    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("id", memberId);

    if (error) throw error;
  },

  async inviteMember(
    workspaceId: string,
    email: string,
    role: UserRole,
  ): Promise<void> {
    const { data: matches, error: profileError } = await supabase.rpc(
      "find_profile_by_email",
      { p_email: email },
    );

    const profile = matches?.[0];
    if (profileError || !profile) {
      throw new Error("No se encontró un usuario con ese email");
    }

    const { data: existing } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("user_id", profile.id)
      .maybeSingle();

    if (existing) {
      throw new Error("Este usuario ya es miembro del workspace");
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("workspace_members").insert({
      workspace_id: workspaceId,
      user_id: profile.id,
      role,
      invited_by: user?.id ?? null,
    });

    if (error) throw error;
  },
};
