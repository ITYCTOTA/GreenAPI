import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type ChatDraftsState = { byChatId: Record<string, string> };

const chatDraftsSlice = createSlice({
  name: "chatDrafts",
  initialState: { byChatId: {} } as ChatDraftsState,
  reducers: {
    setChatDraft(
      state,
      action: PayloadAction<{ chatId: string; text: string }>,
    ) {
      state.byChatId[action.payload.chatId] = action.payload.text;
    },
    clearChatDraftIfMatches(
      state,
      action: PayloadAction<{ chatId: string; text: string }>,
    ) {
      if (state.byChatId[action.payload.chatId] === action.payload.text) {
        state.byChatId[action.payload.chatId] = "";
      }
    },
  },
});

export const { clearChatDraftIfMatches, setChatDraft } = chatDraftsSlice.actions;
export const chatDraftsReducer = chatDraftsSlice.reducer;
