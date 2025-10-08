import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Pokemon from './Pokemon';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pokemon/:name" element={<Pokemon />} />
    </Routes>
  );
}

export default App;
