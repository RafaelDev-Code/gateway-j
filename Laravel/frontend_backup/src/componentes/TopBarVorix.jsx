import { Moon, Sun, Bell, User, Menu } from "lucide-react";
import { theme } from "../theme";

const BG = "rgba(6, 1, 2, 0.35)";
const BORDER = "rgba(255, 255, 255, 0.06)";

export function TopBarVorix({ pageTitle = "Pagamentos", showMenuButton = false, onMenuClick }) {
  return (
    <header
      className="topbar-vorix"
      style={{
        position: "relative",
        minHeight: 72,
        background: BG,
        backdropFilter: "blur(26px)",
        WebkitBackdropFilter: "blur(26px)",
        borderBottom: `1px solid ${BORDER}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        fontFamily: "var(--font-body)",
      }}
    >
      <div className="glass-grain" aria-hidden />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {showMenuButton && (
          <button
            type="button"
            onClick={onMenuClick}
            className="btn-futurist btn-futurist-outline"
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              color: theme.text,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
        )}
        <h1
        className="font-heading"
        style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 700,
          color: theme.text,
          letterSpacing: "-0.02em",
          fontFamily: "var(--font-heading)",
        }}
      >
        {pageTitle}
      </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Theme toggle */}
        <div
          className="btn-futurist-outline"
          style={{
            display: "flex",
            alignItems: "center",
            borderRadius: 10,
            padding: 4,
            gap: 2,
          }}
        >
          <button
            className="btn-futurist"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: theme.accentSoft,
              border: "none",
              color: theme.text,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Dark mode"
          >
            <Moon size={18} />
          </button>
          <button
            className="btn-futurist"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "transparent",
              border: "none",
              color: theme.textMuted,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Light mode"
          >
            <Sun size={18} />
          </button>
        </div>

        {/* Notifications */}
        <button
          className="btn-futurist btn-futurist-outline"
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            color: theme.textMuted,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: theme.accent,
              border: "2px solid " + BG,
              boxShadow: `0 0 8px ${theme.accentGlow}`,
            }}
          />
        </button>

        {/* Avatar */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.08)",
            border: "2px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <User size={22} style={{ color: theme.textMuted }} />
          <span
            style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: theme.success,
              border: "2px solid " + BG,
            }}
          />
        </div>
      </div>
    </header>
  );
}
