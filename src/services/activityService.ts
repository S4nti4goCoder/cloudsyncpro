import { supabase } from "@/lib/supabase";
import type { ActivityAction, ActivityLog } from "@/types/authTypes";
import type { Json } from "@/types/databaseTypes";

export interface ActivityUser {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

export interface ActivityWithUser extends ActivityLog {
  user: ActivityUser | null;
}

export interface ActivityFilters {
  actions?: ActivityAction[];
  from?: string | null;
  to?: string | null;
  limit?: number;
  offset?: number;
}

export interface ActivityPage {
  items: ActivityWithUser[];
  total: number;
}

interface LogActivityInput {
  workspaceId: string;
  action: ActivityAction;
  resourceType?: string | null;
  resourceId?: string | null;
  resourceName?: string | null;
  metadata?: { [key: string]: Json | undefined };
}

export const activityService = {
  async logActivity(input: LogActivityInput): Promise<void> {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("activity_logs").insert({
      workspace_id: input.workspaceId,
      user_id: session.user.id,
      action: input.action,
      resource_type: input.resourceType ?? null,
      resource_id: input.resourceId ?? null,
      resource_name: input.resourceName ?? null,
      metadata: input.metadata ?? {},
    });

    if (error) {
      console.error("Failed to log activity:", error.message);
    }
  },

  async getResourceActivities(
    resourceId: string,
    workspaceId?: string,
  ): Promise<ActivityWithUser[]> {
    let query = supabase
      .from("activity_logs")
      .select(
        "*, user:profiles!activity_logs_user_id_fkey(id, full_name, email, avatar_url)",
      )
      .eq("resource_id", resourceId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (workspaceId) {
      query = query.eq("workspace_id", workspaceId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as ActivityWithUser[];
  },

  async getActivities(
    workspaceId: string,
    filters: ActivityFilters = {},
  ): Promise<ActivityPage> {
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    let query = supabase
      .from("activity_logs")
      .select(
        "*, user:profiles!activity_logs_user_id_fkey(id, full_name, email, avatar_url)",
        { count: "exact" },
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    if (filters.actions?.length) {
      query = query.in("action", filters.actions);
    }
    if (filters.from) {
      query = query.gte("created_at", filters.from);
    }
    if (filters.to) {
      query = query.lte("created_at", filters.to);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      items: (data ?? []) as ActivityWithUser[],
      total: count ?? 0,
    };
  },
};
