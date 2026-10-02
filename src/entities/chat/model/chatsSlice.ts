import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Chat = {
  id: string;
  phone: string;
  title: string;
  lastMessage: string;
};

type ChatsState = { items: Chat[] };

const chatsSlice = createSlice({
  name: "chats",
  initialState: { items: [] } as ChatsState,
  reducers: {
    addChat(state, action: PayloadAction<Chat>) {
      state.items.unshift(action.payload);
    },
    upsertChatPreview(state, action: PayloadAction<Chat>) {
      const existingChat = state.items.find(
        (chat) => chat.id === action.payload.id,
      );
      if (existingChat) {
        existingChat.lastMessage = action.payload.lastMessage;
      } else {
        state.items.unshift(action.payload);
      }
    },
    clearChats(state) {
      state.items = [];
    },
    updateChatPreview(
      state,
      action: PayloadAction<{ id: string; lastMessage: string }>,
    ) {
      const chat = state.items.find((item) => item.id === action.payload.id);
      if (chat) {
        chat.lastMessage = action.payload.lastMessage;
      }
    },
  },
});

export const {
  addChat,
  clearChats,
  updateChatPreview,
  upsertChatPreview,
} = chatsSlice.actions;
export const chatsReducer = chatsSlice.reducer;
