import { GlobalStyles } from "@contentful/f36-components";
import { SDKProvider } from "@contentful/react-apps-toolkit";
import { createRoot } from "react-dom/client";
import App from "./App";
import LocalhostWarning from "./components/LocalhostWarning";
import { ContentfulProvider } from "./contexts/ContentfulContext";
import { AppStateProvider } from "./contexts/AppStateContext";
import "@contentful/f36-tokens/dist/css/index.css";

const container = document.getElementById("root")!;
const root = createRoot(container);

if (process.env.NODE_ENV === "development" && window.self === window.top) {
    // You can remove this if block before deploying your app
    root.render(<LocalhostWarning />);
} else {
    root.render(
        <SDKProvider>
            <ContentfulProvider>
                <AppStateProvider>
                    <GlobalStyles />
                    <App />
                </AppStateProvider>
            </ContentfulProvider>
        </SDKProvider>,
    );
}
