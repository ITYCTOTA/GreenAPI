import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import type { RootState } from "@app/store/store";
import { upsertChatPreview } from "@entities/chat/model/chatsSlice";
import { setConnectionError } from "@entities/connection/model/connectionSlice";
import {
  addMessage,
  type MessageDirection,
} from "@entities/message/model/messagesSlice";
import {
  deleteNotification,
  GreenApiError,
  receiveNotification,
  type GreenApiNotification,
} from "@shared/api/greenApiClient";

const INITIAL_RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 30_000;

function waitForRetry(delayMs: number, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve(false);
      return;
    }

    const finish = (shouldContinue: boolean) => {
      clearTimeout(timeoutId);
      signal.removeEventListener("abort", onAbort);
      resolve(shouldContinue);
    };
    const timeoutId = setTimeout(() => finish(true), delayMs);
    const onAbort = () => finish(false);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

function getTextMessage(notification: GreenApiNotification) {
  const { body } = notification;
  const direction: MessageDirection | null =
    body.typeWebhook === "incomingMessageReceived"
      ? "incoming"
      : body.typeWebhook === "outgoingMessageReceived"
        ? "outgoing"
        : null;

  if (!direction || body.messageData?.typeMessage !== "textMessage")
    return null;
  const chatId = body.senderData?.chatId;
  const text = body.messageData.textMessageData?.textMessage;
  return chatId && text ? { chatId, text, direction } : null;
}

export function IncomingMessagesPoller() {
  const dispatch = useDispatch();
  const connection = useSelector((state: RootState) => state.connection);
  useEffect(() => {
    if (connection.status !== "connected") return;

    const controller = new AbortController();
    let isActive = true;

    async function processNotification(notification: GreenApiNotification) {
      const message = getTextMessage(notification);
      if (message) {
        const phone = message.chatId.replace(/@c\.us$/, "");
        dispatch(
          upsertChatPreview({
            id: message.chatId,
            phone,
            title: notification.body.senderData?.senderName || phone,
            lastMessage: message.text,
          }),
        );

        dispatch(
          addMessage({
            id: `${message.direction}-${notification.receiptId}`,
            chatId: message.chatId,
            text: message.text,
            direction: message.direction,
            createdAt: notification.body.timestamp
              ? new Date(notification.body.timestamp * 1_000).toISOString()
              : new Date().toISOString(),
            status: "sent",
          }),
        );
      }

      await deleteNotification(connection, notification.receiptId);
    }

    async function poll() {
      let retryDelayMs = INITIAL_RETRY_DELAY_MS;
      while (isActive) {
        try {
          const notification = await receiveNotification(
            connection,
            controller.signal,
          );
          if (notification) await processNotification(notification);
          retryDelayMs = INITIAL_RETRY_DELAY_MS;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError")
            break;

          if (!isActive) break;
          if (error instanceof GreenApiError && error.authentication) {
            dispatch(
              setConnectionError(
                error instanceof Error
                  ? error.message
                  : "Не удалось получить уведомления GREEN-API.",
              ),
            );
            break;
          }

          if (!(await waitForRetry(retryDelayMs, controller.signal))) break;
          retryDelayMs = Math.min(retryDelayMs * 2, MAX_RETRY_DELAY_MS);
        }
      }
    }

    void poll();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [connection, dispatch]);

  return null;
}
