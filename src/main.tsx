import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { ConvexProvider, ConvexReactClient } from "convex/react"

createRoot(document.getElementById("root")!).render(<App />);
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
)
