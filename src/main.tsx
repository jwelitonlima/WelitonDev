// src/main.tsx — ponto de entrada. O rastreador do EspIAn inicia antes do React montar a tela.
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initEspian } from "./lib/espian";

initEspian();

createRoot(document.getElementById("root")!).render(<App />);
