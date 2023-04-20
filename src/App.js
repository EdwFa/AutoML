import './App.css';
import { useEffect } from 'react';

// Импорт страниц
import Main from "./pages/Main";
import Auth from './pages/Auth';
import { Account } from './api/Account.js';
import Reg from './pages/Reg';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  useEffect(() => {
    // 👇️ adding multiple classes to the body element
    document.body.classList.add(
      'bg-gray-100',
      'dark:bg-gray-900',
    );
  }, []);

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Auth />} />
        <Route path='/main' element={<Main />} />
        <Route path='/account' element={<Account />} />
        <Route path='/registration' element={<Reg />} />
      </Routes>
    </Router>
  );

}

export default App;