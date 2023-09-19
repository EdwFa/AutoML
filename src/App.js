import "./App.css";
import { useEffect } from "react";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// Импорт страниц
import { LogIn } from "./api/SignUp/Login/LogIn.js";
import Doc1 from "./pages/Doc1";
import Doc2 from "./pages/Doc2";
import { Registration } from "./api/SignUp/Reg/Registation.js";

import { Main } from "./api/Main.js";

function App() {
  useEffect(() => {
    // 👇️ adding multiple classes to the body element
    document.body.classList.add("bg-white", "dark:bg-gray-900");
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LogIn />} />
        <Route path="/doc1" element={<Doc1 />} />
        <Route path="/doc2" element={<Doc2 />} />
        <Route path="/sign-up" element={<Registration />} />
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}

export default App;
