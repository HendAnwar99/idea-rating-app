import React from 'react';
import { Star, ThumbsUp } from 'lucide-react';

const CommentCard = ({ comment }) => {
  const { author, text, rating, likes, date } = comment;

  // Generate stars based on rating
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-5 h-5 ${i <= rating ? 'fill-[#02c31e] text-[#02c31e]' : 'text-gray-300'}`} 
        />
      );
    }
    return stars;
  };

  return (
    <div className="border-b border-gray-100 last:border-0 py-6">
      <div className="flex justify-between items-start mb-3">
        {/* Author info (Right side in RTL) */}
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${author.color}`}>
            {author.initials}
          </div>
          <div>
            <h4 className="font-bold text-[#091040] text-sm">{author.name}</h4>
            <span className="text-xs text-gray-400">{date}</span>
          </div>
        </div>
        
        {/* Rating stars (Left side in RTL) */}
        <div className="flex gap-1">
          {renderStars()}
        </div>
      </div>
      
      {/* Comment text */}
      <p className="text-gray-600 text-sm leading-relaxed mb-4 pr-14 text-right">
        {text}
      </p>

      {/* Like button */}
      <div className="flex justify-start pr-14">
        <button className="flex items-center gap-2 text-gray-400 hover:text-green-600 transition-colors text-xs font-semibold">
          <ThumbsUp className="w-4 h-4" />
          <span>مفيد ({likes})</span>
        </button>
      </div>
    </div>
  );
};

export default CommentCard;
