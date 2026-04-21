import { Navigate, Route, Routes } from "react-router-dom";
import NavShell from "./components/NavShell";
import Palace from "./routes/Palace";
import Sessions from "./routes/Sessions";

export default function App() {
  return (
    <NavShell>
      <Routes>
        <Route path="/" element={<Navigate to="/palace" replace />} />
        <Route path="/palace" element={<Palace />} />
        <Route path="/sessions" element={<Sessions />} />
        {/* Legacy /search alias kept for existing bookmarks */}
        <Route path="/search" element={<Navigate to="/sessions" replace />} />
        <Route path="*" element={<Navigate to="/palace" replace />} />
      </Routes>
    </NavShell>
  );
}
