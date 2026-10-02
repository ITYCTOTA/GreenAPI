import { IncomingMessagesPoller } from "./providers/IncomingMessagesPoller";
import { ConnectionInitializer } from "./providers/ConnectionInitializer";
import { RouterProvider } from "./providers/RouterProvider";
import { StoreProvider } from "./providers/StoreProvider";
import "./styles/global.css";

function App() {
  return (
    <StoreProvider>
      <IncomingMessagesPoller />
      <ConnectionInitializer />
      <RouterProvider />
    </StoreProvider>
  );
}

export default App;
