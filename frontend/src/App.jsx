import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth, RequireRole } from "./auth/RequireAuth";
import { AppShell } from "./components/AppShell";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import MyProfile from "./pages/MyProfile";
import Students from "./pages/Students";
import StudentProfile from "./pages/StudentProfile";
import Connections from "./pages/Connections";
import Events from "./pages/Events";
import Notifications from "./pages/Notifications";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Feed />} />
        <Route path="profile" element={<MyProfile />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:userId" element={<StudentProfile />} />
        <Route path="connections" element={<Connections />} />
        <Route path="events" element={<Events />} />
        <Route path="notifications" element={<Notifications />} />
        <Route
          path="admin"
          element={
            <RequireRole role="admin">
              <Admin />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
