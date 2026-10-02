import type { ConnectionCredentials } from "@entities/connection/model/connectionSlice";

const API_URL = "https://api.green-api.com";

type InstanceStateResponse = { stateInstance?: string };

const connectionValidationRequests = new Map<string, Promise<void>>();

export type GreenApiNotification = {
  receiptId: number;
  body: {
    typeWebhook?: string;
    timestamp?: number;
    senderData?: { chatId?: string; senderName?: string; sender?: string };
    messageData?: {
      typeMessage?: string;
      textMessageData?: { textMessage?: string };
    };
  };
};

export class GreenApiError extends Error {
  readonly authentication: boolean;

  constructor(
    message: string,
    authentication = false,
  ) {
    super(message);
    this.name = "GreenApiError";
    this.authentication = authentication;
  }
}

type SendTextMessageParams = ConnectionCredentials & {
  phone: string;
  message: string;
};

export function validateGreenApiConnection(
  credentials: ConnectionCredentials,
): Promise<void> {
  const key = JSON.stringify([
    credentials.idInstance,
    credentials.apiTokenInstance,
  ]);
  const existingRequest = connectionValidationRequests.get(key);
  if (existingRequest) return existingRequest;

  const request = checkGreenApiConnection(credentials);
  connectionValidationRequests.set(key, request);
  void request.then(
    () => connectionValidationRequests.delete(key),
    () => connectionValidationRequests.delete(key),
  );
  return request;
}

async function checkGreenApiConnection({
  idInstance,
  apiTokenInstance,
}: ConnectionCredentials): Promise<void> {
  const response = await fetch(
    `${API_URL}/waInstance${encodeURIComponent(idInstance)}/getStateInstance/${encodeURIComponent(apiTokenInstance)}`,
  );

  if (!response.ok) {
    throw new GreenApiError(
      response.status === 401 || response.status === 403
        ? "GREEN-API отклонил idInstance или apiTokenInstance."
        : response.status === 429
          ? "GREEN-API временно ограничил частоту запросов. Подождите и повторите попытку."
          : "Не удалось проверить подключение к GREEN-API.",
      response.status === 401 || response.status === 403,
    );
  }

  const payload = (await response.json()) as InstanceStateResponse;
  if (payload.stateInstance !== "authorized") {
    throw new GreenApiError(
      "Инстанс не авторизован в MAX. Проверьте его состояние в GREEN-API.",
    );
  }
}

export async function sendTextMessage({
  idInstance,
  apiTokenInstance,
  phone,
  message,
}: SendTextMessageParams): Promise<void> {
  const chatId = `${phone.replace(/\D/g, "")}@c.us`;
  const response = await fetch(
    `${API_URL}/waInstance${encodeURIComponent(idInstance)}/sendMessage/${encodeURIComponent(apiTokenInstance)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, message }),
    },
  );

  if (!response.ok) {
    throw new GreenApiError(
      response.status === 401 || response.status === 403
        ? "GREEN-API отклонил данные подключения."
        : "Не удалось отправить сообщение через GREEN-API.",
    );
  }
}

export async function receiveNotification(
  { idInstance, apiTokenInstance }: ConnectionCredentials,
  signal: AbortSignal,
): Promise<GreenApiNotification | null> {
  const response = await fetch(
    `${API_URL}/waInstance${encodeURIComponent(idInstance)}/receiveNotification/${encodeURIComponent(apiTokenInstance)}?receiveTimeout=5`,
    { signal },
  );

  if (response.status === 204) return null;
  if (!response.ok) {
    throw new GreenApiError(
      response.status === 401 || response.status === 403
        ? "GREEN-API отклонил данные подключения при получении уведомлений. Проверьте idInstance и apiTokenInstance."
        : "Не удалось получить уведомления GREEN-API. Проверьте подключение и повторите вход.",
      response.status === 401 || response.status === 403,
    );
  }

  return (await response.json()) as GreenApiNotification;
}

export async function deleteNotification(
  { idInstance, apiTokenInstance }: ConnectionCredentials,
  receiptId: number,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/waInstance${encodeURIComponent(idInstance)}/deleteNotification/${encodeURIComponent(apiTokenInstance)}/${receiptId}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw new GreenApiError(
      response.status === 401 || response.status === 403
        ? "GREEN-API отклонил данные подключения при удалении уведомления. Проверьте idInstance и apiTokenInstance."
        : "Не удалось удалить уведомление GREEN-API.",
      response.status === 401 || response.status === 403,
    );
  }
}
