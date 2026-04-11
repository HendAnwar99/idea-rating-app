import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import IdeaDetailsPage from './pages/IdeaDetailsPage';
import AddIdeaPage from './pages/AddIdeaPage';

function App() {
  return (
    <div className="bg-surface font-sans text-text-dark">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/idea/:id" element={<IdeaDetailsPage />} />
        <Route path="/add-idea" element={<AddIdeaPage />} />
      </Routes>
    </div>
  );
}

export default App;
