import { Link } from "react-router-dom";

import { ROUTES } from "@shared/lib/routes";

export function Settings() {
  return (
    <section className="settings-page">
      <Link className="settings-page__back" to={ROUTES.CHATS}>
        ← К чатам
      </Link>
      <h1>Настройки</h1>
      <p>Здесь будут учётные данные подключения GREEN-API.</p>
    </section>
  );
}
