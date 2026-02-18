import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";
import NotFound from "./NotFound";
import Index from "./Index";
import "./index.css";

const App = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
);

createRoot(document.getElementById("root")!).render(<App />);
