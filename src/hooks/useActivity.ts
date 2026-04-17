import { useQuery } from "@tanstack/react-query";
import {
  activityService,
  type ActivityFilters,
  type ActivityPage,
  type ActivityWithUser,
} from "@/services/activityService";

const ACTIVITY_KEY = "activity";

export function useActivities(workspaceId: string, filters: ActivityFilters) {
  return useQuery<ActivityPage>({
    queryKey: [ACTIVITY_KEY, workspaceId, filters],
    queryFn: () => activityService.getActivities(workspaceId, filters),
    enabled: !!workspaceId,
    staleTime: 30_000,
  });
}

export function useResourceActivities(resourceId: string | null, workspaceId?: string) {
  return useQuery<ActivityWithUser[]>({
    queryKey: [ACTIVITY_KEY, "resource", resourceId, workspaceId],
    queryFn: () => activityService.getResourceActivities(resourceId!, workspaceId),
    enabled: !!resourceId,
    staleTime: 30_000,
  });
}
