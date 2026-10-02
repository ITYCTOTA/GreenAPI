import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export const CONNECTION_STORAGE_KEY = "green-api-connection";
export type ConnectionStatus = "idle" | "checking" | "connected" | "error";
export type ConnectionCredentials = {
  idInstance: string;
  apiTokenInstance: string;
};
type ConnectionState = ConnectionCredentials & {
  status: ConnectionStatus;
  error: string | null;
};

function getInitialState(): ConnectionState {
  try {
    const saved = localStorage.getItem(CONNECTION_STORAGE_KEY);
    if (saved) {
      const credentials = JSON.parse(saved) as Partial<ConnectionCredentials>;
      if (credentials.idInstance && credentials.apiTokenInstance) {
        return {
          idInstance: credentials.idInstance,
          apiTokenInstance: credentials.apiTokenInstance,
          status: "checking",
          error: null,
        };
      }
    }
  } catch {
    /* Ignore unavailable or malformed local storage. */
  }

  return { idInstance: "", apiTokenInstance: "", status: "idle", error: null };
}

const connectionSlice = createSlice({
  name: "connection",
  initialState: getInitialState,
  reducers: {
    startConnectionCheck(state) {
      state.status = "checking";
      state.error = null;
    },
    connect(state, action: PayloadAction<ConnectionCredentials>) {
      state.idInstance = action.payload.idInstance;
      state.apiTokenInstance = action.payload.apiTokenInstance;
      state.status = "connected";
      state.error = null;
    },
    setConnectionError(state, action: PayloadAction<string>) {
      state.status = "error";
      state.error = action.payload;
    },
    disconnect(): ConnectionState {
      return {
        idInstance: "",
        apiTokenInstance: "",
        status: "idle",
        error: null,
      };
    },
  },
});

export const { connect, disconnect, setConnectionError, startConnectionCheck } =
  connectionSlice.actions;
export const connectionReducer = connectionSlice.reducer;
