import { configureStore } from "@reduxjs/toolkit";

import { connectionReducer } from "@entities/connection/model/connectionSlice";
import { chatsReducer } from "@entities/chat/model/chatsSlice";
import { chatDraftsReducer } from "@entities/chat/model/chatDraftsSlice";
import { messagesReducer } from "@entities/message/model/messagesSlice";

export const store = configureStore({
  reducer: {
    connection: connectionReducer,
    chats: chatsReducer,
    chatDrafts: chatDraftsReducer,
    messages: messagesReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
