import { useMemo, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useParams } from "react-router-dom";

import type { RootState } from "@app/store/store";
import {
  clearChatDraftIfMatches,
  setChatDraft,
} from "@entities/chat/model/chatDraftsSlice";
import { updateChatPreview } from "@entities/chat/model/chatsSlice";
import {
  addMessage,
  setMessageStatus,
} from "@entities/message/model/messagesSlice";
import { sendTextMessage } from "@shared/api/greenApiClient";
import leftArrow from "@shared/icons/left-arrow.svg";
import { ROUTES } from "@shared/lib/routes";

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function SelectedChat() {
  const dispatch = useDispatch();
  const { chatId } = useParams();
  const chat = useSelector((state: RootState) =>
    state.chats.items.find((item) => item.id === chatId),
  );
  const allMessages = useSelector((state: RootState) => state.messages.items);
  const messages = useMemo(
    () => allMessages.filter((item) => item.chatId === chatId),
    [allMessages, chatId],
  );
  const credentials = useSelector((state: RootState) => state.connection);
  const [sendingChats, setSendingChats] = useState<Record<string, boolean>>({});
  const [sendErrors, setSendErrors] = useState<Record<string, string | null>>({});
  const text = useSelector(
    (state: RootState) => state.chatDrafts.byChatId[chatId ?? ""] ?? "",
  );

  if (!chat || !chatId) {
    return <Navigate to={ROUTES.CHATS} replace />;
  }

  const activeChat = chat;
  const activeChatId = chatId;
  const isSending = sendingChats[activeChatId] ?? false;
  const sendError = sendErrors[activeChatId] ?? null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const messageText = text.trim();
    if (!messageText || isSending) return;

    const now = new Date();
    const messageId = crypto.randomUUID();
    const submittedDraft = text;
    dispatch(
      addMessage({
        id: messageId,
        chatId: activeChatId,
        text: messageText,
        direction: "outgoing",
        createdAt: now.toISOString(),
        status: "sending",
      }),
    );
    setSendingChats((current) => ({ ...current, [activeChatId]: true }));
    setSendErrors((current) => ({ ...current, [activeChatId]: null }));

    try {
      await sendTextMessage({
        idInstance: credentials.idInstance,
        apiTokenInstance: credentials.apiTokenInstance,
        phone: activeChat.phone,
        message: messageText,
      });
      dispatch(setMessageStatus({ id: messageId, status: "sent" }));
      dispatch(updateChatPreview({ id: activeChatId, lastMessage: messageText }));
      dispatch(
        clearChatDraftIfMatches({
          chatId: activeChatId,
          text: submittedDraft,
        }),
      );
    } catch (caughtError) {
      dispatch(setMessageStatus({ id: messageId, status: "error" }));
      const errorMessage =
        caughtError instanceof Error
          ? caughtError.message
          : "Не удалось отправить сообщение.";
      setSendErrors((current) => ({ ...current, [activeChatId]: errorMessage }));
    } finally {
      setSendingChats((current) => ({ ...current, [activeChatId]: false }));
    }
  }

  return (
    <article className="selected-chat">
      <header className="selected-chat__header">
        <Link
          className="selected-chat__back"
          to={ROUTES.CHATS}
          aria-label="Вернуться к чатам"
        >
          <img className="selected-chat__back-icon" src={leftArrow} alt="" />
        </Link>
        <div className="selected-chat__title">
          <h1>{activeChat.title}</h1>
          <p>{activeChat.phone}</p>
        </div>
      </header>
      <div className="selected-chat__messages">
        {!messages.length && (
          <p className="selected-chat__placeholder">
            Напишите первое сообщение.
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-bubble message-bubble--${message.direction}`}
          >
            <p>{message.text}</p>
            <time dateTime={message.createdAt}>
              {message.status === "sending"
                ? "Отправка…"
                : message.status === "error"
                  ? "Ошибка"
                  : formatTime(new Date(message.createdAt))}
            </time>
          </div>
        ))}
      </div>
      {sendError && (
        <p className="message-composer__error" role="alert">
          {sendError}
        </p>
      )}
      <form className="message-composer" onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(event) =>
            dispatch(
              setChatDraft({ chatId: activeChatId, text: event.target.value }),
            )
          }
          placeholder="Сообщение"
          aria-label="Текст сообщения"
        />
        <button type="submit" disabled={!text.trim() || isSending}>
          {isSending ? "Отправка…" : "Отправить"}
        </button>
      </form>
    </article>
  );
}
