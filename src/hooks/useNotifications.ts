import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { Notification } from "@/types/authTypes";

const NOTIFICATIONS_KEY = "notifications";

const activeChannels = new Map<string, ReturnType<typeof supabase.channel>>();

function subscribeToNotifications(userId: string, onUpdate: () => void) {
  if (activeChannels.has(userId)) return;

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      onUpdate,
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      onUpdate,
    )
    .subscribe();

  activeChannels.set(userId, channel);
}

function unsubscribeFromNotifications(userId: string) {
  const channel = activeChannels.get(userId);
  if (channel) {
    void supabase.removeChannel(channel);
    activeChannels.delete(userId);
  }
}

export function useNotifications() {
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [NOTIFICATIONS_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    subscribeToNotifications(userId, () => {
      void queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_KEY, userId],
      });
    });

    return () => {
      unsubscribeFromNotifications(userId);
    };
  }, [userId, queryClient]);

  return query;
}

export function useUnreadCount() {
  const { data: notifications } = useNotifications();
  return notifications?.filter((n) => !n.is_read).length ?? 0;
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_KEY, userId],
      });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);

  return useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [NOTIFICATIONS_KEY, userId],
      });
    },
  });
}
