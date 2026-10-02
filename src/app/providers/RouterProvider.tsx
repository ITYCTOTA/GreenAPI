import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "@app/store/store";
import { ProtectedRoute } from "@app/providers/ProtectedRoute";
import { Layout } from "../layout/Layout";
import { ROUTES } from "@/shared/lib/routes";
import { EmptyChat } from "@/pages/chats/EmptyChat";
import { SelectedChat } from "@/pages/chats/SelectedChat";
import { Login } from "@/pages/login/Login";
import { Settings } from "@/pages/settings/Settings";

function RootRedirect() {
  const isConnected = useSelector(
    (state: RootState) => state.connection.status === "connected",
  );
  return <Navigate to={isConnected ? ROUTES.CHATS : ROUTES.LOGIN} replace />;
}

export function RouterProvider() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.ROOT} element={<RootRedirect />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path={ROUTES.CHATS} element={<EmptyChat />} />
            <Route path={ROUTES.SELECTEDCHAT} element={<SelectedChat />} />
            <Route path={ROUTES.SETTINGS} element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
