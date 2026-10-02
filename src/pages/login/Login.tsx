import { useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import type { RootState } from "@app/store/store";
import { clearChats } from "@entities/chat/model/chatsSlice";
import {
  CONNECTION_STORAGE_KEY,
  connect,
  setConnectionError,
  startConnectionCheck,
} from "@entities/connection/model/connectionSlice";
import { clearMessages } from "@entities/message/model/messagesSlice";
import { validateGreenApiConnection } from "@shared/api/greenApiClient";
import { ROUTES } from "@shared/lib/routes";

export function Login() {
  const dispatch = useDispatch();
  const { status, error, idInstance: savedId, apiTokenInstance: savedToken } =
    useSelector((state: RootState) => state.connection);
  const [idInstance, setIdInstance] = useState(savedId);
  const [apiTokenInstance, setApiTokenInstance] = useState(savedToken);

  if (status === "connected") return <Navigate to={ROUTES.CHATS} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    };
    if (!credentials.idInstance || !credentials.apiTokenInstance) {
      dispatch(setConnectionError("Заполните idInstance и apiTokenInstance."));
      return;
    }
    dispatch(startConnectionCheck(undefined));

    try {
      await validateGreenApiConnection(credentials);
      localStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(credentials));
      if (
        credentials.idInstance !== savedId ||
        credentials.apiTokenInstance !== savedToken
      ) {
        dispatch(clearChats(undefined));
        dispatch(clearMessages(undefined));
      }
      dispatch(connect(credentials));
    } catch (caughtError) {
      dispatch(
        setConnectionError(
          caughtError instanceof Error
            ? caughtError.message
            : "Не удалось проверить подключение к GREEN-API.",
        ),
      );
    }
  }

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-form__heading">
          <p className="login-form__eyebrow">GREEN-API</p>
          <h1>Подключение инстанса</h1>
        </div>
        <p className="login-form__description">
          Введите готовые учётные данные из личного кабинета GREEN-API.
        </p>
        <label className="form-field">
          <span>idInstance</span>
          <input
            value={idInstance}
            onChange={(event) => setIdInstance(event.target.value)}
            className="text-input"
            autoComplete="username"
          />
        </label>
        <label className="form-field">
          <span>apiTokenInstance</span>
          <input
            value={apiTokenInstance}
            onChange={(event) => setApiTokenInstance(event.target.value)}
            className="text-input"
            type="password"
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p className="login-form__error" role="alert">
            {error}
          </p>
        )}
        <button
          className="button--primary login-form__submit"
          type="submit"
          disabled={status === "checking"}
        >
          {status === "checking" ? "Проверяем подключение…" : "Войти"}
        </button>
      </form>
    </main>
  );
}
