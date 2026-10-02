import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "@app/store/store";
import {
  connect,
  setConnectionError,
} from "@entities/connection/model/connectionSlice";
import { validateGreenApiConnection } from "@shared/api/greenApiClient";

export function ConnectionInitializer() {
  const dispatch = useDispatch();
  const { idInstance, apiTokenInstance, status } = useSelector(
    (state: RootState) => state.connection,
  );
  const initialConnection = useRef({ idInstance, apiTokenInstance, status });

  useEffect(() => {
    const initial = initialConnection.current;
    if (
      initial.status !== "checking" ||
      !initial.idInstance ||
      !initial.apiTokenInstance
    )
      return;
    let isActive = true;
    const credentials = {
      idInstance: initial.idInstance,
      apiTokenInstance: initial.apiTokenInstance,
    };

    void validateGreenApiConnection(credentials).then(
      () => {
        if (isActive) dispatch(connect(credentials));
      },
      (error: unknown) => {
        if (!isActive) return;
        dispatch(
          setConnectionError(
            error instanceof Error
              ? error.message
              : "Не удалось проверить сохранённое подключение к GREEN-API.",
          ),
        );
      },
    );

    return () => {
      isActive = false;
    };
  }, [dispatch]);

  return null;
}
