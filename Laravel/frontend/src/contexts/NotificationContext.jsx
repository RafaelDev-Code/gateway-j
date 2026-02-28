import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiJson } from "../api/client";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(() => {
    if (!isAuthenticated) return;
    apiJson("/notifications/unread-count")
      .then((r) => setUnreadCount(r?.count ?? 0))
      .catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCount();
    const id = setInterval(refreshCount, 60_000);
    return () => clearInterval(id);
  }, [refreshCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refreshCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
