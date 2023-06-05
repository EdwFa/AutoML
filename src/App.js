import './App.css';
import { useEffect } from 'react';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Импорт страниц
import { LogIn } from './api/SignUp/Login/LogIn.js';
import { Registration } from './api/SignUp/Reg/Registation.js';
import { Viewer } from './api/Viewer/Viewer.js';
import { Grafics } from './api/Grafics/Grafics.js';
import { Learning } from './api/Learning/Learning.js';
import { Statistic } from './api/Statistic/Statistic.js';


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
        <Route path='/' element={<LogIn />} />
        <Route path='/sign-up' element={<Registration />} />
        <Route path='/viewer' element={<Viewer />} />
        <Route path='/graphics' element={<Grafics />} />
        <Route path='/learning' element={<Learning />} />
        <Route path='/statistic' element={<Statistic />} />
      </Routes>
    </Router>
  );

}

export default App;