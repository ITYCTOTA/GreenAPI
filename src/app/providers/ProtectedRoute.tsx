import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "@app/store/store";
import { ROUTES } from "@shared/lib/routes";

export function ProtectedRoute() {
  const isConnected = useSelector(
    (state: RootState) => state.connection.status === "connected",
  );
  return isConnected ? <Outlet /> : <Navigate to={ROUTES.LOGIN} replace />;
}
