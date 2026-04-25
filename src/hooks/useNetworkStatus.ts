import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Watches navigator.onLine and shows a toast when connectivity changes.
 * Returns nothing — purely side-effecting.
 */
export function useNetworkStatus() {
  // Track first run so we don't toast at app boot if already online.
  const wasOffline = useRef(
    typeof navigator !== "undefined" && !navigator.onLine,
  );

  useEffect(() => {
    function handleOnline() {
      if (wasOffline.current) {
        toast.success("Conexión restaurada", {
          id: "network-status",
          description: "Volviste a estar en línea.",
        });
      }
      wasOffline.current = false;
    }

    function handleOffline() {
      wasOffline.current = true;
      toast.error("Sin conexión", {
        id: "network-status",
        description:
          "Revisa tu conexión a internet. Algunas acciones no funcionarán.",
        duration: Infinity,
      });
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) handleOffline();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
}
