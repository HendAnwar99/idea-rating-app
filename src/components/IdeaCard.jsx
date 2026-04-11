import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVotes } from '../context/VotesContext';

const IdeaCard = ({ idea }) => {
  const navigate = useNavigate();
  const { getVoteCount, hasVoted } = useVotes();

  const {
    id, rank, title, description, rating,
    categories, author, date, commentsCount
  } = idea;

  const votes = getVoteCount(id);
  const voted = hasVoted(id);

  const handleClick = () => {
    navigate(`/idea/${id}`);
  };

  // Generate stars based on rating
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'fill-[#02c31e] text-[#02c31e]' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  return (
    <div onClick={handleClick} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col cursor-pointer hover:shadow-md transition-shadow relative">

      {/* Rank Badge */}
      <div className="absolute top-6 left-6 w-8 h-8 bg-[#091040] text-white rounded-full flex items-center justify-center font-bold text-sm">
        #{rank}
      </div>

      <div className="flex-1 pr-0 pl-10">
        <h3 className="text-lg font-bold text-[#091040] mb-2 leading-tight ml-4">{title}</h3>
        <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{description}</p>

        {/* Rating and Votes */}
        <div className="flex items-center gap-2 mb-4">
          {/* Vote count with subtle highlight if voted */}
          <div className={`font-bold text-sm ${voted ? 'text-[#02c31e]' : ''}`}>
            {votes} تصويت
          </div>
          <div className="flex bg-gray-50 px-2 py-1 rounded-full gap-1">
            {renderStars()}
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">

        {/* Right side (start of flex) - Author Info */}
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${author.color}`}>
            {author.initials}
          </div>
          <div className="text-right flex flex-col">
            <span className="text-sm font-bold text-[#091040]">{author.name}</span>
            <span className="text-xs text-gray-400 font-medium">{date}</span>
          </div>
        </div>

        {/* Left side (end of flex) - Comments count */}
        <div className="flex items-center text-gray-400 gap-1.5 text-sm font-medium">
          <span>{commentsCount}</span>
          <MessageSquare className="w-4 h-4" />
        </div>
      </div>

    </div>
  );
};

export default IdeaCard;
