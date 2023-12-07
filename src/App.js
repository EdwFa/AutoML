import "./App.css";
import { useEffect } from "react";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Импорт страниц
import LogIn from "./pages/LogIn";
import Help from "./pages/Help";
import Doc1 from "./pages/Doc1";
import Doc2 from "./pages/Doc2";
import Doc3 from "./pages/Doc3";
import Doc4 from "./pages/Doc4";

import { Registration } from "./pages/Registation";
import { Main } from "./pages/Main";
import { Models } from "./pages/Models";
import { Admin } from "./pages/Admin";

function App() {
  useEffect(() => {
    // 👇️ adding multiple classes to the body element
    document.body.classList.add("bg-white", "dark:bg-gray-900");
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LogIn />} />
        <Route path="/help" element={<Help />} />
        <Route path="/doc1" element={<Doc1 />} />
        <Route path="/doc2" element={<Doc2 />} />
        <Route path="/doc3" element={<Doc3 />} />
        <Route path="/doc4" element={<Doc4 />} />
        <Route path="/sign-up" element={<Registration />} />
        <Route path="/" element={<Main />} />
        <Route path="/models" element={<Models />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;
