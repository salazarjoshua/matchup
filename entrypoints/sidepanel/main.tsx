import App from "./App.tsx";
import { loadInterFont } from "@/utils/matchup-font";
import ReactDOM from "react-dom/client";
import "@/assets/tailwind.css";

loadInterFont();

// No StrictMode here: it double-invokes effects in dev, and this panel's port is
// observable from the page — connecting, dropping and reconnecting flickers the
// floating panel back in between.
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
