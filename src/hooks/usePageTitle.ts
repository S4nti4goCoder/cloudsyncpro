import { useEffect } from "react";

const APP_NAME = "CloudSyncPro";

/**
 * Sets document.title to "{title} · CloudSyncPro" while the component is mounted.
 * On unmount, restores the previous title.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
