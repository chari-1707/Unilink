import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/client";

function SideLink({ to, children, end, badge, onClick }) {
  return (
    <NavLink to={to} end={end} onClick={onClick} className={({ isActive }) => `navlink ${isActive ? "active" : ""}`}>
      <span>{children}</span>
      {badge ? <span className="navBadge">{badge > 9 ? "9+" : badge}</span> : null}
    </NavLink>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      try {
        const data = await apiFetch("/api/notifications");
        if (!cancelled) setUnreadNotifications(data.unreadCount || 0);
      } catch {
        if (!cancelled) setUnreadNotifications(0);
      }
    }

    loadNotifications();
    const id = setInterval(loadNotifications, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    function onNotificationsReadAll() {
      setUnreadNotifications(0);
    }
    window.addEventListener("notifications:read-all", onNotificationsReadAll);
    return () => window.removeEventListener("notifications:read-all", onNotificationsReadAll);
  }, []);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">U</div>
          <div>
            <div className="brandName">UniLink</div>
            <div className="brandSub">Campus networking</div>
          </div>
        </div>

        <div className="nav">
          <SideLink to="/app" end>Feed</SideLink>
          <SideLink to="/app/profile">My Profile</SideLink>
          <SideLink to="/app/students">Students</SideLink>
          <SideLink to="/app/connections">Connections</SideLink>
          <SideLink to="/app/events">Events</SideLink>
          <SideLink
            to="/app/notifications"
            badge={unreadNotifications}
            onClick={() => {
              setUnreadNotifications(0);
            }}
          >
            Notifications
          </SideLink>
          {user?.role === "admin" ? <SideLink to="/app/admin">Admin</SideLink> : null}
        </div>

        <div className="sidebarFooter">
          <div className="miniUser">
            <div className="avatar">{user?.name?.slice(0, 1)?.toUpperCase() || "?"}</div>
            <div className="miniUserMeta">
              <div className="miniUserName">{user?.name}</div>
              <div className="miniUserRole">{user?.role}</div>
            </div>
          </div>
          <button
            className="btn ghost"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbarTitle">Welcome back, {user?.name?.split(" ")[0] || "Student"}</div>
          <div className="topbarHint">Stay updated. Connect. Collaborate.</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

