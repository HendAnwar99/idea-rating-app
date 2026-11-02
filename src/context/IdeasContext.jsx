import React, { createContext, useContext, useState } from 'react';

// Ideas and their ratings live only in this browser's localStorage.
const STORAGE_KEY = 'ideaRatingIdeas';

function loadIdeas() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(parsed)) return [];
    // Ideas saved before inspector details existed only have a plain `user` name.
    return parsed.map(idea => ({
      ...idea,
      inspector: idea.inspector ?? { name: idea.user, email: '', inspectorId: '' },
    }));
  } catch {
    return [];
  }
}

function saveIdeas(ideas) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
    return true;
  } catch {
    return false;
  }
}

function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const IdeasContext = createContext(null);

export function IdeasProvider({ children }) {
  const [ideas, setIdeas] = useState(loadIdeas);

  // Returns false when the browser refused the write, so screens never report a
  // save that did not happen. Re-reads storage so a second tab's data is kept.
  const commit = (update) => {
    const next = update(loadIdeas());
    if (!saveIdeas(next)) return false;
    setIdeas(next);
    return true;
  };

  const addIdea = (fields) =>
    commit(current => [
      ...current,
      { ...fields, id: createId(), createdAt: new Date().toISOString(), ratings: [] },
    ]);

  const addRating = (ideaId, { stars, comment, inspector }) =>
    commit(current =>
      current.map(idea =>
        idea.id === ideaId
          ? {
              ...idea,
              ratings: [
                ...idea.ratings,
                { id: createId(), stars, comment, inspector, createdAt: new Date().toISOString() },
              ],
            }
          : idea
      )
    );

  const getIdea = (ideaId) => ideas.find(idea => idea.id === ideaId);

  return (
    <IdeasContext.Provider value={{ ideas, getIdea, addIdea, addRating }}>
      {children}
    </IdeasContext.Provider>
  );
}

export function useIdeas() {
  const ctx = useContext(IdeasContext);
  if (!ctx) throw new Error('useIdeas must be used inside IdeasProvider');
  return ctx;
}
