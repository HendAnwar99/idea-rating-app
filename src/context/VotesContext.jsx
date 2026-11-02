import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'ideaRatingVotedIdeas';

// ── Helpers ──────────────────────────────────────────────────────────────────
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

// ── Context ──────────────────────────────────────────────────────────────────
const VotesContext = createContext(null);

export function VotesProvider({ children }) {
  // votedIdeas: { [ideaId]: boolean }
  const [votedIdeas, setVotedIdeas] = useState(() => loadFromStorage());

  // Persist every change
  useEffect(() => {
    saveToStorage(votedIdeas);
  }, [votedIdeas]);

  /** Returns the effective vote count for an idea */
  const getVoteCount = (ideaId) => (votedIdeas[ideaId] === true ? 1 : 0);

  /** Returns whether the current user has voted for an idea */
  const hasVoted = (ideaId) => votedIdeas[ideaId] === true;

  /** Toggle vote for an idea (vote or un-vote) */
  const toggleVote = (ideaId) => {
    setVotedIdeas(prev => {
      const updated = { ...prev, [ideaId]: !prev[ideaId] };
      return updated;
    });
  };

  return (
    <VotesContext.Provider value={{ getVoteCount, hasVoted, toggleVote }}>
      {children}
    </VotesContext.Provider>
  );
}

export function useVotes() {
  const ctx = useContext(VotesContext);
  if (!ctx) throw new Error('useVotes must be used inside VotesProvider');
  return ctx;
}
