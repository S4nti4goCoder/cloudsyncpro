import { useQuery } from "@tanstack/react-query";
import {
  activityService,
  type ActivityFilters,
  type ActivityPage,
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
