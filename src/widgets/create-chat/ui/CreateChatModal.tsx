import { useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import type { RootState } from "@app/store/store";
import { addChat } from "@entities/chat/model/chatsSlice";

import "../create-chat.css";

type CreateChatModalProps = { onClose: () => void };

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export function CreateChatModal({ onClose }: CreateChatModalProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chats = useSelector((state: RootState) => state.chats.items);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const digits = normalizePhone(phone);

    if (digits.length < 8 || digits.length > 15) {
      setError("Введите номер телефона от 8 до 15 цифр.");
      return;
    }

    const chatId = `${digits}@c.us`;
    const existingChat = chats.find((chat) => chat.id === chatId);
    if (existingChat) {
      navigate(`/chats/${existingChat.id}`);
      onClose();
      return;
    }

    dispatch(
      addChat({
        id: chatId,
        phone: `+${digits}`,
        title: `+${digits}`,
        lastMessage: "Нет сообщений",
      }),
    );
    navigate(`/chats/${chatId}`);
    onClose();
  }

  return (
    <div
      className="create-chat-modal"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="create-chat-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-chat-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="create-chat-title">Новый чат</h2>
        <p>Введите номер получателя в международном формате.</p>
        <form onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Номер телефона</span>
            <input
              className="text-input"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+7 999 123-45-67"
              autoFocus
            />
          </label>
          {error && (
            <p className="create-chat-modal__error" role="alert">
              {error}
            </p>
          )}
          <div className="create-chat-modal__actions">
            <button type="button" onClick={onClose}>
              Отмена
            </button>
            <button className="button--primary" type="submit">
              Создать чат
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
