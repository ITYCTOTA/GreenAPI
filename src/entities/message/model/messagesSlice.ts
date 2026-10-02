import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type MessageDirection = "incoming" | "outgoing";

export type Message = {
  id: string;
  chatId: string;
  text: string;
  direction: MessageDirection;
  createdAt: string;
  status: "sending" | "sent" | "error";
};

type MessagesState = { items: Message[] };

const messagesSlice = createSlice({
  name: "messages",
  initialState: { items: [] } as MessagesState,
  reducers: {
    addMessage(state, action: PayloadAction<Message>) {
      if (!state.items.some((message) => message.id === action.payload.id)) {
        state.items.push(action.payload);
      }
    },
    clearMessages(state) {
      state.items = [];
    },
    setMessageStatus(
      state,
      action: PayloadAction<{ id: string; status: Message["status"] }>,
    ) {
      const message = state.items.find((item) => item.id === action.payload.id);
      if (message) {
        message.status = action.payload.status;
      }
    },
  },
});

export const { addMessage, clearMessages, setMessageStatus } =
  messagesSlice.actions;
export const messagesReducer = messagesSlice.reducer;
