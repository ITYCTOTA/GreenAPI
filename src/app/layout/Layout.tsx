import { Outlet, useLocation } from "react-router-dom";

import { ControlPanel } from "@/widgets/control-panel";

export function Layout() {
  const { pathname } = useLocation();
  const isDetailOpen =
    /^\/chats\/[^/]+\/?$/.test(pathname) || /^\/settings\/?$/.test(pathname);

  return (
    <main
      className={`app-layout${isDetailOpen ? " app-layout--detail-open" : ""}`}
    >
      <ControlPanel />
      <section className="app-layout__content">
        <Outlet />
      </section>
    </main>
  );
}
