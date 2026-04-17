import { supabase } from "@/lib/supabase";
import type { UserRole } from "@/types/authTypes";

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
    const { data, error } = await supabase
      .from("workspace_members")
      .select(
        "id, user_id, workspace_id, role, joined_at, user:profiles!workspace_members_user_id_fkey(id, full_name, email, avatar_url)",
      )
      .eq("workspace_id", workspaceId)
      .order("joined_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as WorkspaceMemberWithProfile[];
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
