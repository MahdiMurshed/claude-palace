import { Navigate, Route, Routes } from "react-router-dom";
import NavShell from "./components/NavShell";
import Palace from "./routes/Palace";
import Search from "./routes/Search";

export default function App() {
  return (
    <NavShell>
      <Routes>
        <Route path="/" element={<Navigate to="/palace" replace />} />
        <Route path="/palace" element={<Palace />} />
        <Route path="/search" element={<Search />} />
        <Route path="*" element={<Navigate to="/palace" replace />} />
      </Routes>
    </NavShell>
  );
}
