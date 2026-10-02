import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";

import type { RootState } from "@app/store/store";
import chatIcon from "@shared/icons/chat-round.svg";
import personIcon from "@shared/icons/person-circle.svg";
import {
  CONNECTION_STORAGE_KEY,
  disconnect,
} from "@entities/connection/model/connectionSlice";
import { clearChats } from "@entities/chat/model/chatsSlice";
import { clearMessages } from "@entities/message/model/messagesSlice";
import { ROUTES } from "@shared/lib/routes";
import { CreateChatModal } from "@widgets/create-chat";

import "../control-panel.css";

export function ControlPanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chats = useSelector((state: RootState) => state.chats.items);
  const messages = useSelector((state: RootState) => state.messages.items);
  const sortedChats = useMemo(() => {
    const latestMessageAtByChatId = new Map<string, number>();

    for (const message of messages) {
      const createdAt = Date.parse(message.createdAt);
      const latestMessageAt = latestMessageAtByChatId.get(message.chatId);
      if (
        Number.isFinite(createdAt) &&
        (latestMessageAt === undefined || createdAt > latestMessageAt)
      ) {
        latestMessageAtByChatId.set(message.chatId, createdAt);
      }
    }

    return chats
      .map((chat, index) => ({
        chat,
        index,
        latestMessageAt:
          latestMessageAtByChatId.get(chat.id) ?? Number.NEGATIVE_INFINITY,
      }))
      .sort(
        (left, right) =>
          right.latestMessageAt - left.latestMessageAt ||
          left.index - right.index,
      )
      .map(({ chat }) => chat);
  }, [chats, messages]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCreateChatOpen, setIsCreateChatOpen] = useState(false);

  function handleLogout() {
    try {
      localStorage.removeItem(CONNECTION_STORAGE_KEY);
    } finally {
      dispatch(disconnect(undefined));
      dispatch(clearChats(undefined));
      dispatch(clearMessages(undefined));
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }

  return (
    <aside className="control-panel">
      <nav
        className="control-panel__navigation"
        aria-label="Основная навигация"
      >
        <NavLink
          className={({ isActive }) =>
            `navigation-control${isActive ? " navigation-control--active" : ""}`
          }
          to={ROUTES.CHATS}
        >
          <img className="navigation-control__icon" src={chatIcon} alt="" />
          <span className="navigation-control__label">Чаты</span>
        </NavLink>
        <div className="profile-control">
          <button
            className="navigation-control profile-control__button"
            type="button"
            aria-label="Открыть меню профиля"
            aria-expanded={isProfileMenuOpen}
            onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
          >
            <img className="navigation-control__icon" src={personIcon} alt="" />
            <span className="navigation-control__label">Профиль</span>
          </button>
          {isProfileMenuOpen && (
            <div className="profile-control__menu" role="menu">
              <button type="button" role="menuitem" onClick={handleLogout}>
                Выйти
              </button>
            </div>
          )}
        </div>
      </nav>

      <section className="control-panel__content">
        <header className="control-panel__header">
          <h1>Чаты</h1>
          <button
            className="control-panel__add-button"
            type="button"
            aria-label="Создать чат"
            onClick={() => setIsCreateChatOpen(true)}
          >
            +
          </button>
        </header>
        <input
          className="control-panel__search"
          type="search"
          placeholder="Найти"
        />
        <ul className="control-panel__chat-list">
          {sortedChats.map((chat) => (
            <li key={chat.id}>
              <NavLink className="chat-preview" to={`/chats/${chat.id}`}>
                <span className="chat-preview__avatar">
                  {Array.from(chat.title)[0]}
                </span>
                <span className="chat-preview__body">
                  <span className="chat-preview__top-row">
                    <span className="chat-preview__name">{chat.title}</span>
                  </span>
                  <span className="chat-preview__message">
                    {chat.lastMessage}
                  </span>
                </span>
              </NavLink>
            </li>
          ))}
          {!chats.length && (
            <li className="control-panel__empty-list">
              Создайте первый чат кнопкой «+».
            </li>
          )}
        </ul>
      </section>
      {isCreateChatOpen && (
        <CreateChatModal onClose={() => setIsCreateChatOpen(false)} />
      )}
    </aside>
  );
}
