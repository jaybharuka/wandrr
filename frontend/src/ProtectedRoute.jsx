import { Navigate } from "react-router-dom";
import { useUser } from "./UserContext";

export default function ProtectedRoute({ children }) {
  const { user } = useUser();
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}
